FROM postgres:13-alpine
COPY database/scripts/create.sh /docker-entrypoint-initdb.d