# Standard library
from datetime import datetime


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
        if key_with_non_zero_value == "ignored-high":
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
Checks if there is only an upstream status for a CVE with only 1 package
"""


def is_only_upstream(cve):
    if len(cve["packages"]) == 1 and len(cve["packages"][0]["statuses"]) == 1:
        if cve["packages"][0]["statuses"][0]["release_codename"] == "upstream":
            return True
    return False


"""
Calls releases endpoint and filters releases based on version support
"""


def get_formatted_releases(security_api, versions):
    # Releases in desc order
    releases_json = security_api.get_releases()

    # Releases without "upstream"
    all_releases = []
    for release in releases_json:
        if release["codename"] != "upstream":
            all_releases.append(release)

    maintained_releases = []
    selected_releases = []
    lts_releases = []
    unmaintained_releases = []

    for release in all_releases:
        # format dates
        support_date = datetime.strptime(
            release["support_expires"], "%Y-%m-%dT%H:%M:%S"
        )
        esm_date = datetime.strptime(
            release["esm_expires"], "%Y-%m-%dT%H:%M:%S"
        )
        release_date = datetime.strptime(
            release["release_date"], "%Y-%m-%dT%H:%M:%S"
        )

        if support_date < datetime.now():
            if esm_date > datetime.now():
                if release["lts"] and release_date < datetime.now():
                    lts_releases.append(release)
            else:
                unmaintained_releases.append(release)
        elif release_date < datetime.now():
            maintained_releases.append(release)

        # filter releases
        if versions and versions != [""]:
            for version in versions:
                if version == release["codename"]:
                    # cap to show maximum of 5 releases
                    if len(selected_releases) < 5:
                        selected_releases.append(release)
                    else:
                        break
        else:
            selected_releases = maintained_releases + lts_releases[:2]

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
