# Copyright 2021 Canonical Ltd.
# See LICENSE file for licensing details.

"""## Overview.

This document explains how to integrate with the Grafana charm
for the purpose of providing a dashboard which can be used by
end users. It also explains the structure of the data
expected by the `grafana-dashboard` interface, and may provide a
mechanism or reference point for providing a compatible interface
or library by providing a definitive reference guide to the
structure of relation data which is shared between the Grafana
charm and any charm providing datasource information.

## Provider Library Usage

The Grafana charm interacts with its dashboards using its charm
library. The goal of this library is to be as simple to use as
possible, and instantiation of the class with or without changing
the default arguments provides a complete use case. For the simplest
use case of a charm which bundles dashboards and provides a
`provides: grafana-dashboard` interface,

    requires:
      grafana-dashboard:
        interface: grafana_dashboard

creation of a `GrafanaDashboardProvider` object with the default arguments is
sufficient.

:class:`GrafanaDashboardProvider` expects that bundled dashboards should
be included in your charm with a default path of:

    path/to/charm.py
    path/to/src/grafana_dashboards/*.{json|json.tmpl|.tmpl}

Where the files are Grafana dashboard JSON data either from the
Grafana marketplace, or directly exported from a Grafana instance.
Refer to the [official docs](https://grafana.com/tutorials/provision-dashboards-and-data-sources/)
for more information.

When constructing a dashboard that is intended to be consumed by COS, make sure to use variables
for your datasources, and name them "prometheusds" and "lokids". You can also use the following
juju topology variables in your dashboards: $juju_model, $juju_model_uuid, $juju_application
and $juju_unit. Note, however, that if metrics are coming via peripheral charms (scrape-config
or cos-config) then topology labels would not exist.

The default constructor arguments are:

    `charm`: `self` from the charm instantiating this library
    `relation_name`: grafana-dashboard
    `dashboards_path`: "/src/grafana_dashboards"

If your configuration requires any changes from these defaults, they
may be set from the class constructor. It may be instantiated as
follows:

    from charms.grafana_k8s.v0.grafana_dashboard import GrafanaDashboardProvider

    class FooCharm:
        def __init__(self, *args):
            super().__init__(*args, **kwargs)
            ...
            self.grafana_dashboard_provider = GrafanaDashboardProvider(self)
            ...

The first argument (`self`) should be a reference to the parent (providing
dashboards), as this charm's lifecycle events will be used to re-submit
dashboard information if a charm is upgraded, the pod is restarted, or other.

An instantiated `GrafanaDashboardProvider` validates that the path specified
in the constructor (or the default) exists, reads the file contents, then
compresses them with LZMA and adds them to the application relation data
when a relation is established with Grafana.

Provided dashboards will be checked by Grafana, and a series of dropdown menus
providing the ability to select query targets by Juju Model, application instance,
and unit will be added if they do not exist.

To avoid requiring `jinja` in `GrafanaDashboardProvider` users, template validation
and rendering occurs on the other side of the relation, and relation data in
the form of:

    {
        "event": {
            "valid": `true|false`,
            "errors": [],
        }
    }

Will be returned if rendering or validation fails. In this case, the
`GrafanaDashboardProvider` object will emit a `dashboard_status_changed` event
of the type :class:`GrafanaDashboardEvent`, which will contain information
about the validation error.

This information is added to the relation data for the charms as serialized JSON
from a dict, with a structure of:
```
{
    "application": {
        "dashboards": {
            "uuid": a uuid generated to ensure a relation event triggers,
            "templates": {
                "file:{hash}": {
                    "content": `{compressed_template_data}`,
                    "charm": `charm.meta.name`,
                    "juju_topology": {
                        "model": `charm.model.name`,
                        "model_uuid": `charm.model.uuid`,
                        "application": `charm.app.name`,
                        "unit": `charm.unit.name`,
                    }
                },
                "file:{other_file_hash}": {
                    ...
                },
            },
        },
    },
}
```

This is ingested by :class:`GrafanaDashboardConsumer`, and is sufficient for configuration.

The [COS Configuration Charm](https://charmhub.io/cos-configuration-k8s) can be used to
add dashboards which are not bundled with charms.

## Consumer Library Usage

The `GrafanaDashboardConsumer` object may be used by Grafana
charms to manage relations with available dashboards. For this
purpose, a charm consuming Grafana dashboard information should do
the following things:

1. Instantiate the `GrafanaDashboardConsumer` object by providing it a
reference to the parent (Grafana) charm and, optionally, the name of
the relation that the Grafana charm uses to interact with dashboards.
This relation must confirm to the `grafana-dashboard` interface.

For example a Grafana charm may instantiate the
`GrafanaDashboardConsumer` in its constructor as follows

    from charms.grafana_k8s.v0.grafana_dashboard import GrafanaDashboardConsumer

    def __init__(self, *args):
        super().__init__(*args)
        ...
        self.grafana_dashboard_consumer = GrafanaDashboardConsumer(self)
        ...

2. A Grafana charm also needs to listen to the
`GrafanaDashboardConsumer` events emitted by the `GrafanaDashboardConsumer`
by adding itself as an observer for these events:

    self.framework.observe(
        self.grafana_source_consumer.on.sources_changed,
        self._on_dashboards_changed,
    )

Dashboards can be retrieved via the `dashboards` method:

It will be returned in the format of:

```
[
    {
        "id": unique_id,
        "relation_id": relation_id,
        "charm": the name of the charm which provided the dashboard,
        "content": compressed_template_data
    },
]
```

The consuming charm should decompress the dashboard.
"""

import hashlib
import json
import logging
import lzma
import os
import platform
import re
import subprocess
import tempfile
import uuid
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple

import yaml
from ops.charm import (
    CharmBase,
    HookEvent,
    RelationBrokenEvent,
    RelationChangedEvent,
    RelationCreatedEvent,
    RelationEvent,
    RelationRole,
)
from ops.framework import (
    EventBase,
    EventSource,
    Object,
    ObjectEvents,
    StoredDict,
    StoredList,
    StoredState,
)
from ops.model import Relation
from cosl import LZMABase64, DashboardPath40UID

# The unique Charmhub library identifier, never change it
LIBID = "c49eb9c7dfef40c7b6235ebd67010a3f"

# Increment this major API version when introducing breaking changes
LIBAPI = 0

# Increment this PATCH version before using `charmcraft publish-lib` or reset
# to 0 if you are raising the major API version

LIBPATCH = 44

PYDEPS = ["cosl >= 0.0.50"]

logger = logging.getLogger(__name__)


DEFAULT_RELATION_NAME = "grafana-dashboard"
DEFAULT_PEER_NAME = "grafana"
RELATION_INTERFACE_NAME = "grafana_dashboard"

TOPOLOGY_TEMPLATE_DROPDOWNS = [  # type: ignore
    {
        "allValue": ".*",
        "datasource": "${prometheusds}",
        "definition": "label_values(up,juju_model)",
        "description": None,
        "error": None,
        "hide": 0,
        "includeAll": True,
        "label": "Juju model",
        "multi": True,
        "name": "juju_model",
        "query": {
            "query": "label_values(up,juju_model)",
            "refId": "StandardVariableQuery",
        },
        "refresh": 1,
        "regex": "",
        "skipUrlSync": False,
        "sort": 0,
        "tagValuesQuery": "",
        "tags": [],
        "tagsQuery": "",
        "type": "query",
        "useTags": False,
    },
    {
        "allValue": ".*",
        "datasource": "${prometheusds}",
        "definition": 'label_values(up{juju_model=~"$juju_model"},juju_model_uuid)',
        "description": None,
        "error": None,
        "hide": 0,
        "includeAll": True,
        "label": "Juju model uuid",
        "multi": True,
        "name": "juju_model_uuid",
        "query": {
            "query": 'label_values(up{juju_model=~"$juju_model"},juju_model_uuid)',
            "refId": "StandardVariableQuery",
        },
        "refresh": 1,
        "regex": "",
        "skipUrlSync": False,
        "sort": 0,
        "tagValuesQuery": "",
        "tags": [],
        "tagsQuery": "",
        "type": "query",
        "useTags": False,
    },
    {
        "allValue": ".*",
        "datasource": "${prometheusds}",
        "definition": 'label_values(up{juju_model=~"$juju_model",juju_model_uuid=~"$juju_model_uuid"},juju_application)',
        "description": None,
        "error": None,
        "hide": 0,
        "includeAll": True,
        "label": "Juju application",
        "multi": True,
        "name": "juju_application",
        "query": {
            "query": 'label_values(up{juju_model=~"$juju_model",juju_model_uuid=~"$juju_model_uuid"},juju_application)',
            "refId": "StandardVariableQuery",
        },
        "refresh": 1,
        "regex": "",
        "skipUrlSync": False,
        "sort": 0,
        "tagValuesQuery": "",
        "tags": [],
        "tagsQuery": "",
        "type": "query",
        "useTags": False,
    },
    {
        "allValue": ".*",
        "datasource": "${prometheusds}",
        "definition": 'label_values(up{juju_model=~"$juju_model",juju_model_uuid=~"$juju_model_uuid",juju_application=~"$juju_application"},juju_unit)',
        "description": None,
        "error": None,
        "hide": 0,
        "includeAll": True,
        "label": "Juju unit",
        "multi": True,
        "name": "juju_unit",
        "query": {
            "query": 'label_values(up{juju_model=~"$juju_model",juju_model_uuid=~"$juju_model_uuid",juju_application=~"$juju_application"},juju_unit)',
            "refId": "StandardVariableQuery",
        },
        "refresh": 1,
        "regex": "",
        "skipUrlSync": False,
        "sort": 0,
        "tagValuesQuery": "",
        "tags": [],
        "tagsQuery": "",
        "type": "query",
        "useTags": False,
    },
]

