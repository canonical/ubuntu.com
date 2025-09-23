# Standard library
from datetime import datetime
import re


"""
Return the summarized status for a CVE
"""


def get_summarized_status(
    cve,
    ignored_low_indicators,
    vulnerable_indicators,
    friendly_names,
    versions,
):
    status_count = {
        "ignored-high": 0,
        "ignored-low": 0,
        "needs-triage": 0,
        "not-affected": 0,
        "vulnerable": 0,
        "released": 0,
        "DNE": 0,
    }

    package_count = 0

    for package in cve["packages"]:
        package_count += len(package["statuses"])
        for status in package["statuses"]:
            description = status["description"].lower()

            # If CVE list is filtered by versions,
            # skip statuses that are not for those versions
            if versions:
                if status["release_codename"] not in versions:
                    package_count -= 1
                    continue

            if status["release_codename"] != "upstream":
                if status["status"] == "ignored":
                    if any(
                        indicator in description
                        for indicator in ignored_low_indicators
                    ):
                        status_count["ignored-low"] += 1
                    else:
                        status_count["ignored-high"] += 1
                elif status["status"] == "released":
                    status_count["released"] += 1
                elif status["status"] in vulnerable_indicators:
                    status_count["vulnerable"] += 1
                elif status["status"] == "needs-triage":
                    status_count["needs-triage"] += 1
                elif status["status"] == "not-affected":
                    status_count["not-affected"] += 1
                elif status["status"] == "DNE":
                    status_count["DNE"] += 1
            else:
                # Exclude upstream release from package count
                package_count -= 1

    # Check if all statuses are the same
    count = 0
    for key, value in status_count.items():
        if key != "DNE" and value > 0:
            count += 1
            key_with_non_zero_value = key

    if count == 1:
        if (
            key_with_non_zero_value == "ignored-high"
            or key_with_non_zero_value == "ignored-low"
        ):
            return friendly_names["ignored"]
        else:
            return friendly_names[key_with_non_zero_value]
    else:
        """
        Calculate the number of cases that are “Fixable”, which is the total
        number of cases minus “Not in release”, “Not affected”
        and “Ignored (Low)”.
        """
        total_fixable = (
            package_count
            - status_count["DNE"]
            - status_count["not-affected"]
            - status_count["ignored-low"]
        )

        if total_fixable and status_count["released"] == total_fixable:
            return friendly_names["released"]
        elif total_fixable and status_count["vulnerable"] == total_fixable:
            return friendly_names["vulnerable"]
        elif status_count["released"] > 0:
            return {
                "name": "Some fixed",
                "fixed_count": status_count["released"],
                "fixable_count": total_fixable,
            }
        elif status_count["vulnerable"] > 0:
            return friendly_names["vulnerable"]
        elif status_count["needs-triage"] > 0:
            return friendly_names["needs-triage"]
        elif status_count["ignored-high"] > 0:
            return friendly_names["ignored"]
        elif status_count["not-affected"] > 0:
            return friendly_names["not-affected"]
        elif status_count["DNE"] > 0:
            return friendly_names["DNE"]


"""
Calls releases endpoint and formats releases based on version support.
They are divided into four categories:
LTS releases - in standard support and flagged as LTS.
ESM releases - out of standard support but within extended support(ESM)
and flagged as ESM.
Interim releases - in standard support but not LTS or ESM.
Maintained releases - all LTS, ESM, and interim releases.
Unmaintained - out of standard, LTS, and ESM support.
"""


def get_formatted_releases(security_api, versions):
    # Releases in desc order
    releases_json = security_api.get_releases()

    # Filter out "upstream" releases and those still in development
    all_releases = []
    for release in releases_json:
        if (
            release["codename"] != "upstream"
            and release["development"] is not True
        ):
            all_releases.append(release)

    maintained_releases = []
    lts_releases = []
    unmaintained_releases = []
    interim_releases = []
    esm_releases = []

    # Releases show in the CVE table and search results
    selected_releases = []

    for release in all_releases:
        # Format dates
        support_date = datetime.strptime(
            release["support_expires"], "%Y-%m-%dT%H:%M:%S"
        )
        esm_date = datetime.strptime(
            release["esm_expires"], "%Y-%m-%dT%H:%M:%S"
        )

        if support_date > datetime.now():
            if release["support_tag"] == "LTS":
                lts_releases.append(release)
            else:
                interim_releases.append(release)
        else:
            if esm_date > datetime.now():
                if release["support_tag"] == "ESM":
                    esm_releases.append(release)
            else:
                unmaintained_releases.append(release)

        # Filter selected releases based on version filters
        # Defaults to the 5 most recent maintained releases
        # if no version filters are present
        if versions and versions != [""]:
            for version in versions:
                if version == release["codename"]:
                    # cap to show maximum of 5 releases
                    if len(selected_releases) < 5:
                        selected_releases.append(release)
                    else:
                        break
        else:
            selected_releases = lts_releases + esm_releases[:2]

    maintained_releases = lts_releases + esm_releases + interim_releases
    lts_and_esm_releases = lts_releases + esm_releases

    selected_releases = sorted(
        selected_releases,
        key=lambda d: d["version"],
        reverse=True,
    )

    formatted_releases = {
        "all_releases": all_releases,
        "maintained_releases": maintained_releases,
        "selected_releases": selected_releases,
        "lts_releases": lts_releases,
        "unmaintained_releases": unmaintained_releases,
        "interim_releases": interim_releases,
        "esm_releases": esm_releases,
        "lts_and_esm_releases": lts_and_esm_releases,
    }

    return formatted_releases


