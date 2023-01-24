cd _maxminddb_geolite2
rm *.mmdb
curl -O https://download.db-ip.com/free/dbip-country-lite-2023-01.mmdb.gz
gunzip "dbip-country-lite-2023-01.mmdb.gz"
cd ..

# export PYTHONPATH=`pwd`:`pwd`/..
# python -c "if 1:
#     from geolite2 import geolite2;
#     info = geolite2.get_info()
#     print info.date.strftime('%Y.%m%d')
# " > VERSION
