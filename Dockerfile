FROM ubuntu:bionic

# Set up environment
ENV LANG C.UTF-8
WORKDIR /srv

# System dependencies
RUN apt-get update && apt-get install --yes python3-pip

# Import code, install code dependencies
ADD . .
RUN pip3 install -r requirements.txt

# Set revision ID
ARG TALISKER_REVISION_ID
RUN test -n "${TALISKER_REVISION_ID}"
ENV TALISKER_REVISION_ID "${TALISKER_REVISION_ID}"

# Setup commands to run server
ENTRYPOINT ["./entrypoint"]
CMD ["0.0.0.0:80"]

