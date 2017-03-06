# Running the www.ubuntu.com project

The www.ubuntu.com codebase is a [Django](https://www.djangoproject.com/) app, which also includes some [NPM](https://www.npmjs.com/)-based tools and tasks for building static files like CSS.

## Running the site with Docker

The recommended way to run the site is with the existing `./run` script, which uses Docker behind the scenes.

First [install Docker](https://docs.docker.com/engine/installation/) and add your user to the `docker` group.

Then to learn about this script's options, type:

``` bash
./run --help
```

The basic options are:

``` bash
./run start  # Start the Django server, optionally watching for changes
./run build  # Build the CSS
./run watch  # Watch and build the CSS whenever Sass changes
./run clean  # Remove created files and docker containers
```

### Watching in the background

The `start` function optionally takes a `--watch` argument:

``` bash
./run start --watch
```

This will effectively run the `./run watch` command in the background while also running the server.

**NB:** You won't see the output from the watcher by default. This makes it difficult to know if it's working properly.

To check if the watcher daemon is running, use `docker ps`. Then you can use `docker attach` to follow the output from the background watcher.

## Running the site with native python

Since the site is basically a Django app, you can also run the site in the traditional way using [python 2.7](https://www.python.org/download/releases/2.7/) and [virtualenv](http://docs.python-guide.org/en/latest/dev/virtualenvs/):

``` bash
virtualenv env
source env/bin/activate
pip install -r requirements.txt
./manage.py runserver 0.0.0.0:8001
```

Now browse to the site at <http://127.0.0.1:8001>. If it looks a bit odd, it's probably because you haven't built sass - see below.

## Building Sass

The CSS needs to be built from the `static/css/styles.scss` file. This in turn requires [ubuntu-vanilla-theme](https://github.com/ubuntudesign/ubuntu-vanilla-theme) and its dependency, [vanilla-framework](https://github.com/vanilla-framework/vanilla-framework).

If you can't build using the `./run build` command, you can pull down dependencies this using `npm` or `yarn`:

``` bash
npm install
# or
yarn install
```

Then you can use the built in scripts to build or watch the Sass:

``` bash
npm build  # Build the Sass to CSS then exit
npm run watch  # Dynamically watch for Sass changes and build CSS
# or
yarn run build  # Build the Sass to CSS then exit
yarn run watch  # Dynamically watch for Sass changes and build CSS
```

### Overriding NPM modules

You can use the `./run` script to use NPM modules from a local folder on a one-time basis, instead of the modules declared in `package.json`, as follows:

``` bash
./run --node-module $HOME/project/vanilla-framework watch  # Build CSS dynamically, using a local version of vanilla-framework
```
