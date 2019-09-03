# Standard library
import base64

# Packages
from openid.extension import Extension


def binary_serialize_macaroons(macaroons):
    """Encode all serialized macaroons and concatonate as a serialize bytes
    @param macaroons: Iterable of macaroons lead by root_macaroon as first
       element followed by any discharge macaroons to serialize
    """
    serialized_macaroons = []
    for macaroon in macaroons:
        serialized = macaroon.serialize()
        encoded = serialized.encode("utf-8")
        padded = encoded + b"=" * (-len(encoded) % 4)
        serialized_macaroons.append(base64.urlsafe_b64decode(padded))

    serialized = base64.urlsafe_b64encode(b"".join(serialized_macaroons))

    return serialized + b"=" * (-len(serialized) % 4)


class MacaroonRequest(Extension):
    ns_uri = "http://ns.login.ubuntu.com/2016/openid-macaroon"
    ns_alias = "macaroon"

    def __init__(self, caveat_id):
        self.caveat_id = caveat_id

    def getExtensionArgs(self):
        """
        Return the arguments to add to the OpenID request query
        """

        return {"caveat_id": self.caveat_id}


class MacaroonResponse(Extension):
    ns_uri = "http://ns.login.ubuntu.com/2016/openid-macaroon"
    ns_alias = "macaroon"

    def getExtensionArgs(self):
        """
        Return the arguments to add to the OpenID request query
        """

        return {"discharge": self.discharge}

    def fromSuccessResponse(cls, success_response, signed_only=True):
        self = cls()
        if signed_only:
            args = success_response.getSignedNS(self.ns_uri)
        else:
            args = success_response.message.getArgs(self.ns_uri)

        if not args:
            return None

        self.discharge = args["discharge"]

        return self

    fromSuccessResponse = classmethod(fromSuccessResponse)
