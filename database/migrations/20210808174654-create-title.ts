import {DataTypes, QueryInterface} from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> =>
    queryInterface.createTable("title", {
      title_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      short_title: {
        type: new DataTypes.TEXT(),
      },
      text: {
        type: new DataTypes.TEXT(),
      },
      status: {
        type: new DataTypes.STRING(30),
      },
      hash: {
        type: DataTypes.TEXT(),
      },
      created_at: {
        type: new DataTypes.DATE(),
        defaultValue: new Date().getTime(),
      },
      updated_at: {
        type: new DataTypes.DATE(),
        defaultValue: new Date().getTime(),
      },
    }),
  down: async (queryInterface: QueryInterface): Promise<void> => queryInterface.dropTable("title"),
};
