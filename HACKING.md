# Working on the ubuntu.com project

The ubuntu.com codebase is a [Flask](https://flask.palletsprojects.com/en/1.1.x/) app, which also includes some [Yarn](https://yarnpkg.com/lang/en/)-based tools and tasks for building static files like CSS.

## Running the site

### With Docker

The recommended way to run the site is with the existing `./run` script, which uses Docker behind the scenes.

First [install Docker](https://docs.docker.com/engine/installation/) (on Linux you may need to and [add your user to the `docker` group](https://docs.docker.com/engine/installation/linux/linux-postinstall/)).

Then to learn about this script's options, type:

``` bash
./run --help
```

The basic options are:

``` bash
./run serve  # Start the Django server, optionally watching for changes
./run build  # Build the CSS
./run watch  # Watch and build the CSS whenever Sass changes
./run clean  # Remove created files and docker containers
./run stop   # Stop any running containers

```

#### Watching in the background

The `start` function optionally takes a `--watch` argument:

``` bash
./run serve --watch
```

This will effectively run the `./run watch` command in the background while also running the server.

**NB:** You won't see the output from the watcher by default. This makes it difficult to know if it's working properly.

To check if the watcher daemon is running, use `docker ps`. Then you can use `docker attach` to follow the output from the background watcher.

### Running the site with native python

Since the site is basically a Flask app, you can also run the site in the traditional way using [python 3](https://docs.python.org/3/) and [venv](https://docs.python.org/3/library/venv.html?highlight=venv#module-venv):

``` bash
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
./entrypoint 0.0.0.0:8001
```

Now browse to the site at <http://127.0.0.1:8001>. If it looks a bit odd, it's probably because you haven't built sass - see below.

You can run `deactivate` to shutdown the virtual environment when you are done.

### Building Sass

The CSS needs to be built from the `static/css/styles.scss` file. This in turn requires [vanilla-framework](https://github.com/canonical-web-and-design/vanilla-framework).

If you can't build using the `./run build` command, you can pull down dependencies this using `yarn`:

``` bash
yarn install
```

Then you can use the built in scripts to build or watch the Sass:

``` bash
yarn run build  # Build the Sass to CSS then exit
yarn run watch  # Dynamically watch for Sass changes and build CSS
```

### Overriding Yarn modules

You can use the `./run` script to use Yarn NPM modules from a local folder on a one-time basis, instead of the modules declared in `package.json`, as follows:

``` bash
./run [-r|--root] [-p|--expose-port PORT] <script-name>
```

## Making changes to the site

Guides for making changes to the ubuntu.com codebase.

### Navigation

The basic navigation structure of the site is listed in `navigation.yaml`. This file lists all the top-level section pages and their children and grandchildren. The top menu, footer menu and breadcrumb navigation are all built from this list.

The file should be of the following format:

``` yaml
{section-identifier}:
  title: {Section title}
  url_path: /{section-url}

  children:
    - title: {Child title}
      url_path: /{child-url}

      children:
        - title: {Grandchild}
          url_path: /{grandchild-url}

    - title: {Hidden child}
      url_path: {child-url}
      hidden: True
```

If a child is "hidden", then it won't be displayed in the navigation menus, either in the top nav, the footer nav, or in the breadcrumb nav on other pages.

#### How it works

The `navigation.yaml` file is read in `webapp/settings.py` to create a Flask settings objects `django.conf.settings.NAV_SECTIONS`.

This is then used in `webapp.context_processors.navigation` in `webapp/context_processors.py` to add two items to the template context:

- `breadcrumbs`: Information about the current page, its siblings and its parents
- `nav_sections`: A direct representation of the `NAV_SECTIONS` setting

These are then used in the `templates/templates/base.html` and `templates/templates/footer.html` templates to build the markup for the top navigation, the breadcrumb navigation and the footer navigation.
