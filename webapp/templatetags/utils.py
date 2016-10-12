# -*- coding: utf-8 -*-
from django import template

register = template.Library()


@register.filter
def truncate_chars(value, max_length):
    length = len(value)
    if length > max_length:
        truncated = value[:max_length]
        if not length == (max_length + 1) and value[max_length + 1] != " ":
            truncated = truncated[:truncated.rfind(" ")]
        return truncated + "&hellip;"
    return value
