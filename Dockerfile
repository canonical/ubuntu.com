FROM python:3-slim

WORKDIR /srv
ADD . .

RUN pip3 install gunicorn
RUN pip3 install -r requirements.txt

ENTRYPOINT ["gunicorn", "webapp.wsgi", "-b"]
CMD ["0.0.0.0:80"]

