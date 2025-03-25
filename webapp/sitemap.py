import sys
import os
from canonicalwebteam.directory_parser import update_sitemap

if __name__ == "__main__":
    action = sys.argv[1]
    files = sys.argv[2]
    last_mod = sys.argv[3] if len(sys.argv) > 3 else None
    base_url = "https://www.ubuntu.com"
    sitemap_path = os.getcwd() + "/static/files/sitemap_tree.xml"

    update_sitemap(base_url, sitemap_path, action, files, last_mod)