DATASOURCE_TEMPLATE_DROPDOWNS = [  # type: ignore
    {
        "description": None,
        "error": None,
        "hide": 0,
        "includeAll": True,
        "label": "Prometheus datasource",
        "multi": True,
        "name": "prometheusds",
        "options": [],
        "query": "prometheus",
        "refresh": 1,
        "regex": "",
        "skipUrlSync": False,
        "type": "datasource",
    },
    {
        "description": None,
        "error": None,
        "hide": 0,
        "includeAll": True,
        "label": "Loki datasource",
        "multi": True,
        "name": "lokids",
        "options": [],
        "query": "loki",
        "refresh": 1,
        "regex": "",
        "skipUrlSync": False,
        "type": "datasource",
    },
]

REACTIVE_CONVERTER = {  # type: ignore
    "allValue": None,
    "datasource": "${prometheusds}",
    "definition": 'label_values(up{juju_model=~"$juju_model",juju_model_uuid=~"$juju_model_uuid",juju_application=~"$juju_application"},host)',
    "description": None,
    "error": None,
    "hide": 0,
    "includeAll": True,
    "label": "hosts",
    "multi": True,
    "name": "host",
    "options": [],
    "query": {
        "query": 'label_values(up{juju_model=~"$juju_model",juju_model_uuid=~"$juju_model_uuid",juju_application=~"$juju_application"},host)',
        "refId": "StandardVariableQuery",
    },
    "refresh": 1,
    "regex": "",
    "skipUrlSync": False,
    "sort": 1,
    "tagValuesQuery": "",
    "tags": [],
    "tagsQuery": "",
    "type": "query",
    "useTags": False,
}


class RelationNotFoundError(Exception):
    """Raised if there is no relation with the given name."""

    def __init__(self, relation_name: str):
        self.relation_name = relation_name
        self.message = "No relation named '{}' found".format(relation_name)

        super().__init__(self.message)


class RelationInterfaceMismatchError(Exception):
    """Raised if the relation with the given name has a different interface."""

    def __init__(
        self,
        relation_name: str,
        expected_relation_interface: str,
        actual_relation_interface: str,
    ):
        self.relation_name = relation_name
        self.expected_relation_interface = expected_relation_interface
        self.actual_relation_interface = actual_relation_interface
        self.message = (
            "The '{}' relation has '{}' as " "interface rather than the expected '{}'".format(
                relation_name, actual_relation_interface, expected_relation_interface
            )
        )

        super().__init__(self.message)


class RelationRoleMismatchError(Exception):
    """Raised if the relation with the given name has a different direction."""

    def __init__(
        self,
        relation_name: str,
        expected_relation_role: RelationRole,
        actual_relation_role: RelationRole,
    ):
        self.relation_name = relation_name
        self.expected_relation_interface = expected_relation_role
        self.actual_relation_role = actual_relation_role
        self.message = "The '{}' relation has role '{}' rather than the expected '{}'".format(
            relation_name, repr(actual_relation_role), repr(expected_relation_role)
        )

        super().__init__(self.message)


class InvalidDirectoryPathError(Exception):
    """Raised if the grafana dashboards folder cannot be found or is otherwise invalid."""

    def __init__(
        self,
        grafana_dashboards_absolute_path: str,
        message: str,
    ):
        self.grafana_dashboards_absolute_path = grafana_dashboards_absolute_path
        self.message = message

        super().__init__(self.message)


def _resolve_dir_against_charm_path(charm: CharmBase, *path_elements: str) -> str:
    """Resolve the provided path items against the directory of the main file.

    Look up the directory of the charmed operator file being executed. This is normally
    going to be the charm.py file of the charm including this library. Then, resolve
    the provided path elements and return its absolute path.

    Raises:
        InvalidDirectoryPathError if the resolved path does not exist or it is not a directory

    """
    charm_dir = Path(str(charm.charm_dir))
    if not charm_dir.exists() or not charm_dir.is_dir():
        # Operator Framework does not currently expose a robust
        # way to determine the top level charm source directory
        # that is consistent across deployed charms and unit tests
        # Hence for unit tests the current working directory is used
        # TODO: updated this logic when the following ticket is resolved
        # https://github.com/canonical/operator/issues/643
        charm_dir = Path(os.getcwd())

    dir_path = charm_dir.absolute().joinpath(*path_elements)

    if not dir_path.exists():
        raise InvalidDirectoryPathError(str(dir_path), "directory does not exist")
    if not dir_path.is_dir():
        raise InvalidDirectoryPathError(str(dir_path), "is not a directory")

    return str(dir_path)


def _validate_relation_by_interface_and_direction(
    charm: CharmBase,
    relation_name: str,
    expected_relation_interface: str,
    expected_relation_role: RelationRole,
) -> None:
    """Verifies that a relation has the necessary characteristics.

    Verifies that the `relation_name` provided: (1) exists in metadata.yaml,
    (2) declares as interface the interface name passed as `relation_interface`
    and (3) has the right "direction", i.e., it is a relation that `charm`
    provides or requires.

    Args:
        charm: a `CharmBase` object to scan for the matching relation.
        relation_name: the name of the relation to be verified.
        expected_relation_interface: the interface name to be matched by the
            relation named `relation_name`.
        expected_relation_role: whether the `relation_name` must be either
            provided or required by `charm`.

    Raises:
        RelationNotFoundError: If there is no relation in the charm's metadata.yaml
            named like the value of the `relation_name` argument.
        RelationInterfaceMismatchError: If the relation interface of the
            relation named as the provided `relation_name` argument does not
            match the `expected_relation_interface` argument.
        RelationRoleMismatchError: If the relation named as the provided `relation_name`
            argument has a different role than what is specified by the
            `expected_relation_role` argument.
    """
    if relation_name not in charm.meta.relations:
        raise RelationNotFoundError(relation_name)

    relation = charm.meta.relations[relation_name]

    actual_relation_interface = relation.interface_name
    if actual_relation_interface and actual_relation_interface != expected_relation_interface:
        raise RelationInterfaceMismatchError(
            relation_name, expected_relation_interface, actual_relation_interface
        )

    if expected_relation_role == RelationRole.provides:
        if relation_name not in charm.meta.provides:
            raise RelationRoleMismatchError(
                relation_name, RelationRole.provides, RelationRole.requires
            )
    elif expected_relation_role == RelationRole.requires:
        if relation_name not in charm.meta.requires:
            raise RelationRoleMismatchError(
                relation_name, RelationRole.requires, RelationRole.provides
            )
    else:
        raise Exception("Unexpected RelationDirection: {}".format(expected_relation_role))


