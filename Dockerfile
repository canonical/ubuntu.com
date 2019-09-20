# syntax=docker/dockerfile:experimental

# Build stage: Install python dependencies
# ===
FROM python:3.6-slim-buster AS python-dependencies
ADD requirements.txt /tmp/requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip pip3 install -r /tmp/requirements.txt


# Build stage: Run "yarn run build"
# ===
FROM node:10-slim AS yarn-build

WORKDIR /srv
# Install dependencies
ADD package.json .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install
# Build JS
ADD static/js static/js
ADD webpack.config.js .
RUN yarn run build-js
# Build CSS
ADD static/sass static/sass
RUN yarn run build-css
# Add other files, remove unneeded files
ADD . .
RUN rm -r node_modules package.json yarn.lock


# Build the production image
# ===
FROM ubuntu:bionic

# Install python - reuse layer from python-dependencies
RUN apt-get update && apt-get install --yes python3-dev

# Set up environment
ENV LANG C.UTF-8
WORKDIR /srv

# Import code, install code dependencies
COPY --from=python-dependencies /usr/local/lib/python3.6/site-packages /usr/local/lib/python3.6/dist-packages
COPY --from=python-dependencies /usr/local/bin /usr/local/bin
COPY --from=yarn-build /srv .

# Set revision ID
ARG TALISKER_REVISION_ID
ENV TALISKER_REVISION_ID "${TALISKER_REVISION_ID}"

# Setup commands to run server
ENTRYPOINT ["./entrypoint"]
CMD ["0.0.0.0:80"]
