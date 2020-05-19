from marshmallow import fields, Schema


class NoticeSchema(Schema):
    notice_id = fields.Str(data_key="id", required=True)
    title = fields.Str(required=True)
    summary = fields.Str(required=True)
    description = fields.Str(required=True)
    action = fields.Str()
    releases = fields.Dict(required=True)
    references = fields.List(fields.Str(), data_key="cves")
    timestamp = fields.Float(required=True)


class CVESchema(Schema):
    cve_id = fields.Str(data_key="id", required=True)
    candidate = fields.Str(required=True)
    public_date = fields.Str(required=True)
    public_date_usn = fields.Str()
    crd = fields.Str()
    description = fields.Str()
    ubuntu_description = fields.Str()
    notes = fields.Str()
    mitigation = fields.Str()
    priority = fields.Str()
    discovered_by = fields.Str()
    assigned_to = fields.Str()
    approved_by = fields.Str()
    cvss = fields.Str()  # CVSS 3 and Base Score
    packages = fields.List(fields.Str(), data_key="package")
    references = fields.List(fields.Str(), data_key="cve_references")
    bugs = fields.List(fields.Str(), data_key="cve_bugs")
