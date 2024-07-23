def get_summarized_status(
    cve,
    ignored_low_indicators,
    vulnerable_indicators,
    friendly_names,
    versions,
):
    """
    Return the summarized status for a CVE
    """
    status_count = {
        "ignored": 0,
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
                        status_count["ignored"] += 1
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
        cve["summarized_status"] = friendly_names[key_with_non_zero_value]
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
            cve["summarized_status"] = friendly_names["released"]
        elif total_fixable and status_count["vulnerable"] == total_fixable:
            cve["summarized_status"] = friendly_names["vulnerable"]
        elif total_fixable and status_count["not-affected"] == total_fixable:
            cve["summarized_status"] = friendly_names["not-affected"]
        elif status_count["released"] > 0:
            cve["summarized_status"] = {
                "name": "Some fixed",
                "fixed_count": status_count["released"],
                "fixable_count": total_fixable,
            }
        elif status_count["vulnerable"] > 0:
            cve["summarized_status"] = friendly_names["vulnerable"]
        elif status_count["needs-triage"] > 0:
            cve["summarized_status"] = friendly_names["needs-triage"]
        elif status_count["DNE"] > 0:
            cve["summarized_status"] = friendly_names["DNE"]

    return cve["summarized_status"]
