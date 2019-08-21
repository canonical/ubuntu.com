# -*- coding: utf-8 -*-
from django import template
from django.template.loader_tags import do_extends
import datetime
import calendar


register = template.Library()


@register.filter
def truncate_chars(value, max_length):
    length = len(value)
    if length > max_length:
        truncated = value[:max_length]
        if not length == (max_length + 1) and value[max_length + 1] != " ":
            truncated = truncated[: truncated.rfind(" ")]
        return truncated + "&hellip;"
    return value


@register.filter
def replace(value, args):
    params = args.split(",")
    return value.replace(params[0], params[1])


@register.filter
def descending_years(end_year):
    now = datetime.datetime.now()
    return range(now.year, end_year, -1)


@register.filter
def month_name(string):
    month = int(string)
    return calendar.month_name[month]


@register.filter
def months_list(year):
    months = []
    now = datetime.datetime.now()
    for i in range(1, 13):
        date = datetime.date(year, i, 1)
        if date < now.date():
            months.append({"name": date.strftime("%b"), "number": i})
    return months


@register.filter
def keyvalue(dictionary, key_name):
    """
    A template filter to get a dictionary key using a variable.
    E.g.:

    {{ dictionary | keyvalue:variable }}

    (From https://stackoverflow.com/a/10700142/613540)
    """

    return dictionary.get(key_name)


@register.filter
def build_path_with_params(request):
    query_params = request.GET.copy()
    query_string = "?"

    if "page" in query_params:
        query_params.pop("page")

    if len(query_params) > 0:
        query_string += query_params.urlencode()

    return request.path + query_string


class ExtendsWithArgsNode(template.Node):
    def __init__(self, node, arguments):
        self.node = node
        self.arguments = arguments

    def render(self, context):
        extra_context = {}

        for item in self.arguments:
            if "=" not in item:
                continue

            key, value = item.split("=")

            if value == "":
                extra_context[key] = value
            elif value[0] in ('"', "'") and value[-1] in ('"', "'"):
                # It's a string
                extra_context[key] = value[1:-1]
            else:
                # It's a variable
                try:
                    variable = template.Variable(value)
                    extra_context[key] = variable.resolve(context)
                except template.VariableDoesNotExist:
                    extra_context[key] = ""

        context.update(extra_context)
        self.node.origin = self.origin
        return self.node.render(context)


@register.tag
def extends_with_args(parser, token):
    """
    Parse extends_with_args extension declarations.
    Arguments are made available in context to the extended template
    and its includes.
    E.g.:

    {% extends_with_args "base.html" foo="bar" baz="toto" %}
    """

    all_arguments = token.split_contents()
    token.contents = " ".join(all_arguments[:2])

    # Use do_extends to parse the tag
    return ExtendsWithArgsNode(do_extends(parser, token), all_arguments[2:])