class CharmedDashboard:
    """A helper class for handling dashboards on the requirer (Grafana) side."""

    @classmethod
    def _convert_dashboard_fields(cls, content: str, inject_dropdowns: bool = True) -> str:
        """Make sure values are present for Juju topology.

        Inserts Juju topology variables and selectors into the template, as well as
        a variable for Prometheus.
        """
        dict_content = json.loads(content)
        datasources = {}
        existing_templates = False

        template_dropdowns = (
            TOPOLOGY_TEMPLATE_DROPDOWNS + DATASOURCE_TEMPLATE_DROPDOWNS  # type: ignore
            if inject_dropdowns
            else DATASOURCE_TEMPLATE_DROPDOWNS
        )

        # If the dashboard has __inputs, get the names to replace them. These are stripped
        # from reactive dashboards in GrafanaDashboardAggregator, but charm authors in
        # newer charms may import them directly from the marketplace
        if "__inputs" in dict_content:
            for field in dict_content["__inputs"]:
                if "type" in field and field["type"] == "datasource":
                    datasources[field["name"]] = field["pluginName"].lower()
            del dict_content["__inputs"]

        # If no existing template variables exist, just insert our own
        if "templating" not in dict_content:
            dict_content["templating"] = {"list": list(template_dropdowns)}  # type: ignore
        else:
            # Otherwise, set a flag so we can go back later
            existing_templates = True
            for template_value in dict_content["templating"]["list"]:
                # Build a list of `datasource_name`: `datasource_type` mappings
                # The "query" field is actually "prometheus", "loki", "influxdb", etc
                if "type" in template_value and template_value["type"] == "datasource":
                    datasources[template_value["name"]] = template_value["query"].lower()

            # Put our own variables in the template
            for d in template_dropdowns:  # type: ignore
                if d not in dict_content["templating"]["list"]:
                    dict_content["templating"]["list"].insert(0, d)

        dict_content = cls._replace_template_fields(dict_content, datasources, existing_templates)
        return json.dumps(dict_content)

    @classmethod
    def _replace_template_fields(  # noqa: C901
        cls, dict_content: dict, datasources: dict, existing_templates: bool
    ) -> dict:
        """Make templated fields get cleaned up afterwards.

        If existing datasource variables are present, try to substitute them.
        """
        replacements = {"loki": "${lokids}", "prometheus": "${prometheusds}"}
        used_replacements = []  # type: List[str]

        # If any existing datasources match types we know, or we didn't find
        # any templating variables at all, template them.
        if datasources or not existing_templates:
            panels = dict_content.get("panels", {})
            if panels:
                dict_content["panels"] = cls._template_panels(
                    panels, replacements, used_replacements, existing_templates, datasources
                )

            # Find panels nested under rows
            rows = dict_content.get("rows", {})
            if rows:
                for row_idx, row in enumerate(rows):
                    if "panels" in row.keys():
                        rows[row_idx]["panels"] = cls._template_panels(
                            row["panels"],
                            replacements,
                            used_replacements,
                            existing_templates,
                            datasources,
                        )

                dict_content["rows"] = rows

        # Finally, go back and pop off the templates we stubbed out
        deletions = []
        for tmpl in dict_content["templating"]["list"]:
            if tmpl["name"] and tmpl["name"] in used_replacements:
                # it might happen that existing template var name is the same as the one we insert (i.e prometheusds or lokids)
                # in that case, we want to pop the existing one only.
                if tmpl not in DATASOURCE_TEMPLATE_DROPDOWNS:
                    deletions.append(tmpl)

        for d in deletions:
            dict_content["templating"]["list"].remove(d)

        return dict_content

    @classmethod
    def _template_panels(
        cls,
        panels: dict,
        replacements: dict,
        used_replacements: list,
        existing_templates: bool,
        datasources: dict,
    ) -> dict:
        """Iterate through a `panels` object and template it appropriately."""
        # Go through all the panels. If they have a datasource set, AND it's one
        # that we can convert to ${lokids} or ${prometheusds}, by stripping off the
        # ${} templating and comparing the name to the list we built, replace it,
        # otherwise, leave it alone.
        #
        for panel in panels:
            if "datasource" not in panel or not panel.get("datasource"):
                continue
            if not existing_templates:
                datasource = panel.get("datasource")
                if isinstance(datasource, str):
                    if "loki" in datasource:
                        panel["datasource"] = "${lokids}"
                    elif "grafana" in datasource:
                        continue
                    else:
                        panel["datasource"] = "${prometheusds}"
                elif isinstance(datasource, dict):
                    # In dashboards exported by Grafana 9, datasource type is dict
                    dstype = datasource.get("type", "")
                    if dstype == "loki":
                        panel["datasource"]["uid"] = "${lokids}"
                    elif dstype == "prometheus":
                        panel["datasource"]["uid"] = "${prometheusds}"
                    else:
                        logger.debug("Unrecognized datasource type '%s'; skipping", dstype)
                        continue
                else:
                    logger.error("Unknown datasource format: skipping")
                    continue
            else:
                if isinstance(panel["datasource"], str):
                    if panel["datasource"].lower() in replacements.values():
                        # Already a known template variable
                        continue
                    # Strip out variable characters and maybe braces
                    ds = re.sub(r"(\$|\{|\})", "", panel["datasource"])

                    if ds not in datasources.keys():
                        # Unknown, non-templated datasource, potentially a Grafana builtin
                        continue

                    replacement = replacements.get(datasources[ds], "")
                    if replacement:
                        used_replacements.append(ds)
                    panel["datasource"] = replacement or panel["datasource"]
                elif isinstance(panel["datasource"], dict):
                    dstype = panel["datasource"].get("type", "")
                    if panel["datasource"].get("uid", "").lower() in replacements.values():
                        # Already a known template variable
                        continue
                    # Strip out variable characters and maybe braces
                    ds = re.sub(r"(\$|\{|\})", "", panel["datasource"].get("uid", ""))

                    if ds not in datasources.keys():
                        # Unknown, non-templated datasource, potentially a Grafana builtin
                        continue

                    replacement = replacements.get(datasources[ds], "")
                    if replacement:
                        used_replacements.append(ds)
                        panel["datasource"]["uid"] = replacement
                else:
                    logger.error("Unknown datasource format: skipping")
                    continue
        return panels

    @classmethod
    def _inject_labels(cls, content: str, topology: dict, transformer: "CosTool") -> str:
        """Inject Juju topology into panel expressions via CosTool.

        A dashboard will have a structure approximating:
            {
                "__inputs": [],
                "templating": {
                    "list": [
                        {
                            "name": "prometheusds",
                            "type": "prometheus"
                        }
                    ]
                },
                "panels": [
                    {
                        "foo": "bar",
                        "targets": [
                            {
                                "some": "field",
                                "expr": "up{job="foo"}"
                            },
                            {
                                "some_other": "field",
                                "expr": "sum(http_requests_total{instance="$foo"}[5m])}
                            }
                        ],
                        "datasource": "${someds}"
                    }
                ]
            }

        `templating` is used elsewhere in this library, but the structure is not rigid. It is
        not guaranteed that a panel will actually have any targets (it could be a "spacer" with
        no datasource, hence no expression). It could have only one target. It could have multiple
        targets. It could have multiple targets of which only one has an `expr` to evaluate. We need
        to try to handle all of these concisely.

        `cos-tool` (`github.com/canonical/cos-tool` as a Go module in general)
        does not know "Grafana-isms", such as using `[$_variable]` to modify the query from the user
        interface, so we add placeholders (as `5y`, since it must parse, but a dashboard looking for
        five years for a panel query would be unusual).

        Args:
            content: dashboard content as a string
            topology: a dict containing topology values
            transformer: a 'CosTool' instance
        Returns:
            dashboard content with replaced values.
        """
        dict_content = json.loads(content)

        if "panels" not in dict_content.keys():
            return json.dumps(dict_content)

        # Go through all the panels and inject topology labels
        # Panels may have more than one 'target' where the expressions live, so that must be
        # accounted for. Additionally, `promql-transform` does not necessarily gracefully handle
        # expressions with range queries including variables. Exclude these.
        #
        # It is not a certainty that the `datasource` field will necessarily reflect the type, so
        # operate on all fields.
        panels = dict_content["panels"]
        topology_with_prefix = {"juju_{}".format(k): v for k, v in topology.items()}

        # We need to use an index so we can insert the changed element back later
        for panel_idx, panel in enumerate(panels):
            if not isinstance(panel, dict):
                continue

            # Use the index to insert it back in the same location
            panels[panel_idx] = cls._modify_panel(panel, topology_with_prefix, transformer)

        return json.dumps(dict_content)

    @classmethod
    def _modify_panel(cls, panel: dict, topology: dict, transformer: "CosTool") -> dict:
        """Inject Juju topology into panel expressions via CosTool.

        Args:
            panel: a dashboard panel as a dict
            topology: a dict containing topology values
            transformer: a 'CosTool' instance
        Returns:
            the panel with injected values
        """
        if "targets" not in panel.keys():
            return panel

        # Pre-compile a regular expression to grab values from inside of []
        range_re = re.compile(r"\[(?P<value>.*?)\]")
        # Do the same for any offsets
        offset_re = re.compile(r"offset\s+(?P<value>-?\s*[$\w]+)")

        known_datasources = {"${prometheusds}": "promql", "${lokids}": "logql"}

        targets = panel["targets"]

        # We need to use an index so we can insert the changed element back later
        for idx, target in enumerate(targets):
            # If there's no expression, we don't need to do anything
            if "expr" not in target.keys():
                continue
            expr = target["expr"]

            if "datasource" not in panel.keys():
                continue

            if isinstance(panel["datasource"], str):
                if panel["datasource"] not in known_datasources:
                    continue
                querytype = known_datasources[panel["datasource"]]
            elif isinstance(panel["datasource"], dict):
                if panel["datasource"]["uid"] not in known_datasources:
                    continue
                querytype = known_datasources[panel["datasource"]["uid"]]
            else:
                logger.error("Unknown datasource format: skipping")
                continue

            # Capture all values inside `[]` into a list which we'll iterate over later to
            # put them back in-order. Then apply the regex again and replace everything with
            # `[5y]` so promql/parser will take it.
            #
            # Then do it again for offsets
            range_values = [m.group("value") for m in range_re.finditer(expr)]
            expr = range_re.sub(r"[5y]", expr)

            offset_values = [m.group("value") for m in offset_re.finditer(expr)]
            expr = offset_re.sub(r"offset 5y", expr)
            # Retrieve the new expression (which may be unchanged if there were no label
            # matchers in the expression, or if tt was unable to be parsed like logql. It's
            # virtually impossible to tell from any datasource "name" in a panel what the
            # actual type is without re-implementing a complete dashboard parser, but no
            # harm will some from passing invalid promql -- we'll just get the original back.
            #
            replacement = transformer.inject_label_matchers(expr, topology, querytype)

            if replacement == target["expr"]:
                # promql-transform caught an error. Move on
                continue

            # Go back and substitute values in [] which were pulled out
            # Enumerate with an index... again. The same regex is ok, since it will still match
            # `[(.*?)]`, which includes `[5y]`, our placeholder
            for i, match in enumerate(range_re.finditer(replacement)):
                # Replace one-by-one, starting from the left. We build the string back with
                # `str.replace(string_to_replace, replacement_value, count)`. Limit the count
                # to one, since we are going through one-by-one through the list we saved earlier
                # in `range_values`.
                replacement = replacement.replace(
                    "[{}]".format(match.group("value")),
                    "[{}]".format(range_values[i]),
                    1,
                )

            for i, match in enumerate(offset_re.finditer(replacement)):
                # Replace one-by-one, starting from the left. We build the string back with
                # `str.replace(string_to_replace, replacement_value, count)`. Limit the count
                # to one, since we are going through one-by-one through the list we saved earlier
                # in `range_values`.
                replacement = replacement.replace(
                    "offset {}".format(match.group("value")),
                    "offset {}".format(offset_values[i]),
                    1,
                )

            # Use the index to insert it back in the same location
            targets[idx]["expr"] = replacement

        panel["targets"] = targets
        return panel

    @classmethod
    def _content_to_dashboard_object(
        cls,
        *,
        charm_name,
        content: str,
        juju_topology: dict,
        inject_dropdowns: bool = True,
        dashboard_alt_uid: Optional[str] = None,
    ) -> Dict:
        """Helper method for keeping a consistent stored state schema for the dashboard and some metadata.

        Args:
            charm_name: Charm name (although the aggregator passes the app name).
            content: The compressed dashboard.
            juju_topology: This is not actually used in the dashboards, but is present to provide a secondary
              salt to ensure uniqueness in the dict keys in case individual charm units provide dashboards.
            inject_dropdowns: Whether to auto-render topology dropdowns.
            dashboard_alt_uid: Alternative uid used for dashboards added programmatically.
        """
        ret = {
            "charm": charm_name,
            "content": content,
            "juju_topology": juju_topology if inject_dropdowns else {},
            "inject_dropdowns": inject_dropdowns,
        }

        if dashboard_alt_uid is not None:
            ret["dashboard_alt_uid"] = dashboard_alt_uid

        return ret

    @classmethod
    def _generate_alt_uid(cls, charm_name: str, key: str) -> str:
        """Generate alternative uid for dashboards.

        Args:
            charm_name: The name of the charm (not app; from metadata).
            key: A string used (along with charm.meta.name) to build the hash uid.

        Returns: A hash string.
        """
        raw_dashboard_alt_uid = "{}-{}".format(charm_name, key)
        return hashlib.shake_256(raw_dashboard_alt_uid.encode("utf-8")).hexdigest(8)

    @classmethod
    def _replace_uid(
        cls, *, dashboard_dict: dict, dashboard_path: Path, charm_dir: Path, charm_name: str
    ):
        # If we're running this from within an aggregator (such as grafana agent), then the uid was
        # already rendered there, so we do not want to overwrite it with a uid generated from aggregator's info.
        # We overwrite the uid only if it's not a valid "Path40" uid.
        if not DashboardPath40UID.is_valid(original_uid := dashboard_dict.get("uid", "")):
            rel_path = str(
                dashboard_path.relative_to(charm_dir)
                if dashboard_path.is_absolute()
                else dashboard_path
            )
            dashboard_dict["uid"] = DashboardPath40UID.generate(charm_name, rel_path)
            logger.debug(
                "Processed dashboard '%s': replaced original uid '%s' with '%s'",
                dashboard_path,
                original_uid,
                dashboard_dict["uid"],
            )
        else:
            logger.debug(
                "Processed dashboard '%s': kept original uid '%s'", dashboard_path, original_uid
            )

    @classmethod
    def _add_tags(cls, dashboard_dict: dict, charm_name: str):
        tags: List[str] = dashboard_dict.get("tags", [])
        if not any(tag.startswith("charm: ") for tag in tags):
            tags.append(f"charm: {charm_name}")
        dashboard_dict["tags"] = tags

    @classmethod
    def load_dashboards_from_dir(
        cls,
        *,
        dashboards_path: Path,
        charm_name: str,
        charm_dir: Path,
        inject_dropdowns: bool,
        juju_topology: dict,
        path_filter: Callable[[Path], bool] = lambda p: True,
    ) -> dict:
        """Load dashboards files from directory into a mapping from "dashboard id" to a so-called "dashboard object"."""

        # Path.glob uses fnmatch on the backend, which is pretty limited, so use a
        # custom function for the filter
        def _is_dashboard(p: Path) -> bool:
            return (
                p.is_file()
                and p.name.endswith((".json", ".json.tmpl", ".tmpl"))
                and path_filter(p)
            )

        dashboard_templates = {}

        for path in filter(_is_dashboard, Path(dashboards_path).glob("*")):
            try:
                dashboard_dict = json.loads(path.read_bytes())
            except json.JSONDecodeError as e:
                logger.error("Failed to load dashboard '%s': %s", path, e)
                continue
            if type(dashboard_dict) is not dict:
                logger.error(
                    "Invalid dashboard '%s': expected dict, got %s", path, type(dashboard_dict)
                )

            cls._replace_uid(
                dashboard_dict=dashboard_dict,
                dashboard_path=path,
                charm_dir=charm_dir,
                charm_name=charm_name,
            )

            cls._add_tags(dashboard_dict=dashboard_dict, charm_name=charm_name)

            id = "file:{}".format(path.stem)
            dashboard_templates[id] = cls._content_to_dashboard_object(
                charm_name=charm_name,
                content=LZMABase64.compress(json.dumps(dashboard_dict)),
                dashboard_alt_uid=cls._generate_alt_uid(charm_name, id),
                inject_dropdowns=inject_dropdowns,
                juju_topology=juju_topology,
            )

        return dashboard_templates


