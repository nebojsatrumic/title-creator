#!/usr/bin/env bash

cat > ./database/seeders/$(date +"%Y%m%d%H%M%S")-$1.ts << EOF
import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    // queryInterface.bulkInsert('table_name', [], {});
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    // queryInterface.bulkDelete('table_name', {});
  }
};
EOF
