import dateutil.parser
from marshmallow import Schema, ValidationError
from marshmallow.fields import DateTime, Dict, Float, List, Nested, Str
from marshmallow.validate import Regexp


from webapp.security.database import db_session
from webapp.security.models import Release


# Types
# ===


class ParsedDateTime(DateTime):
    default_error_messages = {"parse_error": "dateutil cannot parse {input}."}

    def _deserialize(self, value, attr, data, **kwargs):
        try:
            date = dateutil.parser.parse(value)
        except (OverflowError, ValueError):
            raise self.make_error("parse_error", input=value)

        return super()._deserialize(date.isoformat(), attr, data, **kwargs)


# Schemas
# ===


# Notices
# --
def _validate_release_packages(release_packages):
    codenames = set(rel.codename for rel in db_session.query(Release).all())
    unrecognised_codenames = set(release_packages.keys()) - codenames

    if unrecognised_codenames:
        raise ValidationError(
            f"Unrecognised release codenames: {unrecognised_codenames}"
        )


class NoticeSchema(Schema):
    id = Str(required=True)
    title = Str(required=True)
    summary = Str(required=True)
    instructions = Str(required=True)
    references = List(Str())
    cves = List(Str(validate=Regexp(r"(cve-|CVE-)\d{4}-\d{4,7}")))
    published = ParsedDateTime(required=True)
    description = Str(allow_none=True)
    release_packages = Dict(validate=_validate_release_packages)


# CVEs
# --
class Status(Schema):
    release_codename = Str(required=True)
    status = Str(required=True)
    description = Str()


class Package(Schema):
    name = Str(required=True)
    source = Str(required=True)
    ubuntu = Str(required=True)
    debian = Str(required=True)
    statuses = List(Nested(Status))


class Note(Schema):
    author = Str(required=True)
    note = Str(required=True)


class CVESchema(Schema):
    id = Str(required=True)
    published = ParsedDateTime()
    description = Str()
    ubuntu_description = Str()
    notes = List(Nested(Note))
    priority = Str()
    status = Str()
    cvss3 = Float(allow_none=True)
    packages = List(Nested(Package))
    references = List(Str())
    bugs = List(Str())
