from webargs.flaskparser import FlaskParser


class UAContractsValidationError(Exception):
    def __init__(self, request, response):
        self.request = request
        self.response = response


class Parser(FlaskParser):
    def handle_error(self, error, req, *args, **kwargs):
        raise UAContractsValidationError(request=req, response=error)


parser = Parser()
use_kwargs = parser.use_kwargs
