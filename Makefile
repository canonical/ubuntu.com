SHELL := /bin/bash

# Run the sass compiler, for CSS, and the development server
develop:
	$(MAKE) sass-watch
	./manage.py runserver_plus 0.0.0.0:8000

sass-watch:
	bundle exec sass --watch static/css/styles.scss:static/css/styles.css &

sass:
	sass --update --force --style compressed static/css/styles.scss:static/css/styles.css
	sass --update --force --style compressed static/css/core-print.scss:static/css/core-print.css

# Install dependencies etc
setup: setup-ruby setup-venv

setup-ruby:
	##
	# Install dependencies
	##
	if [ ! $$(command -v bundle) ]; then sudo apt-get install bundler; fi

	##
	# Install gem dependencies
	##
	bundle update

setup-venv:
	##
	# Install virtualenv dependencies
	##
	if [ ! $$(command -v pip) ]; then sudo apt-get install python-pip; fi
	if [ ! $$(command -v virtualenv) ]; then sudo apt-get install python-virtualenv; fi

	##
	# Make virtualenv directory if it doesn't exist
	##
	if [ ! -d "env" ]; then virtualenv env; fi

	##
	# Install python dependencies
	##
	env/bin/pip install -r requirements/standard.txt

	##
	#
	# Now run:
	#
	# > source env/bin/activate
	#
	# And when you're done:
	#
	# > deactivate
	#
	##

# Alises

it:

so: develop