def _type_convert_stored(obj):
    """Convert Stored* to their appropriate types, recursively."""
    if isinstance(obj, StoredList):
        return list(map(_type_convert_stored, obj))
    if isinstance(obj, StoredDict):
        rdict = {}  # type: Dict[Any, Any]
        for k in obj.keys():
            rdict[k] = _type_convert_stored(obj[k])
        return rdict
    return obj


class GrafanaDashboardsChanged(EventBase):
    """Event emitted when Grafana dashboards change."""

    def __init__(self, handle, data=None):
        super().__init__(handle)
        self.data = data

    def snapshot(self) -> Dict:
        """Save grafana source information."""
        return {"data": self.data}

    def restore(self, snapshot):
        """Restore grafana source information."""
        self.data = snapshot["data"]


class GrafanaDashboardEvents(ObjectEvents):
    """Events raised by :class:`GrafanaSourceEvents`."""

    dashboards_changed = EventSource(GrafanaDashboardsChanged)


class GrafanaDashboardEvent(EventBase):
    """Event emitted when Grafana dashboards cannot be resolved.

    Enables us to set a clear status on the provider.
    """

    def __init__(self, handle, errors: List[Dict[str, str]] = [], valid: bool = False):
        super().__init__(handle)
        self.errors = errors
        self.error_message = "; ".join([error["error"] for error in errors if "error" in error])
        self.valid = valid

    def snapshot(self) -> Dict:
        """Save grafana source information."""
        return {
            "error_message": self.error_message,
            "valid": self.valid,
            "errors": json.dumps(self.errors),
        }

    def restore(self, snapshot):
        """Restore grafana source information."""
        self.error_message = snapshot["error_message"]
        self.valid = snapshot["valid"]
        self.errors = json.loads(str(snapshot["errors"]))


class GrafanaProviderEvents(ObjectEvents):
    """Events raised by :class:`GrafanaSourceEvents`."""

    dashboard_status_changed = EventSource(GrafanaDashboardEvent)


