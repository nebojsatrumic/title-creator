#!/usr/bin/env bash

cat > ./database/migrations/$(date +"%Y%m%d%H%M%S")-$1.ts << EOF
import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    // return queryInterface.createTable('table_name', {});
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    // return queryInterface.dropTable('table_name');
  }
};
EOF
