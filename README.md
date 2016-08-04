www.ubuntu.com codebase
===

This is the codebase and content for [www.ubuntu.com](http://www.ubuntu.com), a simple databaseless informational website project based on [Django](https://www.djangoproject.com/).

Bugs and issues
---

Found a bug or have an idea for a new feature? Feel free to [create a new issue](https://github.com/ubuntudesign/www.ubuntu.com/issues/new), or suggest a fix by [creating a pull request](https://help.github.com/articles/creating-a-pull-request/).

Local development
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

