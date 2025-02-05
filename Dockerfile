# syntax=docker/dockerfile:experimental

# Build stage: Install python dependencies
# ===
FROM ubuntu:noble AS python-dependencies
RUN apt-get update && apt-get install --no-install-recommends --yes \
  python3-pip python3-setuptools python3-wheel python3-venv \
  build-essential git ca-certificates
ADD requirements.txt /tmp/requirements.txt
RUN pip3 config set global.disable-pip-version-check true
RUN python3 -m venv /venv
ENV PATH="/venv/bin:${PATH}"
RUN --mount=type=cache,target=/root/.cache/pip pip3 install --requirement /tmp/requirements.txt


# Build stage: Install yarn dependencies
# ===
FROM node:20 AS yarn-dependencies
WORKDIR /srv
ADD package.json yarn.lock .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install --production


# Build stage: Run "yarn run build-js"
# ===
FROM yarn-dependencies AS build-js
ADD static/js static/js
ADD build.js build.js
ADD babel.config.js .
RUN yarn run build-js


# Build stage: Run "yarn run build-css"
# ===
FROM yarn-dependencies AS build-css
ADD static/sass static/sass
RUN yarn run build-css


# Build the production image
# ===
FROM ubuntu:noble

# Install python and import python dependencies
RUN apt-get update && apt-get install --no-install-recommends --yes \
  python3-setuptools python3-lib2to3 python3-pkg-resources \
  ca-certificates libsodium-dev gpg
COPY --from=python-dependencies /venv /venv
ENV PATH="/venv/bin:${PATH}"

# Set up environment
ENV LANG C.UTF-8
WORKDIR /srv

# Import code, build assets and mirror list
ADD . .
RUN rm -rf package.json yarn.lock babel.config.js webpack.config.js
COPY --from=build-js /srv/static/js static/js
COPY --from=build-js /srv/node_modules/vanilla-framework/templates node_modules/vanilla-framework/templates
COPY --from=build-css /srv/static/css static/css

# Set revision ID
ARG BUILD_ID
ENV TALISKER_REVISION_ID "${BUILD_ID}"
ADD http://launchpad.net/ubuntu/+cdmirrors-rss etc/ubuntu-mirrors-rss.xml

# Setup commands to run server
ENTRYPOINT ["./entrypoint"]
CMD ["0.0.0.0:80"]
