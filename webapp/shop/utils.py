from typing import Tuple

import flask

from webapp.login import user_info


def get_exam_contract_id(contract) -> int:
    return contract.get("id") or contract["contractItem"]["id"]


def get_user_first_last_name() -> Tuple[str, str]:
    sso_user = user_info(flask.session)
    name = sso_user["fullname"].rsplit(" ", maxsplit=1)
    first_name = name[0] if len(name) > 0 else ""
    last_name = name[1] if len(name) > 1 else ""

    return first_name, last_name
