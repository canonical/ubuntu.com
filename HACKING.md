# Working on the ubuntu.com project

The ubuntu.com codebase is a [Flask](https://flask.palletsprojects.com/) app, which builds on our own [flask-base](https://pypi.org/project/canonicalwebteam.flask-base/), [templatefinder](https://pypi.org/project/canonicalwebteam.templatefinder/), [blog](https://pypi.org/project/canonicalwebteam.blog/) and [search](https://pypi.org/project/canonicalwebteam.search/) packages.

We use [Yarn](https://yarnpkg.com/lang/en/) for building static files like CSS through [`package.json` scripts](https://yarnpkg.com/lang/en/docs/package-json/#toc-scripts).

## Running the site

### With dotrun

The recommended way to run the site is with [the `dotrun` snap](https://github.com/canonical-web-and-design/dotrun/):

```bash
sudo snap install dotrun
dotrun  # Build dependencies and run the server
```

Then to learn about `dotrun`'s options, type:

```bash
dotrun --help
```

### Running the site with native python

Since the site is basically a Flask app, you can also run the site in the traditional way using [python 3](https://docs.python.org/3/) and [venv](https://docs.python.org/3/library/venv.html?highlight=venv#module-venv):

```bash
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
./entrypoint 127.0.0.0:8001
```

Now browse to the site at <http://127.0.0.1:8001>. If it looks a bit odd, it's probably because you haven't built sass - see below.

You can run `deactivate` to shutdown the virtual environment when you are done.

### Building Sass

The CSS needs to be built from the `static/css/styles.scss` file. This in turn requires [vanilla-framework](https://github.com/canonical-web-and-design/vanilla-framework).

If you can't build using the `./run build` command, you can pull down dependencies this using `yarn`:

```bash
yarn install
```

Then you can use the built in scripts to build or watch the Sass:

```bash
yarn run build  # Build the Sass to CSS then exit
yarn run watch  # Dynamically watch for Sass changes and build CSS
```

### Overriding Yarn modules

You can use the `./run` script to use Node modules from a local folder on a one-time basis, instead of the modules declared in `package.json`, as follows:

```bash
./run --node-module $HOME/projects/vanilla-framework watch  # Build CSS dynamically, using a local version of vanilla-framework
```

## Making changes to the site

Guides for making changes to the ubuntu.com codebase.

### Navigation

The basic navigation structure of the site is listed in `navigation.yaml`. This file lists all the top-level section pages and their children and grandchildren. The top menu, footer menu and breadcrumb navigation are all built from this list.

The file should be of the following format:

```yaml
{ section-identifier }:
  title: { Section title }
  url_path: /{section-url}

  children:
    - title: { Child title }
      url_path: /{child-url}

      children:
        - title: { Grandchild }
          url_path: /{grandchild-url}

    - title: { Hidden child }
      url_path: { child-url }
      hidden: True
```

If a child is "hidden", then it won't be displayed in the navigation menus, either in the top nav, the footer nav, or in the breadcrumb nav on other pages.

#### How it works

The `navigation.yaml` file is read [in `webapp/context.py`](https://github.com/canonical-web-and-design/ubuntu.com/blob/b0b1f1e8fe896166ee0a0a7a2328d1e85f22f84c/webapp/context.py#L53). A `navigation` object will be passed through to all templates.

This is then used in `webapp.context_processors.navigation` in `webapp/context_processors.py` to add two items to the template context:

- `breadcrumbs`: Information about the current page, its siblings and its parents
- `nav_sections`: A direct representation of the `NAV_SECTIONS` setting

These are then used in the `templates/templates/base.html` and `templates/templates/footer.html` templates to build the markup for the top navigation, the breadcrumb navigation and the footer navigation.

### Mobile nav header

On mobile we have a pattern of showing the section title next to the logo, e.g.

![Section title example](https://assets.ubuntu.com/v1/bb50217a-Screenshot+from+2020-02-04+15-29-36.png)

For the most part this will happen automatically as long as the subpages (https://canonical.com/mlops) are in `navigtation.yml` as children. In some cases this isn't possible due to dynamically created content such as tutorials. In this case you can set the `section_title` and `section_path` variables in the template e.g.

```
{% set section_title="Tutorials" %}
{% set section_path="/tutorials" %}

{% block content %}
{% endblock %}
```

### Working on Credentials

If you want to work on [Credentials](https://ubuntu.com/credentials) you need to add some environment vars into your `.env.local`.
If you have a TrueAbility account with API access enabled, you can find your API key in [Settings](https://app3.trueability.com/settings).


```
TRUEABILITY_URL="https://app3.trueability.com"
TRUEABILITY_API_KEY=<trueability_api_key>
BADGR_URL=https://api.test.badgr.com
BAGDR_USER=<badgr_user>
BADGR_PASSWORD=<badgr_password>
```

### JavaScript

Parts of this site use [React Query](https://react-query.tanstack.com/overview) to manage data from the API.

To enable the React Query devtools you need to add `NODE_ENV="development"` to your `.env.local` file or run: `dotrun -e NODE_ENV="development"`.

## Linting / formatting

When making changes to the codebase please make sure it's properly formatted and linted.
[Our standards](https://webteam.canonical.com/practices) suggest that our editors should be configured in the following ways:

- Python files should be formatted with `black` on save, and checked with `flake8`
- JS files should be formatted with `prettier` and checked with `eslint`
- CSS files should be formatted with `prettier` and checked with `stylelint`
- Jinja templates should be formatted and checked with `djLint`

These tools should take their configuration from files stored in our codebases, e.g. `.eslintrc.js`. Additionally, editor settings (indentation etc.) for particular types of files should be picked up from `.editorconfig` files if they exist in the codebase.

### Installing tools

First install the necessary tools globally:

``` bash
sudo apt update && sudo apt install python3-pip nodejs
# (for macOS hopefully these can be installed with brew instead?)
sudo pip3 install black flake8
sudo npm install -g prettier eslint stylelint
python -m pip install -U djlint
```

### Configuring editors

These are instructions for setting up various editors to use the above tools:

***VSCode***
Install the following extensions:
- [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python)
- [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [djLint](https://marketplace.visualstudio.com/items?itemName=monosans.djlint)

Then tweak some settings by opening your JSON settings (CTRL+Shift+P, type "Settings", click "Open settings (JSON)"), and adding the following rules:

``` json
{
    "python.linting.pylintEnabled": false,
    "python.linting.flake8Enabled": true,
    "python.linting.enabled": true,
    "python.formatting.provider": "black",
    "python.formatting.blackArgs": [
        "--line-length",
        "79"
    ],
    "editor.formatOnSave": true,
    "[html][jinja-html][jinja]": {
        "editor.formatOnSave": false,
        "editor.defaultFormatter": "monosans.djlint"
    },
    "html.format.wrapLineLength": 0,
    "html.format.wrapAttributes": "aligned-multiple",
    "html.format.indentHandlebars": true,
    "html.format.preserveNewLines": false,
}
```

***Atom***
Install the following plugins:
- [linter](https://atom.io/packages/linter) (needed for all linting)
- [linter-flake8](https://github.com/AtomLinter/linter-flake8)
- [linter-eslint](https://atom.io/packages/linter-eslint)
- [linter-sass-lint](https://atom.io/packages/linter-sass-lint)
- [linter-stylelint](https://atom.io/packages/linter-stylelint)
- [python-black](https://atom.io/packages/python-black)
- [prettier-atom](https://atom.io/packages/prettier-atom)

Configure the `python-black` plugin to add the `--line-length 79` option.

***Sublime***
Install the following plugins:
- [sublack](https://packagecontrol.io/packages/sublack)
- [Python Flake8 Lint](https://packagecontrol.io/packages/Python%20Flake8%20Lint)
- [ESLint](https://packagecontrol.io/packages/ESLint)
- [JsPrettier](https://packagecontrol.io/packages/JsPrettier)
- [djLint](https://packagecontrol.io/packages/SublimeLinter-contrib-djlint)

***PyCharm***
Make sure you have the [File Watcher](https://plugins.jetbrains.com/plugin/7177-file-watchers) plugin installed.
___

Configure **Black**

Go to  `Preferences or Settings -> Tools -> File Watchers`  and click  `+`  to add a new watcher:
* Name: **Black**
* File type: **Python**
* Scope: **Project Files**
* Program: run `which black` to find out
* Arguments:  ` --line-length 79 $FilePath$`
* Output paths to refresh:  `$FilePath$`
* Working directory:  `$ProjectFileDir$`

Source: https://black.readthedocs.io/en/stable/editor_integration.html
___
Configure **Flake8**

Go to  `Preferences or Settings -> Tools -> File Watchers`  and click  `+`  to add a new watcher:
* Name: **Flake8**
* File type: **Python**
* Scope: **Project Files**
* Program: run `which flake8` to find out
* Arguments:  `$FilePath$`
* Output paths to refresh:  `$FilePath$`
* Working directory:  `$ProjectFileDir$`