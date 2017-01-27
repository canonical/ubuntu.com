FROM python:2

# Pip requirements files
ADD requirements.txt /requirements.txt

# Install pip requirements
RUN pip install -r /requirements.txt

ADD . /app
WORKDIR /app

CMD ["./run-dev-server"]
