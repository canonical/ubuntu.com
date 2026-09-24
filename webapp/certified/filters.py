import re
from dataclasses import asdict, dataclass

from webapp.certified.helpers import (
    _get_category_url_value,
    _normalize_categories,
)


FILTER_OPTION_LIMIT = 5
MEMORY_MIN_GB = 0
MEMORY_MAX_GB = 1024
MEMORY_STEP_GB = 8


@dataclass(frozen=True)
class FilterDefinition:
    key: str
    title: str
    api_parameter: str
    option_source: str
    plural: str
    default_expanded: bool = False
    control: str = "checkbox"
    selection: str = "multiple"
    url_keys: tuple = ()


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
    FilterDefinition(
        key="model_family",
        title="Model family",
        api_parameter="",
        option_source="model_family",
        plural="model families",
    ),
    FilterDefinition(
        key="processor_model",
        title="Processor model",
        api_parameter="cpu_model",
        option_source="processor_model",
        plural="processor models",
        selection="single",
    ),
    FilterDefinition(
        key="gpu",
        title="Graphics Processing Unit (GPU)",
        api_parameter="gpu_name",
        option_source="gpu",
        plural="GPUs",
        selection="single",
    ),
    FilterDefinition(
        key="memory",
        title="System memory (RAM)",
        api_parameter="",
        option_source="",
        plural="",
        control="range",
        url_keys=("memory_min", "memory_max"),
    ),
    FilterDefinition(
        key="certified_year",
        title="Certified in",
        api_parameter="completed__year",
        option_source="",
        plural="",
        control="year",
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
        if definition.control == "range":
            minimum = _memory_bound(
                request_args.get("memory_min"), MEMORY_MIN_GB
            )
            maximum = _memory_bound(
                request_args.get("memory_max"), MEMORY_MAX_GB
            )
            selected[definition.key] = {
                "min": min(minimum, maximum),
                "max": max(minimum, maximum),
            }
            continue

        if definition.control == "year":
            selected[definition.key] = str(
                request_args.get(definition.key, "") or ""
            ).strip()
            continue

        if definition.selection == "single":
            selected[definition.key] = str(
                request_args.get(definition.key, "") or ""
            ).strip()
            continue

        values = request_args.getlist(definition.key)
        if definition.key == "category":
            values = _canonical_category_values(values)
        selected[definition.key] = _unique(values)

    return selected


def canonicalize_selected_filters(selected, options_by_key):
    canonical = {}

    for definition in FILTER_DEFINITIONS:
        value = selected.get(definition.key)

        if definition.control in {"range", "year"}:
            canonical[definition.key] = value
            continue

        known_values = {
            option["value"] for option in options_by_key[definition.key]
        }

        if definition.selection == "single":
            canonical[definition.key] = (
                value if not known_values or value in known_values else ""
            )
        else:
            canonical[definition.key] = (
                [item for item in value if item in known_values]
                if known_values
                else value
            )

    return canonical


def build_api_filter_params(selected):
    parameters = {}

    for definition in FILTER_DEFINITIONS:
        value = selected.get(definition.key)

        if definition.control == "range":
            if value["min"] > MEMORY_MIN_GB:
                parameters["memory_gte"] = _gb_to_bytes(value["min"])
            if value["max"] < MEMORY_MAX_GB:
                parameters["memory_lte"] = _gb_to_bytes(value["max"])
            continue

        if definition.control == "year":
            if _is_valid_year(value):
                parameters[definition.api_parameter] = value
            continue

        if definition.key == "model_family":
            continue

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


def build_options_by_key(
    certified_makes, certified_releases, derived_options=None
):
    options = {definition.key: [] for definition in FILTER_DEFINITIONS}
    options["category"] = list(CATEGORY_OPTIONS)
    derived_options = derived_options or {}

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

    for key in ("model_family", "gpu", "processor_model"):
        for option in derived_options.get(key, []):
            if not isinstance(option, dict):
                continue
            value = str(option.get("value") or "").strip()
            label = str(option.get("label") or "").strip()
            available_for = option.get("available_for")
            if value and label and isinstance(available_for, list):
                options[key].append(
                    make_filter_option(value, label, available_for)
                )

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

        if definition.control == "range":
            if value["min"] > MEMORY_MIN_GB:
                parameters["memory_min"] = [str(value["min"])]
            if value["max"] < MEMORY_MAX_GB:
                parameters["memory_max"] = [str(value["max"])]
        elif value:
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
        value = selected[definition.key]
        selected_values = (
            value
            if definition.control == "checkbox"
            and definition.selection == "multiple"
            else [value]
            if definition.selection == "single" and value
            else []
        )
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
        options = (
            order_filter_options(
                definition.key,
                options_with_selected,
                selected_values,
                selected_categories,
            )
            if definition.control == "checkbox"
            else []
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

        is_active = _filter_is_active(definition.control, value)
        if (
            definition.option_source
            in {"model_family", "gpu", "processor_model"}
            and not option_models
            and not is_active
        ):
            continue

        view_models.append(
            {
                **asdict(definition),
                "options": option_models,
                "selected_count": int(is_active)
                if definition.control in {"range", "year"}
                or definition.selection == "single"
                else len(selected_values),
                "expanded": definition.default_expanded or is_active,
                "show_option_search": definition.control == "checkbox"
                and len(option_models) > FILTER_OPTION_LIMIT,
                "value": value,
                "memory_min": value["min"]
                if definition.control == "range"
                else MEMORY_MIN_GB,
                "memory_max": value["max"]
                if definition.control == "range"
                else MEMORY_MAX_GB,
                "memory_min_limit": MEMORY_MIN_GB,
                "memory_max_limit": MEMORY_MAX_GB,
                "memory_step": MEMORY_STEP_GB,
                "year_is_invalid": definition.control == "year"
                and bool(value)
                and not _is_valid_year(value),
                "url_keys": definition.url_keys or (definition.key,),
            }
        )

    return view_models


def _memory_bound(value, default):
    try:
        value = int(value)
    except (TypeError, ValueError):
        return default

    value = max(MEMORY_MIN_GB, min(MEMORY_MAX_GB, value))
    return min(
        MEMORY_MAX_GB,
        ((value + MEMORY_STEP_GB // 2) // MEMORY_STEP_GB)
        * MEMORY_STEP_GB,
    )


def _gb_to_bytes(value):
    return value * 1_000_000_000


def _is_valid_year(value):
    return bool(re.fullmatch(r"[0-9]{4}", value or ""))


def _filter_is_active(control, value):
    if control == "range":
        return (
            value["min"] > MEMORY_MIN_GB
            or value["max"] < MEMORY_MAX_GB
        )
    return bool(value)
