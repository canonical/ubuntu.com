SHELL := /bin/bash  # Use bash syntax

# Settings
# ===

# Default port for the dev server - can be overridden e.g.: "PORT=1234 make run"
ifeq ($(PORT),)
	PORT=8001
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
# Use docker to run the sass watcher and the website
##
run:
	#${MAKE} watch-sass &
	#trap "${MAKE} stop-db; exit" SIGINT; ${MAKE} run-site
	${MAKE} run-site

##
# Build the docker image
##
build-app-image:
	docker-compose build

##
# Run the Django site using the docker image
##
run-site:
	# Make sure IP is correct for mac etc.
	$(eval docker_ip := `hash boot2docker 2> /dev/null && echo "\`boot2docker ip\`" || echo "127.0.0.1"`)
	@docker-compose up -d

	@echo ""
	@echo "======================================="
	@echo "Running server on http://${docker_ip}:${PORT}"
	@echo "To stop the server, run 'make stop'"
	@echo "To get server logs, run 'make logs'"
	@echo "======================================="
	@echo ""

stop:
	@docker-compose stop -t 2

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
	docker run -v `pwd`:/app ubuntudesign/sass sass --debug-info --update /app/static/css --force

##
# Re-create the app image (e.g. to update dependencies)
##
rebuild-app-image:
	docker-compose kill
	docker-compose build web

##
# Make a demo
##
hub-image:
	${MAKE} build-app-image
	$(eval current_branch := `git rev-parse --abbrev-ref HEAD`)
	$(eval image_location := "ubuntudesign/${APP_IMAGE}:${current_branch}")
	$(eval app_name := "${PROJECT_NAME}-${current_branch}")
	docker tag -f ${APP_IMAGE} ${image_location}
	docker push ${image_location}
	@echo ""
	@echo "==="
	@echo "Image pushed to: ${image_location} http://${PROJECT_NAME}-${current_branch}.ubuntu.qa/"
	@echo "==="
	@echo ""

demo:
	@docker-compose -f docker-compose-machine.yml up -d
	@echo ""
	@echo "==="
	@echo "Demo built: http://`docker-machine ip demos`:${PORT}"
	@echo "==="
	@echo ""

##
# Delete created images and containers
##
clean:
	$(eval destroy_images := $(shell bash -c 'read -p "Destroy images? (y/n): " yn; echo $$yn'))
	@docker-compose kill
	@if [[ "${destroy_images}" == "y" ]]; then docker-compose rm -f && echo "${DB_CONTAINER} removed" || echo "Database not found: Nothing to do"; fi
	@echo "Images and containers removed"

##
# "make it so" alias for "make run" (thanks @karlwilliams)
##
it:
so: run

# Phone targets (don't correspond to files or directories)
.PHONY: help build stop logsrun run-site watch-sass compile-sass stop-sass-watcher rebuild-app-image it so
