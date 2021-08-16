#!/bin/ash
set -e

npm run clean
npm run build

./node_modules/sequelize-cli/lib/sequelize db:migrate

npm run start-web:dev
