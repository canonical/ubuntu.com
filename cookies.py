from itsdangerous import URLSafeTimedSerializer, TimestampSigner
from flask.sessions import TaggedJSONSerializer
import hashlib

session = {}

session["openid"] = {
  "identity_url":"login.ubuntu.com",
  "nickname": "Min",
  "fullname": "Min Kim",
  "image": "test",
  "email": "min.cookie@test.com",
  "is_community_member": False,
}

x = URLSafeTimedSerializer(
  "insecure_dev_key",
  salt='cookie-session',
  serializer=TaggedJSONSerializer(),
  signer=TimestampSigner,
  signer_kwargs={
    'key_derivation': 'hmac',
    'digest_method': hashlib.sha1
  },
).dumps(session)

print("x",x)
