import json
from requests import Response


def get_mock_cue_annotated_contract_items(email):
    res = Response()
    if email == "test@fail.com":
        res._content = b'{"code": "unauthorized","message": "unauthorized","traceId": "4f741380-317d-409d-a2e2-ed3e89565f56"}'
        res.status_code = 401
        
    else:

        mock_exams = [
            {
                "accountContext": {
                    "accountID": "aACn1zQinsAFEXOj7i6qfQu_4x-43D64hbJt8YSoWgqI",
                    "accountName": "abhigyan.ghosh@canonical.com",
                    "role": "admin",
                },
                "contractContext": {
                    "name": "CUE TEST",
                    "products": ["cue-test"],
                },
                "contractItem": {
                    "contractID": "cANpqPzOHsk0bUMbUtpTpvmKnODJX3AKl1HfE4OpWZJ4",
                    "created": "2023-04-04T13:02:35Z",
                    "effectiveFrom": "2023-04-04T13:02:35Z",
                    "effectiveTo": "2023-05-04T13:02:35Z",
                    "id": 26859,
                    "lastModified": "2023-04-04T13:02:35Z",
                    "metric": "units",
                    "reason": "key_activated",
                    "value": 1,
                },
                "cueContext": {"courseID": "cue-test"},
                "effectivenessContext": {"status": "expired"},
            },
            {
                "accountContext": {
                    "accountID": "aACn1zQinsAFEXOj7i6qfQu_4x-43D64hbJt8YSoWgqI",
                    "accountName": "abhigyan.ghosh@canonical.com",
                    "role": "admin",
                },
                "contractContext": {
                    "name": "CUE Linux Essentials",
                    "products": ["cue-linux-essentials"],
                },
                "contractItem": {
                    "contractID": "cAO72UxVtFCY-JQzRqfY5wlCHX64oBkTP61JqoQwCpGA",
                    "created": "2023-05-19T09:10:25Z",
                    "effectiveFrom": "2023-05-19T09:10:25Z",
                    "effectiveTo": "2023-06-18T09:10:25Z",
                    "id": 29399,
                    "lastModified": "2023-05-19T09:10:25Z",
                    "metric": "units",
                    "reason": "key_activated",
                    "value": 1,
                },
                "cueContext": {"courseID": "cue-linux-essentials"},
                "effectivenessContext": {"status": "expired"},
            },
        ]
        res._content = json.dumps(mock_exams).encode("utf-8")
        res.status_code = 200
    
    res.raise_for_status()
    return res.json()
