# Standard library
import json
import logging
import os
import tempfile
import threading
import time
from pathlib import Path

# Packages
from filelock import FileLock
from filelock import Timeout as FileLockTimeout


logger = logging.getLogger(__name__)

CACHE_VERSION = 5
CACHE_TTL_SECONDS = 7 * 24 * 60 * 60
CONFIGURATION_DETAIL_PAGE_SIZE = 500
DERIVED_OPTION_KEYS = ("model_family", "processor_model", "gpu")
DEFAULT_CACHE_PATH = "/tmp/ubuntu-com-certified-filter-options.json"
FILTER_CATEGORY_BY_API_VALUE = {
    "Laptop": "Laptop",
    "Desktop": "Desktop",
    "Server": "Server",
    "Ubuntu Core": "IoT",
    "Server SoC": "SoC",
}
FILTER_CATEGORY_ORDER = ("Laptop", "Desktop", "Server", "IoT", "SoC")


class FilterOptionCache:
    def __init__(self, cache_path=None, ttl_seconds=CACHE_TTL_SECONDS):
        self.cache_path = Path(
            cache_path
            or os.environ.get(
                "CERTIFIED_FILTER_CACHE_PATH", DEFAULT_CACHE_PATH
            )
        )
        self.lock_path = f"{self.cache_path}.lock"
        self.ttl_seconds = ttl_seconds
        self._state_lock = threading.Lock()
        self._refreshing = False

    def get_or_refresh(self, builder):
        payload = self._read_payload()
        if self._is_fresh(payload):
            return self._options_from_payload(payload)

        self._start_refresh(builder)
        return self._options_from_payload(payload)

    def has_options(self):
        options = self._options_from_payload(self._read_payload())
        return all(options[key] for key in DERIVED_OPTION_KEYS)

    def _start_refresh(self, builder):
        with self._state_lock:
            if self._refreshing:
                return
            self._refreshing = True

        thread = threading.Thread(
            target=self._refresh,
            args=(builder,),
            daemon=True,
            name="certified-filter-cache-refresh",
        )
        thread.start()

    def _refresh(self, builder):
        try:
            self.cache_path.parent.mkdir(
                mode=0o700, parents=True, exist_ok=True
            )
            with FileLock(self.lock_path, timeout=0):
                payload = self._read_payload()
                if self._is_fresh(payload):
                    return

                options = self._normalise_options(builder())
                self._write_payload(
                    {
                        "version": CACHE_VERSION,
                        "generated_at": time.time(),
                        "options": options,
                    }
                )
        except FileLockTimeout:
            return
        except Exception:
            logger.exception("Failed to refresh certified filter options")
        finally:
            with self._state_lock:
                self._refreshing = False

    def _read_payload(self):
        try:
            with self.cache_path.open(encoding="utf-8") as cache_file:
                payload = json.load(cache_file)
        except (FileNotFoundError, json.JSONDecodeError, OSError, TypeError):
            return None

        if not isinstance(payload, dict):
            return None
        if payload.get("version") != CACHE_VERSION:
            return None
        if not isinstance(payload.get("generated_at"), (int, float)):
            return None
        if not isinstance(payload.get("options"), dict):
            return None
        return payload

    def _is_fresh(self, payload):
        if payload is None:
            return False

        age = time.time() - payload["generated_at"]
        return 0 <= age < self.ttl_seconds

    def _options_from_payload(self, payload):
        if payload is None:
            return self._normalise_options({})
        return self._normalise_options(payload["options"])

    def _normalise_options(self, options):
        if not isinstance(options, dict):
            raise ValueError("Certified filter options must be a dictionary")

        normalised = {}
        for key in DERIVED_OPTION_KEYS:
            value = options.get(key, [])
            if not isinstance(value, list):
                raise ValueError(
                    f"Certified filter option '{key}' must be a list"
                )
            normalised[key] = value
        return normalised

    def _write_payload(self, payload):
        temporary_path = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                dir=self.cache_path.parent,
                prefix=f".{self.cache_path.name}.",
                suffix=".tmp",
                delete=False,
            ) as temporary_file:
                temporary_path = temporary_file.name
                json.dump(payload, temporary_file, sort_keys=True)
                temporary_file.flush()
                os.fsync(temporary_file.fileno())

            os.chmod(temporary_path, 0o600)
            os.replace(temporary_path, self.cache_path)
        finally:
            if temporary_path and os.path.exists(temporary_path):
                os.unlink(temporary_path)


