import re
from dataclasses import asdict, dataclass

from webapp.certified.helpers import (
    _get_category_url_value,
    _normalize_categories,
)


FILTER_OPTION_LIMIT = 5


@dataclass(frozen=True)
class FilterDefinition:
    key: str
    title: str
    api_parameter: str
    option_source: str
    plural: str
    default_expanded: bool = False


FILTER_DEFINITIONS = (
    FilterDefinition(
        key="release",
        title="Ubuntu certified version",
        api_parameter="major_release__in",
        option_source="releases",
        plural="versions",
        default_expanded=True,
    ),
    FilterDefinition(
        key="category",
        title="Category",
        api_parameter="category__in",
        option_source="categories",
        plural="categories",
        default_expanded=True,
    ),
    FilterDefinition(
        key="vendor",
        title="Vendor",
        api_parameter="vendor",
        option_source="vendors",
        plural="vendors",
        default_expanded=True,
    ),
)


CATEGORY_OPTIONS = (
    {"value": "Laptop", "label": "Laptop"},
    {"value": "Desktop", "label": "Desktop"},
    {"value": "Server", "label": "Server"},
    {"value": "IoT", "label": "IoT"},
    {"value": "SoC", "label": "SoC"},
)


CATEGORY_COUNT_FIELDS = {
    "Laptop": "laptops",
    "Desktop": "desktops",
    "Server": "servers",
    "IoT": "smart_core",
    "SoC": "soc",
}


def _unique(values):
    return list(dict.fromkeys(value for value in values if value))


def _canonical_category_values(values):
    return _unique(
        _get_category_url_value(value)
        for value in _normalize_categories(values)
    )


def parse_selected_filters(request_args):
    selected = {}

    for definition in FILTER_DEFINITIONS:
        values = request_args.getlist(definition.key)
        if definition.key == "category":
            values = _canonical_category_values(values)
        selected[definition.key] = _unique(values)

    return selected


def canonicalize_selected_filters(selected, options_by_key):
    canonical = {}

    for definition in FILTER_DEFINITIONS:
        value = selected.get(definition.key, [])
        known_values = {
            option["value"] for option in options_by_key[definition.key]
        }
        canonical[definition.key] = (
            [item for item in value if item in known_values]
            if known_values
            else value
        )

    return canonical


def build_api_filter_params(selected):
    parameters = {}

    for definition in FILTER_DEFINITIONS:
        value = selected.get(definition.key, [])
        if not value:
            continue

        if definition.key == "category":
            value = _normalize_categories(value)
        parameters[definition.api_parameter] = value

    return parameters


def category_availability(record):
    return [
        category
        for category, count_field in CATEGORY_COUNT_FIELDS.items()
        if int(record.get(count_field, 0) or 0) > 0
    ]


def make_filter_option(value, label=None, available_for=None):
    option = {"value": str(value), "label": label or str(value)}
    if available_for is not None:
        option["available_for"] = available_for
    return option


def build_options_by_key(certified_makes, certified_releases):
    options = {definition.key: [] for definition in FILTER_DEFINITIONS}
    options["category"] = list(CATEGORY_OPTIONS)

    seen_vendors = set()
    for record in certified_makes:
        value = "NVIDIA" if record["make"] == "nVidia" else record["make"]
        if value in seen_vendors:
            continue
        options["vendor"].append(
            make_filter_option(
                value, available_for=category_availability(record)
            )
        )
        seen_vendors.add(value)

    seen_releases = set()
    for record in certified_releases:
        value = record["release"]
        if value in seen_releases:
            continue
        options["release"].append(
            make_filter_option(
                value, available_for=category_availability(record)
            )
        )
        seen_releases.add(value)

    return {
        key: sort_filter_options(key, filter_options)
        for key, filter_options in options.items()
    }


def build_filter_catalog(options_by_key):
    catalog = []
    for definition in FILTER_DEFINITIONS:
        options = options_by_key[definition.key]
        catalog.append(
            {
                **asdict(definition),
                "options": options,
                "show_option_search": len(options) > FILTER_OPTION_LIMIT,
            }
        )
    return catalog


def build_canonical_query_params(request_args, selected):
    parameters = {}
    if "q" in request_args:
        parameters["q"] = [request_args.get("q", default="", type=str)]

    for definition in FILTER_DEFINITIONS:
        value = selected[definition.key]
        if value:
            parameters[definition.key] = (
                value if isinstance(value, list) else [value]
            )

    for key in ("limit", "offset"):
        if key in request_args:
            parameters[key] = [request_args.get(key, type=str)]

    return parameters


def _release_sort_key(option):
    label = option["label"]
    is_core = label.casefold().startswith("core")
    version = tuple(int(part) for part in re.findall(r"\d+", label))
    padded_version = (version + (0, 0, 0))[:3]
    return (is_core, *(-part for part in padded_version), label.casefold())


def sort_filter_options(key, options):
    if key == "category":
        order = {
            option["value"]: index
            for index, option in enumerate(CATEGORY_OPTIONS)
        }
        return sorted(options, key=lambda option: order[option["value"]])

    if key == "release":
        return sorted(options, key=_release_sort_key)

    return sorted(options, key=lambda option: option["label"].casefold())


def option_is_available(option, selected_categories):
    available_for = option.get("available_for")
    if not selected_categories or available_for is None:
        return True
    return bool(set(selected_categories) & set(available_for))


def order_filter_options(key, options, selected, selected_categories):
    sorted_options = sort_filter_options(key, options)
    selected_values = set(selected)

    def option_group(option):
        if option["value"] in selected_values:
            return 0
        if option_is_available(option, selected_categories):
            return 1
        return 2

    return sorted(sorted_options, key=option_group)


def build_filter_view_models(options_by_key, selected):
    selected_categories = selected["category"]
    view_models = []

    for definition in FILTER_DEFINITIONS:
        selected_values = selected[definition.key]
        known_values = {
            option["value"] for option in options_by_key[definition.key]
        }
        options_with_selected = [
            *options_by_key[definition.key],
            *[
                make_filter_option(item)
                for item in selected_values
                if item not in known_values
            ],
        ]
        options = order_filter_options(
            definition.key,
            options_with_selected,
            selected_values,
            selected_categories,
        )
        option_models = []
        for option in options:
            option_models.append(
                {
                    **option,
                    "selected": option["value"] in selected_values,
                    "disabled": (
                        option["value"] not in selected_values
                        and not option_is_available(
                            option, selected_categories
                        )
                    ),
                }
            )

        view_models.append(
            {
                **asdict(definition),
                "options": option_models,
                "selected_count": len(selected_values),
                "expanded": definition.default_expanded
                or bool(selected_values),
                "show_option_search": len(option_models) > FILTER_OPTION_LIMIT,
            }
        )

    return view_models
