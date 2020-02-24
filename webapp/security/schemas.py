from marshmallow import fields, Schema


class NoticeSchema(Schema):
    notice_id = fields.Str(data_key="id", required=True)
    title = fields.Str(required=True)
    summary = fields.Str(required=True)
    isummary = fields.Str()
    description = fields.Str(required=True)
    action = fields.Str()
    releases = fields.Dict(required=True)
    references = fields.List(fields.Str(), data_key="cves")
    timestamp = fields.Float(required=True)
