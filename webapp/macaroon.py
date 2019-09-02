from openid.extension import Extension as OpenIDExtension


class MacaroonRequest(OpenIDExtension):
    ns_uri = "http://ns.login.ubuntu.com/2016/openid-macaroon"
    ns_alias = "macaroon"

    def __init__(self, caveat_id):
        self.caveat_id = caveat_id

    def getExtensionArgs(self):
        """
        Return the arguments to add to the OpenID request query
        """

        return {"caveat_id": self.caveat_id}


class MacaroonResponse(OpenIDExtension):
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