class GrafanaDashboardProvider(Object):
    """An API to provide Grafana dashboards to a Grafana charm."""

    _stored = StoredState()
    on = GrafanaProviderEvents()  # pyright: ignore

    def __init__(
        self,
        charm: CharmBase,
        relation_name: str = DEFAULT_RELATION_NAME,
        dashboards_path: str = "src/grafana_dashboards",
    ) -> None:
        """API to provide Grafana dashboard to a Grafana charmed operator.

        The :class:`GrafanaDashboardProvider` object provides an API
        to upload dashboards to a Grafana charm. In its most streamlined
        usage, the :class:`GrafanaDashboardProvider` is integrated in a
        charmed operator as follows:

            self.grafana = GrafanaDashboardProvider(self)

        The :class:`GrafanaDashboardProvider` will look for dashboard
        templates in the `<charm-py-directory>/grafana_dashboards` folder.
        Additionally, dashboard templates can be uploaded programmatically
        via the :method:`GrafanaDashboardProvider.add_dashboard` method.

        To use the :class:`GrafanaDashboardProvider` API, you need a relation
        defined in your charm operator's metadata.yaml as follows:

            provides:
                grafana-dashboard:
                    interface: grafana_dashboard

        If you would like to use relation name other than `grafana-dashboard`,
        you will need to specify the relation name via the `relation_name`
        argument when instantiating the :class:`GrafanaDashboardProvider` object.
        However, it is strongly advised to keep the default relation name,
        so that people deploying your charm will have a consistent experience
        with all other charms that provide Grafana dashboards.

        It is possible to provide a different file path for the Grafana dashboards
        to be automatically managed by the :class:`GrafanaDashboardProvider` object
        via the `dashboards_path` argument. This may be necessary when the directory
        structure of your charmed operator repository is not the "usual" one as
        generated by `charmcraft init`, for example when adding the charmed operator
        in a Java repository managed by Maven or Gradle. However, unless there are
        such constraints with other tooling, it is strongly advised to store the
        Grafana dashboards in the default `<charm-py-directory>/grafana_dashboards`
        folder, in order to provide a consistent experience for other charmed operator
        authors.

        Args:
            charm: a :class:`CharmBase` object which manages this
                :class:`GrafanaProvider` object. Generally this is
                `self` in the instantiating class.
            relation_name: a :string: name of the relation managed by this
                :class:`GrafanaDashboardProvider`; it defaults to "grafana-dashboard".
            dashboards_path: a filesystem path relative to the charm root
                where dashboard templates can be located. By default, the library
                expects dashboard files to be in the `<charm-py-directory>/grafana_dashboards`
                directory.
        """
        _validate_relation_by_interface_and_direction(
            charm, relation_name, RELATION_INTERFACE_NAME, RelationRole.provides
        )

        try:
            dashboards_path = _resolve_dir_against_charm_path(charm, dashboards_path)
        except InvalidDirectoryPathError as e:
            logger.warning(
                "Invalid Grafana dashboards folder at %s: %s",
                e.grafana_dashboards_absolute_path,
                e.message,
            )

        super().__init__(charm, relation_name)

        self._charm = charm
        self._relation_name = relation_name
        self._dashboards_path = dashboards_path

        # No peer relation bucket we can rely on providers, keep StoredState here, too
        self._stored.set_default(dashboard_templates={})  # type: ignore

        self.framework.observe(self._charm.on.leader_elected, self._update_all_dashboards_from_dir)
        self.framework.observe(self._charm.on.upgrade_charm, self._update_all_dashboards_from_dir)
        self.framework.observe(self._charm.on.config_changed, self._update_all_dashboards_from_dir)

        self.framework.observe(
            self._charm.on[self._relation_name].relation_created,
            self._on_grafana_dashboard_relation_created,
        )
        self.framework.observe(
            self._charm.on[self._relation_name].relation_changed,
            self._on_grafana_dashboard_relation_changed,
        )

    def add_dashboard(self, content: str, inject_dropdowns: bool = True) -> None:
        """Add a dashboard to the relation managed by this :class:`GrafanaDashboardProvider`.

        Args:
            content: a string representing a Jinja template. Currently, no
                global variables are added to the Jinja template evaluation
                context.
            inject_dropdowns: a :boolean: indicating whether topology dropdowns should be
                added to the dashboard
        """
        # Update of storage must be done irrespective of leadership, so
        # that the stored state is there when this unit becomes leader.
        stored_dashboard_templates: Any = self._stored.dashboard_templates  # pyright: ignore

        encoded_dashboard = LZMABase64.compress(content)

        # Use as id the first chars of the encoded dashboard, so that
        # it is predictable across units.
        id = "prog:{}".format(encoded_dashboard[-24:-16])

        stored_dashboard_templates[id] = CharmedDashboard._content_to_dashboard_object(
            charm_name=self._charm.meta.name,
            content=encoded_dashboard,
            dashboard_alt_uid=CharmedDashboard._generate_alt_uid(self._charm.meta.name, id),
            inject_dropdowns=inject_dropdowns,
            juju_topology=self._juju_topology,
        )

        if self._charm.unit.is_leader():
            for dashboard_relation in self._charm.model.relations[self._relation_name]:
                self._upset_dashboards_on_relation(dashboard_relation)

    def remove_non_builtin_dashboards(self) -> None:
        """Remove all dashboards to the relation added via :method:`add_dashboard`."""
        # Update of storage must be done irrespective of leadership, so
        # that the stored state is there when this unit becomes leader.
        stored_dashboard_templates: Any = self._stored.dashboard_templates  # pyright: ignore

        for dashboard_id in list(stored_dashboard_templates.keys()):
            if dashboard_id.startswith("prog:"):
                del stored_dashboard_templates[dashboard_id]
        self._stored.dashboard_templates = stored_dashboard_templates

        if self._charm.unit.is_leader():
            for dashboard_relation in self._charm.model.relations[self._relation_name]:
                self._upset_dashboards_on_relation(dashboard_relation)

    def update_dashboards(self) -> None:
        """Trigger the re-evaluation of the data on all relations."""
        if self._charm.unit.is_leader():
            for dashboard_relation in self._charm.model.relations[self._relation_name]:
                self._upset_dashboards_on_relation(dashboard_relation)

    def reload_dashboards(self, inject_dropdowns: bool = True) -> None:
        """Reloads dashboards and updates all relations."""
        self._update_all_dashboards_from_dir(inject_dropdowns=inject_dropdowns)

    def _update_all_dashboards_from_dir(
        self, _: Optional[HookEvent] = None, inject_dropdowns: bool = True
    ) -> None:
        """Scans the built-in dashboards and updates relations with changes."""
        # Update of storage must be done irrespective of leadership, so
        # that the stored state is there when this unit becomes leader.

        # Ensure we do not leave outdated dashboards by removing from stored all
        # the encoded dashboards that start with "file/".
        if self._dashboards_path:
            stored_dashboard_templates: Any = self._stored.dashboard_templates  # pyright: ignore

            for dashboard_id in list(stored_dashboard_templates.keys()):
                if dashboard_id.startswith("file:"):
                    del stored_dashboard_templates[dashboard_id]

            stored_dashboard_templates.update(
                CharmedDashboard.load_dashboards_from_dir(
                    dashboards_path=Path(self._dashboards_path),
                    charm_name=self._charm.meta.name,
                    charm_dir=self._charm.charm_dir,
                    inject_dropdowns=inject_dropdowns,
                    juju_topology=self._juju_topology,
                )
            )

            if self._charm.unit.is_leader():
                for dashboard_relation in self._charm.model.relations[self._relation_name]:
                    self._upset_dashboards_on_relation(dashboard_relation)

    def _reinitialize_dashboard_data(self, inject_dropdowns: bool = True) -> None:
        """Triggers a reload of dashboard outside an eventing workflow.

        Args:
            inject_dropdowns: a :bool: used to indicate whether topology dropdowns should be added

        This will destroy any existing relation data.
        """
        try:
            _resolve_dir_against_charm_path(self._charm, self._dashboards_path)
            self._update_all_dashboards_from_dir(inject_dropdowns=inject_dropdowns)

        except InvalidDirectoryPathError as e:
            logger.warning(
                "Invalid Grafana dashboards folder at %s: %s",
                e.grafana_dashboards_absolute_path,
                e.message,
            )
            stored_dashboard_templates: Any = self._stored.dashboard_templates  # pyright: ignore

            for dashboard_id in list(stored_dashboard_templates.keys()):
                if dashboard_id.startswith("file:"):
                    del stored_dashboard_templates[dashboard_id]
            self._stored.dashboard_templates = stored_dashboard_templates

            # With all the file-based dashboards cleared out, force a refresh
            # of relation data
            if self._charm.unit.is_leader():
                for dashboard_relation in self._charm.model.relations[self._relation_name]:
                    self._upset_dashboards_on_relation(dashboard_relation)

    def _on_grafana_dashboard_relation_created(self, event: RelationCreatedEvent) -> None:
        """Watch for a relation being created and automatically send dashboards.

        Args:
            event: The :class:`RelationJoinedEvent` sent when a
                `grafana_dashboaard` relationship is joined
        """
        if self._charm.unit.is_leader():
            self._update_all_dashboards_from_dir()
            self._upset_dashboards_on_relation(event.relation)

    def _on_grafana_dashboard_relation_changed(self, event: RelationChangedEvent) -> None:
        """Watch for changes so we know if there's an error to signal back to the parent charm.

        Args:
            event: The `RelationChangedEvent` that triggered this handler.
        """
        if self._charm.unit.is_leader():
            data = json.loads(event.relation.data[event.app].get("event", "{}"))  # type: ignore

            if not data:
                return

            valid = bool(data.get("valid", True))
            errors = data.get("errors", [])
            if valid and not errors:
                self.on.dashboard_status_changed.emit(valid=valid)  # pyright: ignore
            else:
                self.on.dashboard_status_changed.emit(  # pyright: ignore
                    valid=valid, errors=errors
                )

    def _upset_dashboards_on_relation(self, relation: Relation) -> None:
        """Update the dashboards in the relation data bucket."""
        # It's completely ridiculous to add a UUID, but if we don't have some
        # pseudo-random value, this never makes it across 'juju set-state'
        stored_data = {
            "templates": _type_convert_stored(self._stored.dashboard_templates),  # pyright: ignore
            "uuid": str(uuid.uuid4()),
        }

        relation.data[self._charm.app]["dashboards"] = json.dumps(stored_data)

    @property
    def _juju_topology(self) -> Dict:
        return {
            "model": self._charm.model.name,
            "model_uuid": self._charm.model.uuid,
            "application": self._charm.app.name,
            "unit": self._charm.unit.name,
        }

    @property
    def dashboard_templates(self) -> List:
        """Return a list of the known dashboard templates."""
        return list(self._stored.dashboard_templates.values())  # type: ignore


