#! /usr/bin/env bash

rm usn.sqlite3
rm `ls webapp/security/alembic/versions/*cve*`
dotrun exec alembic upgrade head
dotrun exec alembic revision --autogenerate -m “cve_migration”
dotrun exec alembic upgrade head
dotrun exec python3 webapp/security/fixtures/releases.py
