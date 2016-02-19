export COMPOSE_PROJECT_NAME ?= $(shell echo $(subst _,,$(subst -,,$(shell basename `pwd`))) | tr A-Z a-z)make
export COMPOSE_FILE ?= docker-compose.makefile.yml
export PORT ?= 8001

DOCKER_IP := 127.0.0.1
ifdef DOCKER_HOST
	DOCKER_IP := $(shell echo ${DOCKER_HOST} | perl -nle'print $$& if m{(\d+\.){3}\d+}')
endif

# Help text
# ===

define HELP_TEXT

www.ubuntu.com - A Django website by the Canonical web team
===

Basic usage
---

> make run         # Prepare Docker images and run the Django site

Now browse to http://127.0.0.1:${PORT} to run the site

All commands
---

> make help               # This message
> make run                # build, watch-sass and run-site (in background)
> make logs               # watch the logs for the site
> make clean-images       # Delete all created images and containers
> make clean-css          # Delete compiled css
> make clean-npm          # Delete node_modules
> make clean-all          # Run all clean commands
> make it so              # a fun alias for "make run"
> make bleeding-edge      # removes stable version of the theme and replaces
													# with bleeding-edge version

(To understand commands in more details, simply read the Makefile)

endef

help:
	$(info ${HELP_TEXT})

run:
	docker-compose up -d
	@echo "==\nServer running at: http://${DOCKER_IP}:${PORT}\n=="

logs:
	docker-compose logs

stop:
	docker-compose kill

clean-images:
	docker-compose kill
	docker-compose rm -f
	docker rmi -f ${COMPOSE_PROJECT_NAME}_web || true

clean-css:
	docker-compose run sass find static/css -name '*.css' -exec rm {} \;
	docker-compose run sass rm -rf /tmp/*;

clean-npm:
	docker-compose run npm rm -rf node_modules

clean-all:
	${MAKE} clean-css
	${MAKE} clean-npm
	${MAKE} clean-images

it:
so: run

bleeding-edge:
	rm -rf node_modules/ubuntu-vanilla-theme
	git clone git@github.com:ubuntudesign/ubuntu-vanilla-theme.git node_modules/ubuntu-vanilla-theme
	git clone git@github.com:ubuntudesign/vanilla-framework.git node_modules/ubuntu-vanilla-theme/node_modules/vanilla-framework
	@echo 'Now on bleeding edge theme -- FRESH!'