class GrafanaDashboardConsumer(Object):
    """A consumer object for working with Grafana Dashboards."""

    on = GrafanaDashboardEvents()  # pyright: ignore
    _stored = StoredState()

    def __init__(
        self,
        charm: CharmBase,
        relation_name: str = DEFAULT_RELATION_NAME,
    ) -> None:
        """API to receive Grafana dashboards from charmed operators.

        The :class:`GrafanaDashboardConsumer` object provides an API
        to consume dashboards provided by a charmed operator using the
        :class:`GrafanaDashboardProvider` library. The
        :class:`GrafanaDashboardConsumer` is integrated in a
        charmed operator as follows:

            self.grafana = GrafanaDashboardConsumer(self)

        To use this library, you need a relation defined as follows in
        your charm operator's metadata.yaml:

            requires:
                grafana-dashboard:
                    interface: grafana_dashboard

        If you would like to use a different relation name than
        `grafana-dashboard`, you need to specify the relation name via the
        `relation_name` argument. However, it is strongly advised not to
        change the default, so that people deploying your charm will have
        a consistent experience with all other charms that consume Grafana
        dashboards.

        Args:
            charm: a :class:`CharmBase` object which manages this
                :class:`GrafanaProvider` object. Generally this is
                `self` in the instantiating class.
            relation_name: a :string: name of the relation managed by this
                :class:`GrafanaDashboardConsumer`; it defaults to "grafana-dashboard".
        """
        _validate_relation_by_interface_and_direction(
            charm, relation_name, RELATION_INTERFACE_NAME, RelationRole.requires
        )

        super().__init__(charm, relation_name)
        self._charm = charm
        self._relation_name = relation_name
        self._transformer = CosTool(self._charm)

        self._stored.set_default(dashboards={})  # type: ignore

        self.framework.observe(
            self._charm.on[self._relation_name].relation_changed,
            self._on_grafana_dashboard_relation_changed,
        )
        self.framework.observe(
            self._charm.on[self._relation_name].relation_broken,
            self._on_grafana_dashboard_relation_broken,
        )
        self.framework.observe(
            self._charm.on[DEFAULT_PEER_NAME].relation_changed,
            self._on_grafana_peer_changed,
        )

    def get_dashboards_from_relation(self, relation_id: int) -> List:
        """Get a list of known dashboards for one instance of the monitored relation.

        Args:
            relation_id: the identifier of the relation instance, as returned by
                :method:`ops.model.Relation.id`.

        Returns: a list of known dashboards coming from the provided relation instance.
        """
        return [
            self._to_external_object(relation_id, dashboard)
            for dashboard in self._get_stored_dashboards(relation_id)
        ]

    def _on_grafana_dashboard_relation_changed(self, event: RelationChangedEvent) -> None:
        """Handle relation changes in related providers.

        If there are changes in relations between Grafana dashboard consumers
        and providers, this event handler (if the unit is the leader) will
        get data for an incoming grafana-dashboard relation through a
        :class:`GrafanaDashboardsChanged` event, and make the relation data
        available in the app's datastore object. The Grafana charm can
        then respond to the event to update its configuration.
        """
        changes = False
        if self._charm.unit.is_leader():
            changes = self._render_dashboards_and_signal_changed(event.relation)

        if changes:
            self.on.dashboards_changed.emit()  # pyright: ignore

    def _on_grafana_peer_changed(self, _: RelationChangedEvent) -> None:
        """Emit dashboard events on peer events so secondary charm data updates."""
        if self._charm.unit.is_leader():
            return
        self.on.dashboards_changed.emit()  # pyright: ignore

    def update_dashboards(self, relation: Optional[Relation] = None) -> None:
        """Re-establish dashboards on one or more relations.

        If something changes between this library and a datasource, try to re-establish
        invalid dashboards and invalidate active ones.

        Args:
            relation: a specific relation for which the dashboards have to be
                updated. If not specified, all relations managed by this
                :class:`GrafanaDashboardConsumer` will be updated.
        """
        if self._charm.unit.is_leader():
            relations = (
                [relation] if relation else self._charm.model.relations[self._relation_name]
            )

            for relation in relations:
                self._render_dashboards_and_signal_changed(relation)

    def _on_grafana_dashboard_relation_broken(self, event: RelationBrokenEvent) -> None:
        """Update job config when providers depart.

        When a Grafana dashboard provider departs, the configuration
        for that provider is removed from the list of dashboards
        """
        if not self._charm.unit.is_leader():
            return

        self._remove_all_dashboards_for_relation(event.relation)

    def _render_dashboards_and_signal_changed(self, relation: Relation) -> bool:  # type: ignore
        """Validate a given dashboard.

        Verify that the passed dashboard data is able to be found in our list
        of datasources and will render. If they do, let the charm know by
        emitting an event.

        Args:
            relation: Relation; The relation the dashboard is associated with.

        Returns:
            a boolean indicating whether an event should be emitted
        """
        other_app = relation.app

        raw_data = relation.data[other_app].get("dashboards", "")  # pyright: ignore

        if not raw_data:
            logger.warning(
                "No dashboard data found in the %s:%s relation",
                self._relation_name,
                str(relation.id),
            )
            return False

        data = json.loads(raw_data)

        # The only piece of data needed on this side of the relations is "templates"
        templates = data.pop("templates")

        # The dashboards are WAY too big since this ultimately calls out to Juju to
        # set the relation data, and it overflows the maximum argument length for
        # subprocess, so we have to use b64, annoyingly.
        # Worse, Python3 expects absolutely everything to be a byte, and a plain
        # `base64.b64encode()` is still too large, so we have to go through hoops
        # of encoding to byte, compressing with lzma, converting to base64 so it
        # can be converted to JSON, then all the way back.

        rendered_dashboards = []
        relation_has_invalid_dashboards = False

        for _, (fname, template) in enumerate(templates.items()):
            content = None
            error = None
            topology = template.get("juju_topology", {})
            try:
                content = LZMABase64.decompress(template["content"])
                inject_dropdowns = template.get("inject_dropdowns", True)
                content = self._manage_dashboard_uid(content, template)
                content = CharmedDashboard._convert_dashboard_fields(content, inject_dropdowns)

                if topology:
                    content = CharmedDashboard._inject_labels(content, topology, self._transformer)

                content = LZMABase64.compress(content)
            except lzma.LZMAError as e:
                error = str(e)
                relation_has_invalid_dashboards = True
            except json.JSONDecodeError as e:
                error = str(e.msg)
                logger.warning("Invalid JSON in Grafana dashboard '{}': {}".format(fname, error))
                continue

            # Prepend the relation name and ID to the dashboard ID to avoid clashes with
            # multiple relations with apps from the same charm, or having dashboards with
            # the same ids inside their charm operators
            rendered_dashboards.append(
                {
                    "id": "{}:{}/{}".format(relation.name, relation.id, fname),
                    "original_id": fname,
                    "content": content if content else None,
                    "template": template,
                    "valid": (error is None),
                    "error": error,
                }
            )

        if relation_has_invalid_dashboards:
            self._remove_all_dashboards_for_relation(relation)

            invalid_templates = [
                data["original_id"] for data in rendered_dashboards if not data["valid"]
            ]

            logger.warning(
                "Cannot add one or more Grafana dashboards from relation '{}:{}': the following "
                "templates are invalid: {}".format(
                    relation.name,
                    relation.id,
                    invalid_templates,
                )
            )

            relation.data[self._charm.app]["event"] = json.dumps(
                {
                    "errors": [
                        {
                            "dashboard_id": rendered_dashboard["original_id"],
                            "error": rendered_dashboard["error"],
                        }
                        for rendered_dashboard in rendered_dashboards
                        if rendered_dashboard["error"]
                    ]
                }
            )

            # Dropping dashboards for a relation needs to be signalled
            return True

        stored_data = rendered_dashboards
        currently_stored_data = self._get_stored_dashboards(relation.id)

        coerced_data = _type_convert_stored(currently_stored_data) if currently_stored_data else {}

        if not coerced_data == stored_data:
            stored_dashboards = self.get_peer_data("dashboards")
            stored_dashboards[str(relation.id)] = stored_data
            self.set_peer_data("dashboards", stored_dashboards)
            return True
        return None  # type: ignore

    def _manage_dashboard_uid(self, dashboard: str, template: dict) -> str:
        """Add an uid to the dashboard if it is not present."""
        dashboard_dict = json.loads(dashboard)

        if not dashboard_dict.get("uid", None) and "dashboard_alt_uid" in template:
            dashboard_dict["uid"] = template["dashboard_alt_uid"]

        return json.dumps(dashboard_dict)

    def _remove_all_dashboards_for_relation(self, relation: Relation) -> None:
        """If an errored dashboard is in stored data, remove it and trigger a deletion."""
        if self._get_stored_dashboards(relation.id):
            stored_dashboards = self.get_peer_data("dashboards")
            stored_dashboards.pop(str(relation.id))
            self.set_peer_data("dashboards", stored_dashboards)
            self.on.dashboards_changed.emit()  # pyright: ignore

    def _to_external_object(self, relation_id, dashboard):
        return {
            "id": dashboard["original_id"],
            "relation_id": relation_id,
            "charm": dashboard["template"]["charm"],
            "content": LZMABase64.decompress(dashboard["content"]),
        }

    @property
    def dashboards(self) -> List[Dict]:
        """Get a list of known dashboards across all instances of the monitored relation.

        Returns: a list of known dashboards. The JSON of each of the dashboards is available
            in the `content` field of the corresponding `dict`.
        """
        dashboards = []

        for _, (relation_id, dashboards_for_relation) in enumerate(
            self.get_peer_data("dashboards").items()
        ):
            for dashboard in dashboards_for_relation:
                dashboards.append(self._to_external_object(relation_id, dashboard))

        return dashboards

    def _get_stored_dashboards(self, relation_id: int) -> list:
        """Pull stored dashboards out of the peer data bucket."""
        return self.get_peer_data("dashboards").get(str(relation_id), {})

    def _set_default_data(self) -> None:
        """Set defaults if they are not in peer relation data."""
        data = {"dashboards": {}}  # type: ignore
        for k, v in data.items():
            if not self.get_peer_data(k):
                self.set_peer_data(k, v)

    def set_peer_data(self, key: str, data: Any) -> None:
        """Put information into the peer data bucket instead of `StoredState`."""
        peers = self._charm.peers  # type: ignore[attr-defined]
        if not peers or not peers.data:
            logger.info("set_peer_data: no peer relation. Is the charm being installed/removed?")
            return
        peers.data[self._charm.app][key] = json.dumps(data)  # type: ignore[attr-defined]

    def get_peer_data(self, key: str) -> Any:
        """Retrieve information from the peer data bucket instead of `StoredState`."""
        peers = self._charm.peers  # type: ignore[attr-defined]
        if not peers or not peers.data:
            logger.warning(
                "get_peer_data: no peer relation. Is the charm being installed/removed?"
            )
            return {}
        data = peers.data[self._charm.app].get(key, "")
        return json.loads(data) if data else {}