"""
Format statuses based on friendly names
"""


def get_formatted_release_statuses(cve_package, friendly_names):
    cve_package["release_statuses"] = {}

    for status in cve_package["statuses"]:
        friendly_status = friendly_names[status["status"]]
        cve_package["release_statuses"][status["release_codename"]] = {
            "slug": status["status"],
            "name": friendly_status["name"],
            "pocket": status["pocket"],
            "icon": friendly_status["icon"],
        }

    return cve_package["release_statuses"]


"""
Checks if there is only an upstream status for a CVE with only 1 package
"""


def is_only_upstream(cve):
    if len(cve["packages"]) == 1 and len(cve["packages"][0]["statuses"]) == 1:
        if cve["packages"][0]["statuses"][0]["release_codename"] == "upstream":
            return True
    return False


"""
Checks if references link is from a default reference URL
"""


def does_not_include_base_url(link):
    default_reference_urls = [
        "https://cve.mitre.org/",
        "https://nvd.nist.gov",
        "https://launchpad.net/",
        "https://security-tracker.debian.org",
        "https://ubuntu.com/security/notices",
    ]
    for base_url in default_reference_urls:
        if base_url in link:
            return False
    return True


def get_friendly_pockets(label):
    friendly_pockets = {
        "esm-infra": {
            "text": "Fix available with Ubuntu Pro.",
            "label": "Ubuntu Pro",
            "href": "/pro",
        },
        "esm-infra-legacy": {
            "text": (
                "Fix available with Ubuntu Pro via Legacy Support add-on."
            ),
            "label": "Ubuntu Pro",
            "href": "/pro",
        },
        "esm-apps": {
            "text": (
                "Fix available with Ubuntu Pro via "
                "ESM Apps. A community fix "
                "might become publicly available "
                "in the future. "
            ),
            "label": "Ubuntu Pro",
            "href": "/pro",
        },
        "fips": {
            "text": "FIPS-140 certified package. Available with Ubuntu Pro.",
            "label": "FIPS",
            "href": "/security/fips",
        },
        "fips-updates": {
            "text": (
                "FIPS-140 certified package with "
                "security fixes. Available with "
                "Ubuntu Pro."
            ),
            "label": "FIPS Updates",
            "href": "/security/fips",
        },
        "realtime": {
            "text": "Real-time kernel available with Ubuntu Pro.",
            "label": "Real-time",
            "href": "/real-time",
        },
    }

    if label in friendly_pockets:
        return friendly_pockets[label]


def get_processed_details(markdown_parser, notice):
    pattern = re.compile(
        r"(?<![a-zA-Z0-9-_/])((cve|CVE-)\d{4}-\d{4,7})(?!\.html)", re.MULTILINE
    )

    details = markdown_parser(
        re.sub(
            pattern, r'<a href="/security/\1">\1</a>', notice["description"]
        )
    )

    # Remove redundant list of CVEs
    all_items = re.findall(r"<li>(.*?)</li>", details, re.DOTALL)
    if all_items:
        last_item = all_items[-1]
        if last_item:
            cleaned_last_item = last_item.split(";")[0]
            details = details.replace(last_item, cleaned_last_item)

    return details


def get_attention_banner(details):
    """
    Extract the "ATTENTION:" section from the details if present and return it.
    """
    extract_details = details.split("ATTENTION: ")
    instructions = extract_details[0]
    attention_banner = (
        "ATTENTION: " + extract_details[1]
        if len(extract_details) > 1
        else None
    )

    return attention_banner, instructions
