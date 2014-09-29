Ubuntu.com website project
===

To run the site locally:

``` bash
make setup    # Install dependencies - only needed the first time
make develop  # Auto-compile sass files and run the dev server
```

Now visit <http://127.0.0.1:8001>

Fenchurch
---

This site depends on [Fenchurch 3](https://launchpad.net/fenchurch/3.0.0) - which is currently a private repository. Make sure you have SSH access to the above repository before attempting to install dependencies.

Updating templates from [ubuntu-website-content](https://launchpad.net/ubuntu-website-content)
---

Until this project is released, new template work will be being added to the [ubuntu-website-content](https://launchpad.net/ubuntu-website-content) project.

To update the templates directory with the template changes from this repository:

``` bash
make update-templates
```
