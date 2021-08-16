import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    queryInterface.bulkInsert('clients', [{
      id: '446f40c6-d1c4-4ccd-90dd-132bba8d04af',
      name: 'client234',
      created_at: new Date(),
      updated_at: new Date(),
    }], {});
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    queryInterface.bulkDelete('clients', {});
  },
};
