SHELL := /bin/bash # Use bash syntax

define HELP_TEXT
Canonical.com website project
===

Usage:

> make setup    # Install dependencies
> make develop  # Auto-compile sass files and run the dev server

endef

# Variables
##

ENVPATH=${VIRTUAL_ENV}
VEX=vex --path ${ENVPATH}
ifeq ($(ENVPATH),)
	ENVPATH=env
endif

##
# Print help text
##
help:
	$(info ${HELP_TEXT})

##
# Start the development server
##
develop: sass-watch dev-server

##
# Prepare the project
##
setup: install-dependencies update-env

##
# Run server
##
dev-server:
	${VEX} ./manage.py runserver_plus 0.0.0.0:8000

##
# Run SASS watcher
##
sass-watch:
	sass --debug-info --watch static/css/styles.scss &
	sass --debug-info --watch static/css/core-print.scss &

##
# Build SASS
##
sass-build:
	sass --style compressed --update static/css/styles.scss
	sass --style compressed --update static/css/core-print.scss

##
# Get virtualenv ready
##
update-env:
	${MAKE} create-env

	${VEX} ${MAKE} install-requirements

##
# Make virtualenv directory if it doesn't exist and we're not in an env
##
create-env:
	if [ ! -d ${ENVPATH} ]; then virtualenv ${ENVPATH}; fi

##
# Install pip requirements
# Only if inside a virtualenv
##
install-requirements:
	if [ "${VIRTUAL_ENV}" ]; then pip install -r requirements/dev.txt; fi

##
# Install required system dependencies
##
install-dependencies:
	if [ $$(command -v apt-get) ]; then ${MAKE} apt-dependencies; fi
	if [ $$(command -v brew) ]; then ${MAKE} brew-dependencies; fi

	if [ ! $$(command -v virtualenv) ]; then sudo pip install virtualenv; fi
	if [ ! $$(command -v vex) ]; then sudo pip install vex; fi

## Install dependencies with apt
apt-dependencies:
	if [ ! $$(command -v pip) ]; then sudo apt-get install python-pip; fi
	if [ ! $$(command -v sass) ]; then sudo apt-get install ruby-sass; fi

## Install dependencies with brew
brew-dependencies:
	if [ ! $$(command -v pip) ]; then sudo easy_install pip; fi
	if [ ! $$(command -v sass) ]; then sudo gem install sass; fi

update-templates:
	rm -rf templates
	rm -rf static
	bzr branch lp:ubuntu-website-content templates
	rm -rf templates/.bzr*

	mv templates/static .

	# Remove references to scss module
	find templates -type f -name '*.html' | xargs sed -i '/^ *[{][%] load scss [%][}] *$$/d'
	find templates -type f -name '*.html' | xargs sed -i 's/[{][%]\s*scss\s\+["]\([^"]\+\).scss["]\s*[%][}]/\1.css/g'
	find static/css -type f -name '*.scss' | xargs sed -i 's/[%][%]/%/g'

	# Rewrite old "ubuntu"-prefixed template includes
	#perl -pi -e 's/\{\{ STATIC_URL \}\}u\//{{ STATIC_URL }}/g' `find .`
	#perl -pi -e 's/\{\% (extends|include|with) "ubuntu\//{% $$1 "/g' `find .`

	find templates -type f -name '*.html' | xargs sed -i 's/[{][{] *STATIC_URL *[}][}]u[/]/{{ STATIC_URL }}/g'
	find templates -type f -name '*.html' | xargs sed -i 's/[{][%] *\(extends\|include\|with\) \+["]ubuntu[/]/{% \1 "/g'

	find static/css -type f -name '*.scss' | xargs sed -i 's/[@]import ["]css[/]/@import "static\/css\//g'

update-templates-local:
	rm -rf templates
	rm -rf static
	#bzr branch lp:ubuntu-website-content templates
	bzr pull --directory ../ubuntu-website-content 
	cp -rf ../ubuntu-website-content templates
	rm -rf templates/.bzr*

	mv templates/static .

	# Remove references to scss module
	find templates -type f -name '*.html' | xargs sed -i '/^ *[{][%] load scss [%][}] *$$/d'
	find templates -type f -name '*.html' | xargs sed -i 's/[{][%]\s*scss\s\+["]\([^"]\+\).scss["]\s*[%][}]/\1.css/g'
	find static/css -type f -name '*.scss' | xargs sed -i 's/[%][%]/%/g'

	# Rewrite old "ubuntu"-prefixed template includes
	#perl -pi -e 's/\{\{ STATIC_URL \}\}u\//{{ STATIC_URL }}/g' `find .`
	#perl -pi -e 's/\{\% (extends|include|with) "ubuntu\//{% $$1 "/g' `find .`

	find templates -type f -name '*.html' | xargs sed -i 's/[{][{] *STATIC_URL *[}][}]u[/]/{{ STATIC_URL }}/g'
	find templates -type f -name '*.html' | xargs sed -i 's/[{][%] *\(extends\|include\|with\) \+["]ubuntu[/]/{% \1 "/g'

	find static/css -type f -name '*.scss' | xargs sed -i 's/[@]import ["]css[/]/@import "static\/css\//g'

# The below targets
# are just there to allow you to type "make it so"
# as a replacement for "make" or "make develop"
# - Thanks to https://directory.canonical.com/list/ircnick/deadlight/

it:
	# Nothing

so: develop