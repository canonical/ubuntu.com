from webargs.flaskparser import FlaskParser


class UAContractsValidationError(Exception):
    pass


class Parser(FlaskParser):
    def handle_error(self, error, req, *args, **kwargs):
        raise UAContractsValidationError(error.messages)


parser = Parser()
use_kwargs = parser.use_kwargs
