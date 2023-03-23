from openid.extension import Extension


class TeamsRequest(Extension):
    """An object to hold the state of a Launchpad teams request.

    @ivar query_membership: A comma separated list of Launchpad team
        names that the RP is interested in.
    @type required: [str]

    @group Consumer: requestTeams, getExtensionArgs
    """

    ns_uri = "http://ns.launchpad.net/2007/openid-teams"
    ns_alias = "lp-teams"

    def __init__(self, query_membership=None):
        """Initialize an empty Launchpad teams request"""
        Extension.__init__(self)

        self.query_membership = []

        if query_membership:
            self.requestTeams(query_membership)

    def getExtensionArgs(self):
        """
        Return the arguments to add to the OpenID request query
        """
        args = {}

        if self.query_membership:
            args["query_membership"] = ",".join(self.query_membership)

        return args

    def requestTeam(self, team_name, strict=False):
        """Request the specified team from the OpenID user

        @param team_name: the unqualified Launchpad team name
        @type team_name: str

        @param strict: whether to raise an exception when a team is
            added to a request more than once

        @raise ValueError: when strict is set and the team was
            requested more than once
        """
        if strict:
            if team_name in self.query_membership:
                raise ValueError("That team has already been requested")
        else:
            if team_name in self.query_membership:
                return

        self.query_membership.append(team_name)

    def requestTeams(self, query_membership, strict=False):
        """Add the given list of teams to the request

        @param query_membership: The Launchpad teams request
        @type query_membership: [str]

        @raise ValueError: when a team requested is not a string
            or strict is set and a team was requested more than once
        """
        if isinstance(query_membership, str):
            raise TypeError(
                "Teams should be passed as a list of "
                "strings (not %r)" % (type(query_membership),)
            )

        for team_name in query_membership:
            self.requestTeam(team_name, strict=strict)


class TeamsResponse(Extension):
    """Represents the data returned in a Launchpad teams response
    inside of an OpenID C{id_res} response. This object will be
    created by the OpenID server, added to the C{id_res} response
    object, and then extracted from the C{id_res} message by the
    Consumer.

    @group Consumer: fromSuccessResponse
    """

    ns_uri = "http://ns.launchpad.net/2007/openid-teams"
    ns_alias = "lp-teams"

    def fromSuccessResponse(cls, success_response, signed_only=True):
        """Create a C{L{TeamsResponse}} object from a successful OpenID
        library response
        (C{L{openid.consumer.consumer.SuccessResponse}}) response
        message

        @param success_response: A SuccessResponse from consumer.complete()
        @type success_response: C{L{openid.consumer.consumer.SuccessResponse}}

        @param signed_only: Whether to process only data that was
            signed in the id_res message from the server.
        @type signed_only: bool

        @rtype: TeamsResponse
        @returns: A Launchpad teams response containing the data
            that was supplied with the C{id_res} response.
        """

        self = cls()
        if signed_only:
            args = success_response.getSignedNS(self.ns_uri)
        else:
            args = success_response.message.getArgs(self.ns_uri)

        if "is_member" in args:
            is_member_str = args["is_member"]
            self.is_member = is_member_str.split(",")

        return self

    fromSuccessResponse = classmethod(fromSuccessResponse)

    def getExtensionArgs(self):
        """Get the fields to put in the Launchpad teams namespace
        when adding them to an id_res message.

        @see: openid.extension
        """

        ns_args = {"is_member": ",".join(self.is_member)}
        return ns_args