def build_derived_filter_options(api):
    platforms = {}
    video_categories_by_name = {}
    processor_categories_by_name = {}

    for detail in _configuration_details(api):
        filter_category = FILTER_CATEGORY_BY_API_VALUE.get(
            detail.get("category")
        )
        if filter_category is None:
            continue

        platform_id = str(detail.get("platform_id") or "").strip()
        platform_name = str(detail.get("platform_name") or "").strip()
        platform_make = str(detail.get("make") or "").strip()
        if (
            platform_id
            and platform_name
            and platform_name.casefold() != platform_id.casefold()
        ):
            platform = platforms.get(platform_id)
            if platform and platform["name"] != platform_name:
                logger.warning(
                    "Platform %s has conflicting names: %s and %s",
                    platform_id,
                    platform["name"],
                    platform_name,
                )
            else:
                platform = platforms.setdefault(
                    platform_id,
                    {
                        "name": platform_name,
                        "make": platform_make,
                        "available_for": set(),
                    },
                )
                if platform_make and not platform["make"]:
                    platform["make"] = platform_make
                elif platform_make and platform["make"] != platform_make:
                    logger.warning(
                        "Platform %s has conflicting makes: %s and %s",
                        platform_id,
                        platform["make"],
                        platform_make,
                    )
                platform["available_for"].add(filter_category)

        _add_device_name_categories(
            video_categories_by_name,
            detail.get("video") or [],
            filter_category,
        )
        _add_device_name_categories(
            processor_categories_by_name,
            detail.get("processor") or [],
            filter_category,
        )

    model_families = [
        {
            "value": platform_id,
            "label": _model_family_label(
                platform["make"], platform["name"]
            ),
            "available_for": _ordered_categories(
                platform["available_for"]
            ),
        }
        for platform_id, platform in platforms.items()
    ]
    model_families.sort(
        key=lambda option: (option["label"].casefold(), option["value"])
    )

    return {
        "model_family": model_families,
        "processor_model": _device_options(processor_categories_by_name),
        "gpu": _device_options(video_categories_by_name),
    }


def _model_family_label(make, platform_name):
    if not make or platform_name.casefold().startswith(
        f"{make.casefold()} "
    ):
        return platform_name
    return f"{make} {platform_name}"


def _configuration_details(api):
    offset = 0

    while True:
        payload = api.certified_configuration_details(
            limit=CONFIGURATION_DETAIL_PAGE_SIZE,
            offset=offset,
        )
        details = payload.get("results", [])
        if not isinstance(details, list):
            raise ValueError(
                "Certified configuration details must be a list"
            )

        yield from details

        if len(details) < CONFIGURATION_DETAIL_PAGE_SIZE:
            return
        offset += len(details)


def _add_device_name_categories(categories_by_name, devices, category):
    for device in devices:
        name = str(device.get("name") or "").strip()
        identifier = str(device.get("identifier") or "").strip()
        if name and name.casefold() != identifier.casefold():
            categories_by_name.setdefault(name, set()).add(category)


def _ordered_categories(categories):
    return [
        category
        for category in FILTER_CATEGORY_ORDER
        if category in categories
    ]


def _device_options(categories_by_name):
    options = [
        {
            "value": name,
            "label": name,
            "available_for": _ordered_categories(categories),
        }
        for name, categories in categories_by_name.items()
    ]
    return sorted(options, key=lambda option: option["label"].casefold())
