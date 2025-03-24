import sys
import os
import xml.etree.ElementTree as ET


def update_sitemap(files, action):
    # Use GH actions to update the lastmod dates of sitemaps
    # print("Sitemap already exists, update here")
    sitemap_path = os.getcwd() + "/static/files/sitemap_tree.xml"
    base_url = "https://ubuntu.com"
    to_match = base_url + "/openstack/pricing-calculator"

    # modified_files = {
    #     {"url": "https://ubuntu.com/openstack/pricing-calculator",
    #      "action": "update",
    #      "lastmod": "2021-09-01T00:00:00Z"},
    # }

    tree = ET.parse(sitemap_path)
    root = tree.getroot()

    for child in root:
        if child[0].text == to_match:
            print("URL:", child[0].text)
            child[1].text = "New lastmod"
            break

    tree.write(sitemap_path)
    return


if __name__ == "__main__":
    files = sys.argv[1]
    action = sys.argv[2]
    update_sitemap(files, action)
