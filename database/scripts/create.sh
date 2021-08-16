#!/bin/bash
set -e

echo "CREATE test DB";

# Create the test database
psql -v ON_ERROR_STOP=1 --username "$DB_USER" --dbname "$DB_DATABASE" <<-EOSQL
    CREATE DATABASE title_test;
EOSQL

# Create the schema using the ACRM_create.sql file
# psql -v ON_ERROR_STOP=1 --username "$DB_USER" --dbname test -f /docker-entrypoint-initdb.d/lithuanian_create.sql

echo "Test DB CREATED!"


# Create the title database
psql -v ON_ERROR_STOP=1 --username "$DB_USER" --dbname "$DB_DATABASE" <<-EOSQL
    CREATE DATABASE title;
EOSQL

echo "CREATE title DB!"


