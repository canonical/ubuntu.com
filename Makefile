SHELL := /bin/bash # Use bash syntax

define HELP_TEXT
Ubuntu.com website project
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
develop: watch-sass dev-server

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
watch-sass:
	sass --debug-info --watch static/css/ &

##
# Build SASS
##
sass:
	sass --style compressed --update static/css/

##
# Get virtualenv ready
##
update-env:
	${MAKE} create-env

	${VEX} ${MAKE} install-requirements

	# Get download mirrors file
	wget --output-document=/tmp/mirrors.rss https://launchpad.net/ubuntu/+cdmirrors-rss

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

##
# Create the SSH tunnel to the GSA server to test search
##
search-setup-local:
	ssh -f 10.55.60.86 -L 2000:tupilaq.internal:80 -N

##
# Delete any generated files
##
clean:
	rm -rf env .sass-cache
	find static/css -name '*.css*' -exec rm {} +  # Remove any .css files - should only be .sass files

##
# Rebuild the pip requirements cache, for non-internet-visible builds
##
rebuild-dependencies-cache:
	rm -rf pip-cache
	bzr branch lp:~webteam-backend/ubuntu-website/dependencies pip-cache
	pip install --exists-action=w --download pip-cache/ -r requirements/standard.txt
	bzr add .
	bzr commit pip-cache/ -m 'automatically updated ubuntu website requirements'
	bzr push --directory pip-cache lp:~webteam-backend/ubuntu-website/dependencies
	rm -rf pip-cache src

update-templates:
	rm -rf templates
	rm -rf static
	bzr branch lp:ubuntu-website-content templates
	rm -rf templates/.bzr*

	mv templates/static .

	# Template replacements
	# ==
	find templates -type f -name '*.html' | xargs sed -i '/^ *[{][%] load scss [%][}] *$$/d'  # Remove references to scss module
	find templates -type f -name '*.html' | xargs sed -i 's/[{][%]\s*scss\s\+["]\([^"]\+\).scss["]\s*[%][}]/\1.css/g'  # Point to CSS instead of SCSS
	find templates -type f -name '*.html' | xargs sed -i 's/[{][{] *STATIC_URL *[}][}]u[/]/{{ STATIC_URL }}/g'  # Fix static file locations
	find templates -type f -name '*.html' | xargs sed -i 's/[{][%] *\(extends\|include\|with\) \+["]\(..[/]sites[/]\)\?ubuntu[/]/{% \1 "/g'  # Remove "ubuntu" from include paths

	# Stylesheet replacements
	# ==
	find static/css -name '*.css*' -exec rm {} +  # Remove any .css files - should only be .sass files
	find static/css -name '*.scss' -not -regex '.*/\(styles.scss\|core-print.scss\|global-responsive.scss\|ie/.*\)' | rename 's/(.*\/)?([^\/]*)/$$1_$$2/'  # Rename .scss include files to have underscores
	find static/css -type f -name '*.scss' | xargs sed -i 's/[%][%]/%/g'  # Remove erroneous double-percent
	find static/css -type f -name '*.scss' | xargs sed -i 's/[@]import ["]css[/]/@import "/g'  # Fix include paths for sass
	find static/css -type f -name '*.scss' | xargs sed -i 's/(\([^)]\)em/(\1)+em/g'  # Fix include paths for sass

	$(MAKE) sass  # Update local CSS files

update-templates-local:
	rm -rf templates
	rm -rf static
	#bzr branch lp:ubuntu-website-content templates
	bzr pull --directory ../ubuntu-website-content 
	cp -rf ../ubuntu-website-content templates
	rm -rf templates/.bzr*

	mv templates/static .

	# Template replacements
	# ==
	find templates -type f -name '*.html' | xargs sed -i '/^ *[{][%] load scss [%][}] *$$/d'  # Remove references to scss module
	find templates -type f -name '*.html' | xargs sed -i 's/[{][%]\s*scss\s\+["]\([^"]\+\).scss["]\s*[%][}]/\1.css/g'  # Point to CSS instead of SCSS
	find templates -type f -name '*.html' | xargs sed -i 's/[{][{] *STATIC_URL *[}][}]u[/]/{{ STATIC_URL }}/g'  # Fix static file locations
	find templates -type f -name '*.html' | xargs sed -i 's/[{][%] *\(extends\|include\|with\) \+["]\(..[/]sites[/]\)\?ubuntu[/]/{% \1 "/g'  # Remove "ubuntu" from include paths

	# Stylesheet replacements
	# ==
	find static/css -name '*.css*' -exec rm {} +  # Remove any .css files - should only be .sass files
	find static/css -name '*.scss' -not -regex '.*/\(styles.scss\|core-print.scss\|global-responsive.scss\|ie/.*\)' | rename 's/(.*\/)?([^\/]*)/$$1_$$2/'  # Rename .scss include files to have underscores
	find static/css -type f -name '*.scss' | xargs sed -i 's/[%][%]/%/g'  # Remove erroneous double-percent
	find static/css -type f -name '*.scss' | xargs sed -i 's/[@]import ["]css[/]/@import "/g'  # Fix include paths for sass
	find static/css -type f -name '*.scss' | xargs sed -i 's/(\([^)]\)em/(\1)+em/g'  # Fix include paths for sass

	$(MAKE) sass  # Update local CSS files

# The below targets
# are just there to allow you to type "make it so"
# as a replacement for "make" or "make develop"
# - Thanks to https://directory.canonical.com/list/ircnick/deadlight/

it:
	# Nothing

so: develop