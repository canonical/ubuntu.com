SHELL := /bin/bash  # Use bash syntax

# Settings
# ===

# Default port for the dev server - can be overridden e.g.: "PORT=1234 make run"
ifeq ($(PORT),)
	PORT=8081
endif

# Settings
# ===
PROJECT_NAME=ubuntuwebsite
APP_IMAGE=${PROJECT_NAME}_web
DB_CONTAINER=${PROJECT_NAME}_db_1
SASS_CONTAINER=${PROJECT_NAME}_sass_1

# Help text
# ===

define HELP_TEXT

${PROJECT_NAME} - A Django website by the Canonical web team
===

Basic usage
---

> make run         # Prepare Docker images and run the Django site

Now browse to http://127.0.0.1:${PORT} to run the site

All commands
---

> make help               # This message
> make run                # build, watch-sass and run-site
> make it so              # a fun alias for "make run"
> make build-app-image    # Build the docker image
> make run-site           # Use Docker to run the website
> make watch-sass         # Setup the sass watcher, to compile CSS
> make compile-sass       # Setup the sass watcher, to compile CSS
> make stop-sass-watcher  # If the watcher is running in the background, stop it
> make clean              # Delete all created images and containers

(To understand commands in more details, simply read the Makefile)

endef

##
# Print help text
##
help:
	$(info ${HELP_TEXT})

##
# Build the docker image
##
build-app-image:
	docker-compose build

##
# Run the Django site using the docker image
##
run:
	# Make sure IP is correct for mac etc.
	$(eval docker_ip := `hash boot2docker 2> /dev/null && echo "\`boot2docker ip\`" || echo "127.0.0.1"`)
	docker pull ubuntudesign/python-auth
	@cat docker-compose.yml | sed 's/8001/${PORT}/g' | docker-compose --file=- up -d web # Run Django
	@echo ""
	@echo "== Running server on http://${docker_ip}:${PORT} =="
	@echo ""
	@echo "== Building SCSS =="
	@echo ""

	@docker-compose up npm            # Build `node_modules`
	@docker-compose up sass           # Build CSS into `static/css`
	@echo ""
	@echo "== Built SCSS =="
	@echo ""

	@docker-compose up -d sass-watch  # Watch SCSS files for changes

	@echo ""
	@echo "======================================="
	@echo "Running server on http://${docker_ip}:${PORT}"
	@echo "To stop the server, run 'make stop'"
	@echo "To get server logs, run 'make logs'"
	@echo "======================================="
	@echo ""

stop:
	@docker-compose stop -t 1

logs:
	@docker-compose logs

##
# Create or start the sass container, to rebuild sass files when there are changes
##
watch-sass:
	$(eval is_running := `docker inspect --format="{{ .State.Running }}" ${SASS_CONTAINER} 2>/dev/null || echo "missing"`)
	@if [[ "${is_running}" == "true" ]]; then docker attach ${SASS_CONTAINER}; fi
	@if [[ "${is_running}" == "false" ]]; then docker start -a ${SASS_CONTAINER}; fi
	@if [[ "${is_running}" == "missing" ]]; then docker run --name ${SASS_CONTAINER} -v `pwd`:/app ubuntudesign/sass sass --debug-info --watch /app/static/css; fi

##
# Force a rebuild of the sass files
##
compile-sass:
	docker run -v `pwd -P`:/app ubuntudesign/sass sass --debug-info --update /app/static/css --force -E "UTF-8"

##
# Re-create the app image (e.g. to update dependencies)
##
rebuild-app-image:
	docker-compose stop -t 2
	docker-compose kill
	docker-compose build web

##
# Delete created images and containers
##
clean:
	$(eval destroy_images := $(shell bash -c 'read -p "Destroy images? (y/n): " yn; echo $$yn'))
	$(eval delete_css := $(shell bash -c 'read -p "Delete compiled CSS? (y/n): " yn; echo $$yn'))
	$(eval delete_node_modules := $(shell bash -c 'read -p "Delete node_modules? (y/n): " yn; echo $$yn'))

	@if [[ "${delete_css}" == "y" ]]; then \
	  find static/css -name '*.css' | xargs rm -fv ;\
	  rm -rfv .sass-cache ;\
	  echo "Compiled CSS removed" ;\
	fi

	@if [[ "${delete_node_modules}" == "y" ]]; then \
	  rm -rfv node_modules ;\
	fi

	@if [[ "${destroy_images}" == "y" ]]; then \
	  docker-compose rm -f ;\
	  echo "Images and containers removed" ;\
	  docker-compose kill ;\
	fi


bleeding-edge-sass:
	rm -rf node_modules
	git clone git@github.com:ubuntudesign/ubuntu-vanilla-theme.git node_modules/ubuntu-vanilla-theme
	git clone git@github.com:ubuntudesign/vanilla-framework.git node_modules/ubuntu-vanilla-theme/node_modules/vanilla-framework

build:
	docker pull ubuntudesign/python-auth
	docker-compose build

##
# "make it so" alias for "make run" (thanks @karlwilliams)
##
it:
so: run

# Phone targets (don't correspond to files or directories)
.PHONY: help build stop logsrun run-site watch-sass compile-sass stop-sass-watcher rebuild-app-image it so
