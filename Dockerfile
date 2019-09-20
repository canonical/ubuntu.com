# syntax=docker/dockerfile:experimental

# Build stage: Install python dependencies
# ===
FROM python:3.6-slim-buster AS python-dependencies
ADD requirements.txt /tmp/requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip pip3 install -r /tmp/requirements.txt


# Build stage: Install yarn dependencies
# ===
FROM node:10-slim AS yarn-dependencies
WORKDIR /srv
ADD package.json .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install


# Build stage: Run "yarn run build-js"
# ===
FROM yarn-dependencies AS build-js
ADD static/js static/js
ADD webpack.config.js .
RUN yarn run build-js


# Build stage: Run "yarn run build-css"
# ===
FROM yarn-dependencies AS build-css
ADD static/sass static/sass
RUN yarn run build-css


# Build the production image
# ===
FROM ubuntu:bionic

# Install python and import python dependencies
RUN apt-get update && apt-get install --yes python3-dev
COPY --from=python-dependencies /usr/local/lib/python3.6/site-packages /usr/local/lib/python3.6/dist-packages
COPY --from=python-dependencies /usr/local/bin /usr/local/bin

# Set up environment
ENV LANG C.UTF-8
WORKDIR /srv

# Import code, build assets and mirror list
ADD . .
RUN rm -r package.json yarn.lock
COPY --from=build-js /srv/static/js static/js
COPY --from=build-css /srv/static/css static/css
ADD http://launchpad.net/ubuntu/+cdmirrors-rss etc/ubuntu-mirrors-rss.xml

# Set revision ID
ARG TALISKER_REVISION_ID
ENV TALISKER_REVISION_ID "${TALISKER_REVISION_ID}"

# Setup commands to run server
ENTRYPOINT ["./entrypoint"]
CMD ["0.0.0.0:80"]
