FROM ubuntu:bionic

# Set up environment
ENV LANG C.UTF-8
WORKDIR /srv

# System dependencies
RUN apt-get update && apt-get install --no-install-recommends --yes python3 python3-setuptools python3-pip libsodium-dev

# Import code, install code dependencies
ADD . .
RUN python3 -m pip install --no-cache-dir -r requirements.txt

# Get mirror list
ADD http://launchpad.net/ubuntu/+cdmirrors-rss etc/ubuntu-mirrors-rss.xml

# Set git commit ID
ARG TALISKER_REVISION_ID
RUN echo "${TALISKER_REVISION_ID}" > version-info.txt
ENV TALISKER_REVISION_ID "${TALISKER_REVISION_ID}"
ADD http://launchpad.net/ubuntu/+cdmirrors-rss etc/ubuntu-mirrors-rss.xml

# Setup commands to run server
ENTRYPOINT ["./entrypoint"]
CMD ["0.0.0.0:80"]
