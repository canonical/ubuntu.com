from collections import Counter


def get_summarized_status(cve, ignored_low_indicators, vulnerable_indicators):
    """
    Return the summarized status for a CVE
    """
        
    for package in cve["packages"]:
        # Check if all statuses for all packages are the same, excluding DNE and empty data
        if (len({d["status"] for d in package["statuses"] if d["status"] not in {"DNE", ""}}) == 1):
            #  todo: set status
            cve["summarized_status"] = {
                "name" : cve["packages"][0]["statuses"][0]["status"]
            }                
        else:
            # Considered ignored_low if status is ignored and status description contains any of the indicators
            for status in package["statuses"]:
                if "ignored" in status["status"]:
                    if any(indicator in status["description"].lower() for indicator in ignored_low_indicators):
                        status["status"] = "ignored-low"

            # Ignoring "DNE" and "ignored-low" statuses, check if all other statuses are "not-affected"
            if (len({d["status"] for d in package["statuses"] if d["status"] not in {"DNE", "ignored-low"}}) == len("not-affected")):
                cve["summarized_status"] = {
                    "name" : "Not affected"    
                }

            # Ignoring "DNE", "not-affected", and "ignored-low" statuses, check if all other statuses are "released"
            elif (len({d["status"] == "released" for d in package["statuses"] if d["status"] not in {"DNE", "not-affected", "ignored-low"}}) == len("released")):
                cve["summarized_status"] = {
                    "name" : "Fixed"    
                }

            # If any package status is released, count how many packages have that status
            elif (any(d["status"] == "released" for d in package["statuses"])):
                fixed_count = Counter(d["status"] for d in package["statuses"] if d["status"] == "released")
                cve["summarized_status"] = {
                    "name" : "Some fixed",
                    "fixed_count" : fixed_count["released"],
                    "total_count" : len(package["statuses"])
                }

            elif (any(d["status"] in vulnerable_indicators for d in package["statuses"])):
                cve["summarized_status"] = {
                    "name" : "Vulnerable",
                }

            elif (any(d["status"] == "needs-triage" for d in package["statuses"])):
                cve["summarized_status"] = {
                    "name" : "Needs evaluation",
                }

    return cve["summarized_status"]