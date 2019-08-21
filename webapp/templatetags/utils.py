# -*- coding: utf-8 -*-
from django import template
import datetime
import calendar


register = template.Library()


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