class GrafanaDashboardAggregator(Object):
    """API to retrieve Grafana dashboards from machine dashboards.

    The :class:`GrafanaDashboardAggregator` object provides a way to
    collate and aggregate Grafana dashboards from reactive/machine charms
    and transport them into Charmed Operators, using Juju topology.
    For detailed usage instructions, see the documentation for
    :module:`cos-proxy-operator`, as this class is intended for use as a
    single point of intersection rather than use in individual charms.

    Since :class:`GrafanaDashboardAggregator` serves as a bridge between
    Canonical Observability Stack Charmed Operators and Reactive Charms,
    deployed in a Reactive Juju model, both a target relation which is
    used to collect events from Reactive charms and a `grafana_relation`
    which is used to send the collected data back to the Canonical
    Observability Stack are required.

    In its most streamlined usage, :class:`GrafanaDashboardAggregator` is
    integrated in a charmed operator as follows:
        self.grafana = GrafanaDashboardAggregator(self)

    Args:
        charm: a :class:`CharmBase` object which manages this
            :class:`GrafanaProvider` object. Generally this is
            `self` in the instantiating class.
        target_relation: a :string: name of a relation managed by this
            :class:`GrafanaDashboardAggregator`, which is used to communicate
            with reactive/machine charms it defaults to "dashboards".
        grafana_relation: a :string: name of a relation used by this
            :class:`GrafanaDashboardAggregator`, which is used to communicate
            with charmed grafana. It defaults to "downstream-grafana-dashboard"
    """

    _stored = StoredState()
    on = GrafanaProviderEvents()  # pyright: ignore

    def __init__(
        self,
        charm: CharmBase,
        target_relation: str = "dashboards",
        grafana_relation: str = "downstream-grafana-dashboard",
    ):
        super().__init__(charm, grafana_relation)

        # Reactive charms may be RPC-ish and not leave reliable data around. Keep
        # StoredState here
        self._stored.set_default(  # type: ignore
            dashboard_templates={},
            id_mappings={},
        )

        self._charm = charm
        self._target_relation = target_relation
        self._grafana_relation = grafana_relation

        self.framework.observe(
            self._charm.on[self._grafana_relation].relation_joined,
            self._update_remote_grafana,
        )
        self.framework.observe(
            self._charm.on[self._grafana_relation].relation_changed,
            self._update_remote_grafana,
        )
        self.framework.observe(
            self._charm.on[self._target_relation].relation_changed,
            self.update_dashboards,
        )
        self.framework.observe(
            self._charm.on[self._target_relation].relation_broken,
            self.remove_dashboards,
        )

    def update_dashboards(self, event: RelationEvent) -> None:
        """If we get a dashboard from a reactive charm, parse it out and update."""
        if self._charm.unit.is_leader():
            self._upset_dashboards_on_event(event)

    def _upset_dashboards_on_event(self, event: RelationEvent) -> None:
        """Update the dashboards in the relation data bucket."""
        dashboards = self._handle_reactive_dashboards(event)

        if not dashboards:
            logger.warning(
                "Could not find dashboard data after a relation change for {}".format(event.app)
            )
            return

        for id in dashboards:
            self._stored.dashboard_templates[id] = CharmedDashboard._content_to_dashboard_object(  # type: ignore
                charm_name=event.app.name,
                content=dashboards[id],
                inject_dropdowns=True,
                juju_topology=self._hybrid_topology(event),
            )

        self._stored.id_mappings[event.app.name] = dashboards  # type: ignore
        self._update_remote_grafana(event)

    def _update_remote_grafana(self, _: Optional[RelationEvent] = None) -> None:
        """Push dashboards to the downstream Grafana relation."""
        # It's still ridiculous to add a UUID here, but needed
        stored_data = {
            "templates": _type_convert_stored(self._stored.dashboard_templates),  # pyright: ignore
            "uuid": str(uuid.uuid4()),
        }

        if self._charm.unit.is_leader():
            for grafana_relation in self.model.relations[self._grafana_relation]:
                grafana_relation.data[self._charm.app]["dashboards"] = json.dumps(stored_data)

    def remove_dashboards(self, event: RelationBrokenEvent) -> None:
        """Remove a dashboard if the relation is broken."""
        app_ids = _type_convert_stored(self._stored.id_mappings.get(event.app.name, ""))  # type: ignore

        if not app_ids:
            logger.info("Could not look up stored dashboards for %s", event.app.name)  # type: ignore
            return

        del self._stored.id_mappings[event.app.name]  # type: ignore
        for id in app_ids:
            del self._stored.dashboard_templates[id]  # type: ignore

        stored_data = {
            "templates": _type_convert_stored(self._stored.dashboard_templates),  # pyright: ignore
            "uuid": str(uuid.uuid4()),
        }

        if self._charm.unit.is_leader():
            for grafana_relation in self.model.relations[self._grafana_relation]:
                grafana_relation.data[self._charm.app]["dashboards"] = json.dumps(stored_data)

    # Yes, this has a fair amount of branching. It's not that complex, though
    def _strip_existing_datasources(self, dash: dict) -> dict:  # noqa: C901
        """Remove existing reactive charm datasource templating out.

        This method iterates through *known* places where reactive charms may set
        data in contributed dashboards and removes them.

        `dashboard["__inputs"]` is a property sometimes set when exporting dashboards from
        the Grafana UI. It is not present in earlier Grafana versions, and can be disabled
        in 5.3.4 and above (optionally). If set, any values present will be substituted on
        import. Some reactive charms use this for Prometheus. COS uses dropdown selectors
        for datasources, and leaving this present results in "default" datasource values
        which are broken.

        Similarly, `dashboard["templating"]["list"][N]["name"] == "host"` can be used to
        set a `host` variable for use in dashboards which is not meaningful in the context
        of Juju topology and will yield broken dashboards.

        Further properties may be discovered.
        """
        try:
            if "list" in dash["templating"]:
                for i in range(len(dash["templating"]["list"])):
                    if (
                        "datasource" in dash["templating"]["list"][i]
                        and dash["templating"]["list"][i]["datasource"] is not None
                    ):
                        if "Juju" in dash["templating"]["list"][i].get("datasource", ""):
                            dash["templating"]["list"][i]["datasource"] = r"${prometheusds}"

                # Strip out newly-added 'juju_application' template variables which
                # don't line up with our drop-downs
                dash_mutable = dash
                for i in range(len(dash["templating"]["list"])):
                    if (
                        "name" in dash["templating"]["list"][i]
                        and dash["templating"]["list"][i].get("name", "") == "app"
                    ):
                        del dash_mutable["templating"]["list"][i]

                if dash_mutable:
                    dash = dash_mutable
        except KeyError:
            logger.debug("No existing templating data in dashboard")

        if "__inputs" in dash:
            inputs = dash
            for i in range(len(dash["__inputs"])):
                if dash["__inputs"][i].get("pluginName", "") == "Prometheus":
                    del inputs["__inputs"][i]
            if inputs:
                dash["__inputs"] = inputs["__inputs"]
            else:
                del dash["__inputs"]

        return dash

    def _handle_reactive_dashboards(self, event: RelationEvent) -> Optional[Dict]:
        """Look for a dashboard in relation data (during a reactive hook) or builtin by name."""
        if not self._charm.unit.is_leader():
            return {}

        templates = []
        id = ""

        # Reactive data can reliably be pulled out of events. In theory, if we got an event,
        # it's on the bucket, but using event explicitly keeps the mental model in
        # place for reactive
        for k in event.relation.data[event.unit].keys():  # type: ignore
            if k.startswith("request_"):
                templates.append(json.loads(event.relation.data[event.unit][k])["dashboard"])  # type: ignore

        for k in event.relation.data[event.app].keys():  # type: ignore
            if k.startswith("request_"):
                templates.append(json.loads(event.relation.data[event.app][k])["dashboard"])  # type: ignore

        builtins = self._maybe_get_builtin_dashboards(event)

        if not templates and not builtins:
            logger.warning("NOTHING!")
            return {}

        dashboards = {}
        for t in templates:
            # This seems ridiculous, too, but to get it from a "dashboards" key in serialized JSON
            # in the bucket back out to the actual "dashboard" we _need_, this is the way
            # This is not a mistake -- there's a double nesting in reactive charms, and
            # Grafana won't load it. We have to unbox:
            # event.relation.data[event.<type>]["request_*"]["dashboard"]["dashboard"],
            # and the final unboxing is below.
            #
            # Apparently SOME newer dashboards (such as Ceph) do not have this double nesting, so
            # now we get to account for both :toot:
            dash = t.get("dashboard", {}) or t

            # Replace values with LMA-style templating
            dash = self._strip_existing_datasources(dash)
            dash = json.dumps(dash)

            # Replace the old-style datasource templates
            dash = re.sub(r"<< datasource >>", r"${prometheusds}", dash)
            dash = re.sub(r'"datasource": "prom.*?"', r'"datasource": "${prometheusds}"', dash)
            dash = re.sub(
                r'"datasource": "\$datasource"', r'"datasource": "${prometheusds}"', dash
            )
            dash = re.sub(r'"uid": "\$datasource"', r'"uid": "${prometheusds}"', dash)
            dash = re.sub(
                r'"datasource": "(!?\w)[\w|\s|-]+?Juju generated.*?"',
                r'"datasource": "${prometheusds}"',
                dash,
            )

            # Yank out "new"+old LMA topology
            dash = re.sub(
                r'(,?\s?juju_application=~)\\"\$app\\"', r'\1\\"$juju_application\\"', dash
            )

            # Replace old piechart panels
            dash = re.sub(r'"type": "grafana-piechart-panel"', '"type": "piechart"', dash)

            from jinja2 import DebugUndefined, Template

            content = LZMABase64.compress(
                Template(dash, undefined=DebugUndefined).render(datasource=r"${prometheusds}")  # type: ignore
            )
            id = "prog:{}".format(content[-24:-16])

            dashboards[id] = content
        return {**builtins, **dashboards}

    def _maybe_get_builtin_dashboards(self, event: RelationEvent) -> Dict:
        """Tries to match the event with an included dashboard.

        Scans dashboards packed with the charm instantiating this class, and tries to match
        one with the event. There is no guarantee that any given event will match a builtin,
        since each charm instantiating this class may include a different set of dashboards,
        or none.
        """
        builtins = {}
        dashboards_path = None

        try:
            dashboards_path = _resolve_dir_against_charm_path(
                self._charm, "src/grafana_dashboards"
            )
        except InvalidDirectoryPathError as e:
            logger.warning(
                "Invalid Grafana dashboards folder at %s: %s",
                e.grafana_dashboards_absolute_path,
                e.message,
            )

        if dashboards_path:
            builtins.update(
                CharmedDashboard.load_dashboards_from_dir(
                    dashboards_path=Path(dashboards_path),
                    charm_name=event.app.name,
                    charm_dir=self._charm.charm_dir,
                    inject_dropdowns=True,
                    juju_topology=self._hybrid_topology(event),
                    path_filter=lambda path: event.app.name in path.name,
                )
            )

        return builtins

    def _hybrid_topology(self, event: RelationEvent) -> Dict:
        return {
            "model": self._charm.model.name,
            "model_uuid": self._charm.model.uuid,
            "application": event.app.name,  # type: ignore
            "unit": event.unit.name,  # type: ignore
        }


