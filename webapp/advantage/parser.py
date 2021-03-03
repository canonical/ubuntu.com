from webargs.flaskparser import FlaskParser


class AdvantageValidationError(Exception):
    pass


class Parser(FlaskParser):
    def handle_error(self, error, req, *args, **kwargs):
        raise AdvantageValidationError(error.messages)


parser = Parser()
use_kwargs = parser.use_kwargs
