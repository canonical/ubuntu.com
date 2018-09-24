#! /usr/bin/env python

import os
import urllib2
import string


script_dir = os.path.dirname(os.path.realpath(__file__))
project_dir = os.path.dirname(script_dir)
template_dir = os.path.join(project_dir, 'templates')


def clean_path(p):
    cleaned = p[1:-1].split(".html")[0].split("index")[0]
    return cleaned if cleaned[-1] == "/" else "%s/" % cleaned


def grab_ubuntu_page(path):
    full_path = 'https://www.ubuntu.com%s' % path
    try:
        return urllib2.urlopen(full_path).readlines(), path
    except urllib2.HTTPError:
        return (["<title> 404</title>"], path)


def get_title_from_html(list_of_html_strings):
    """
    Isolate the data from an HTML string.
    """
    title = ''
    for row in list_of_html_strings:
        if row.count("<title>") == 1:
            title = string.lstrip(row, " <title>")
            title = string.rstrip(title, "</title>;\r\n")
    return title


os.chdir(template_dir)
html_files = os.popen('find . -name "*.html"').readlines()
cleaned = map(clean_path, html_files)

for path in cleaned:
    if (path.find("/_") == -1) and \
            (path.find("/base_") == -1) and \
            (path.find("/templates") == -1) and \
            (path.find("/mu-b760b7ee-790eb464-8b1bbe62-de00513f") == -1) and \
            (path.find("patterns-assets") == -1):
        full_path = 'https://www.ubuntu.com%s' % path
        page, path = grab_ubuntu_page(path)
        print("%s\t%s" % (get_title_from_html(page), full_path))
