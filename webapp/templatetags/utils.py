# -*- coding: utf-8 -*-
from django import template
import dateutil.parser
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
def format_date(date):
    date_formatted = dateutil.parser.parse(date)
    return date_formatted.strftime("%-d %B %Y")


@register.filter
def replace_admin(url):
    return url.replace("admin.insights.ubuntu.com", "blog.ubuntu.com")


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
def build_path_with_params(request):
    query_params = request.GET.copy()
    query_string = "?"

    if "page" in query_params:
        query_params.pop("page")

    if len(query_params) > 0:
        query_string += query_params.urlencode()

    return request.path + query_string
