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
def _validate_release_codenames(release_packages):
    codenames = set(rel.codename for rel in db_session.query(Release).all())
    unrecognised_codenames = set(release_packages.keys()) - codenames

    if unrecognised_codenames:
        raise ValidationError(
            f"Unrecognised release codenames: {unrecognised_codenames}"
        )


class NoticePackage(Schema):
    name = Str(required=True)
    version = Str(required=True)
    description = Str(required=True)


class NoticeSchema(Schema):
    id = Str(required=True)
    title = Str(required=True)
    summary = Str(required=True)
    instructions = Str(required=True)
    references = List(Str())
    cves = List(Str(validate=Regexp(r"(cve-|CVE-)\d{4}-\d{4,7}")))
    published = ParsedDateTime(required=True)
    description = Str(allow_none=True)
    release_packages = Dict(
        keys=Str(),
        values=List(Nested(NoticePackage), required=True),
        validate=_validate_release_codenames,
    )


# CVEs
# --
class Status(Schema):
    release_codename = Str(required=True)
    status = Str(required=True)
    description = Str(allow_none=True)


class CvePackage(Schema):
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
    published = ParsedDateTime(allow_none=True)
    description = Str(allow_none=True)
    ubuntu_description = Str(allow_none=True)
    notes = List(Nested(Note))
    priority = Str(allow_none=True)
    status = Str(allow_none=True)
    cvss3 = Float(allow_none=True)
    packages = List(Nested(CvePackage))
    references = List(Str())
    bugs = List(Str())
