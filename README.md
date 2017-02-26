www.ubuntu.com codebase
===

[![Build Status](https://travis-ci.org/ubuntudesign/www.ubuntu.com.svg?branch=master)](https://travis-ci.org/ubuntudesign/www.ubuntu.com)

This is the codebase and content for [www.ubuntu.com](https://www.ubuntu.com), a simple databaseless informational website project based on [Django](https://www.djangoproject.com/).

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

Requirements
----

* **Docker** - you will need to download, install and run docker
* **npm**
  * Install the node.js package manager, npm, this might be easier with the node version manager,  [nvm]](https://github.com/creationix/nvm/blob/master/README.markdown). On a Mac with homebrew, try `brew install nvm` and follow the instructions, then `nvm install --lts` to install the long term supported version of node
  * Rebuild the sass with `docker-compose run sass`
  * Restart the server `make stop run`

Notes
----

If you get an ubuntu-vanilla-theme error on first startup, go into your /node_modules/ubuntu-vanilla-theme directory and run:

``` npm install --save-dev gulp-sass@2 ```

then

``` docker-compose run sass ```

and even possibly

``` make stop run ```

License
---

The content of this project is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International license](https://creativecommons.org/licenses/by-sa/4.0/), and the underlying code used to format and display that content is licensed under the [LGPLv3](http://opensource.org/licenses/lgpl-3.0.html) by [Canonical Ltd](http://www.canonical.com/).


With ♥ from Canonical
