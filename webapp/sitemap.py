import sys
import os
import xml.etree.ElementTree as ET

ET.register_namespace('xhtml', "http://www.w3.org/1999/xhtml")
ET.register_namespace('', "http://www.sitemaps.org/schemas/sitemap/0.9")


def indent(elem, level=0):
    i = "\n" + level * "  "
    if len(elem):
        if not elem.text or not elem.text.strip():
            elem.text = i + "  "
        if not elem.tail or not elem.tail.strip():
            elem.tail = i
        for elem in elem:
            indent(elem, level + 1)
        if not elem.tail or not elem.tail.strip():
            elem.tail = i
    else:
        if level and (not elem.tail or not elem.tail.strip()):
            elem.tail = i


def update_sitemap(action, files, last_mod):
    # Use GH actions to update the lastmod dates of sitemaps
    print("Files:", files)
    print("Action:", action)

    sitemap_path = os.getcwd() + "/static/files/sitemap_tree.xml"
    base_url = "https://ubuntu.com"

    tree = ET.parse(sitemap_path)
    root = tree.getroot()

    # Extract url path from files
    files = eval(files)
    for file in files:
        path = file.split("templates/")[-1].split(".html")[0]
        url_path = base_url + "/" + path

        if action == "ADD":
            url_elem = ET.Element("url")
            loc_elem = ET.SubElement(url_elem, "loc")
            loc_elem.text = url_path
            last_mod_elem = ET.SubElement(url_elem, "lastmod")
            last_mod_elem.text = last_mod
            indent(url_elem, 1)
            root.append(url_elem)
        elif action == "DELETE":
            print(root[100][0].text, url_path)
            for child in root:
                if child[0].text == url_path:
                    root.remove(child)

    tree.write(sitemap_path, encoding="utf-8", xml_declaration=True)
    return


if __name__ == "__main__":
    action = sys.argv[1]
    files = sys.argv[2]
    last_mod = sys.argv[3] if len(sys.argv) > 3 else None
    update_sitemap(action, files, last_mod)
