FROM ubuntu:bionic
WORKDIR /srv

# System dependencies
RUN apt-get update && apt-get install --yes python3-pip

# Python dependencies
ENV LANG C.UTF-8

# Set git commit ID
ARG COMMIT_ID
RUN echo $COMMIT_ID > /srv/version-info.txt
RUN test -n "${COMMIT_ID}"

# Import code, install code dependencies
ADD . .
RUN pip3 install -r requirements.txt

# Setup commands to run server
ENTRYPOINT ["talisker.gunicorn", "webapp.wsgi", "--access-logfile", "-", "--error-logfile", "-", "--bind"]
CMD ["0.0.0.0:80"]

