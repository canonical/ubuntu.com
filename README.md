Ubuntu.com website project
===

This is a simple databaseless informational website project, based on
[static-django-bootstrap](https://github.com/ubuntudesign/static-django-bootstrap).

Basic usage
---

To run the site locally:

``` bash
make run
```

Now visit <http://127.0.0.1:8001>

To see what other `make` commands are available, run `make help`.

Notes
----

If you get an ubuntu-vanilla-theme error on first startup, go into your /node_modules/ubuntu-vanilla-theme directory and run:

``` npm install --save-dev gulp-sass@2 ```

License
---

The content of this project is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International license](https://creativecommons.org/licenses/by-sa/4.0/), and the underlying code used to format and display that content is licensed under the [LGPLv3](http://opensource.org/licenses/lgpl-3.0.html) by [Canonical Ltd](http://www.canonical.com/).


With ♥ from Canonical