class CosTool:
    """Uses cos-tool to inject label matchers into alert rule expressions and validate rules."""

    _path = None
    _disabled = False

    def __init__(self, charm):
        self._charm = charm

    @property
    def path(self):
        """Lazy lookup of the path of cos-tool."""
        if self._disabled:
            return None
        if not self._path:
            self._path = self._get_tool_path()
            if not self._path:
                logger.debug("Skipping injection of juju topology as label matchers")
                self._disabled = True
        return self._path

    def apply_label_matchers(self, rules: dict, type: str) -> dict:
        """Will apply label matchers to the expression of all alerts in all supplied groups."""
        if not self.path:
            return rules
        for group in rules["groups"]:
            rules_in_group = group.get("rules", [])
            for rule in rules_in_group:
                topology = {}
                # if the user for some reason has provided juju_unit, we'll need to honor it
                # in most cases, however, this will be empty
                for label in [
                    "juju_model",
                    "juju_model_uuid",
                    "juju_application",
                    "juju_charm",
                    "juju_unit",
                ]:
                    if label in rule["labels"]:
                        topology[label] = rule["labels"][label]

                rule["expr"] = self.inject_label_matchers(rule["expr"], topology, type)
        return rules

    def validate_alert_rules(self, rules: dict) -> Tuple[bool, str]:
        """Will validate correctness of alert rules, returning a boolean and any errors."""
        if not self.path:
            logger.debug("`cos-tool` unavailable. Not validating alert correctness.")
            return True, ""

        with tempfile.TemporaryDirectory() as tmpdir:
            rule_path = Path(tmpdir + "/validate_rule.yaml")

            # Smash "our" rules format into what upstream actually uses, which is more like:
            #
            # groups:
            #   - name: foo
            #     rules:
            #       - alert: SomeAlert
            #         expr: up
            #       - alert: OtherAlert
            #         expr: up
            transformed_rules = {"groups": []}  # type: ignore
            for rule in rules["groups"]:
                transformed = {"name": str(uuid.uuid4()), "rules": [rule]}
                transformed_rules["groups"].append(transformed)

            rule_path.write_text(yaml.dump(transformed_rules))

            args = [str(self.path), "validate", str(rule_path)]
            # noinspection PyBroadException
            try:
                self._exec(args)
                return True, ""
            except subprocess.CalledProcessError as e:
                logger.debug("Validating the rules failed: %s", e.output)
                return False, ", ".join([line for line in e.output if "error validating" in line])

    def inject_label_matchers(self, expression: str, topology: dict, type: str) -> str:
        """Add label matchers to an expression."""
        if not topology:
            return expression
        if not self.path:
            logger.debug("`cos-tool` unavailable. Leaving expression unchanged: %s", expression)
            return expression
        args = [str(self.path), "--format", type, "transform"]

        variable_topology = {k: "${}".format(k) for k in topology.keys()}
        args.extend(
            [
                "--label-matcher={}={}".format(key, value)
                for key, value in variable_topology.items()
            ]
        )

        # Pass a leading "--" so expressions with a negation or subtraction aren't interpreted as
        # flags
        args.extend(["--", "{}".format(expression)])
        # noinspection PyBroadException
        try:
            return re.sub(r'="\$juju', r'=~"$juju', self._exec(args))
        except subprocess.CalledProcessError as e:
            logger.debug('Applying the expression failed: "%s", falling back to the original', e)
            return expression

    def _get_tool_path(self) -> Optional[Path]:
        arch = platform.machine()
        arch = "amd64" if arch == "x86_64" else arch
        res = "cos-tool-{}".format(arch)
        try:
            path = Path(res).resolve(strict=True)
            return path
        except (FileNotFoundError, OSError):
            logger.debug('Could not locate cos-tool at: "{}"'.format(res))
        return None

    def _exec(self, cmd) -> str:
        result = subprocess.run(cmd, check=True, stdout=subprocess.PIPE)
        output = result.stdout.decode("utf-8").strip()
        return output
