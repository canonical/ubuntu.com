Ubuntu.com website project
===

This is a simple databaseless informational website project, based on
[static-django-bootstrap](https://github.com/ubuntudesign/static-django-bootstrap).

Basic usage
---

To run the site locally:

``` bash
make setup    # Install dependencies - only needed the first time
npm install   # Install all node dependencies and vanilla theme
make develop  # Auto-compile sass files and run the dev server
```

Now visit <http://127.0.0.1:8001>

To see what other `make` commands are available, run `make help`.
