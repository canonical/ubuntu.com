import dateutil.parser
from marshmallow import Schema
from marshmallow.fields import DateTime, Dict, Float, List, Nested, Str


class NoticeSchema(Schema):
    id = Str(required=True)
    title = Str(required=True)
    summary = Str(required=True)
    description = Str(required=True)
    action = Str()
    releases = Dict(required=True)
    references = List(Str())
    timestamp = Float(required=True)


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


class ParsedDateTime(DateTime):
    default_error_messages = {"parse_error": "dateutil cannot parse {input}."}

    def _deserialize(self, value, attr, data, **kwargs):
        try:
            date = dateutil.parser.parse(value)
        except (OverflowError, ValueError):
            raise self.make_error("parse_error", input=value)

        return super()._deserialize(date.isoformat(), attr, data, **kwargs)


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
