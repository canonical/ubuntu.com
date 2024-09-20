# syntax=docker/dockerfile:experimental

# Build stage: Install python dependencies
# ===
FROM canonicalwebteam/base-image AS base-image
ADD requirements.txt /tmp/requirements.txt
RUN pip3 config set global.disable-pip-version-check true
RUN --mount=type=cache,target=/root/.cache/pip pip3 install --user --requirement /tmp/requirements.txt

# Build stage: Install yarn dependencies
# ===
ADD package.json yarn.lock .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn yarn install --production

# Build stage: Run "yarn run build-js"
# ===
ADD static/js static/js
ADD build.js build.js
ADD babel.config.js .
RUN yarn run build-js

# Build stage: Run "yarn run build-css"
# ===
ADD static/sass static/sass
RUN yarn run build-css

# Build the production image
# ===
FROM ubuntu:jammy
# Set up environment
ENV LANG C.UTF-8
WORKDIR /srv

# Install python and import python dependencies
RUN apt-get update && apt-get install -y --no-install-recommends python3-pip
COPY --from=base-image /root/.local/lib/python3.10/site-packages /root/.local/lib/python3.10/site-packages
COPY --from=base-image /root/.local/bin /root/.local/bin
ENV PATH="/root/.local/bin:${PATH}"

# Import code, build assets and mirror list
ADD . .
RUN rm -rf package.json yarn.lock babel.config.js webpack.config.js
COPY --from=base-image /srv/static/js static/js
COPY --from=base-image /srv/static/css static/css
ADD http://launchpad.net/ubuntu/+cdmirrors-rss etc/ubuntu-mirrors-rss.xml

# Set revision ID
ARG BUILD_ID
ENV TALISKER_REVISION_ID "${BUILD_ID}"
ADD http://launchpad.net/ubuntu/+cdmirrors-rss etc/ubuntu-mirrors-rss.xml

# Setup commands to run server
ENTRYPOINT ["./entrypoint"]
CMD ["0.0.0.0:80"]
