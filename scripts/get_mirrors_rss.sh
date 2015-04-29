#!/bin/bash

# This script downloads the mirrors rss feed xml from launchpad,
# https://launchpad.net/ubuntu/+cdmirrors-rss. It then verifies
# expected content before placing the final version of the xml file

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="${SCRIPT_DIR}/.."

TEST_FILE=${PROJECT_DIR}/etc/mirrors-rss.xml.test
XML_FILE=${PROJECT_DIR}/etc/mirrors-rss.xml

rm -f $TEST_FILE
wget -q -O $TEST_FILE https://launchpad.net/ubuntu/+cdmirrors-rss

RESULT=$(grep "Ubuntu CD Mirrors Status" $TEST_FILE)

if [ "$RESULT" ]; then
     mv $TEST_FILE $XML_FILE
fi
