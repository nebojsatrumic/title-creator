import {DataTypes, Model, Sequelize} from "sequelize";
import {Title} from "../../../domain/entities";
import {TitleStatus} from "../../../domain/entities/Title";

export const createTitleModel = (sequelize: Sequelize): Record<string, any> => {
  class TitleModel extends Model implements Title {
    public id!: string;
    public text!: string;
    public shortTitle!: string;
    public status!: TitleStatus;
    public hash!: string;
  }

  TitleModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: "title_id",
      },
      text: {
        type: new DataTypes.TEXT(),
      },
      shortTitle: {
        type: new DataTypes.TEXT(),
        field: "short_title",
      },
      status: {
        type: new DataTypes.STRING(30),
      },
      hash: {
        type: new DataTypes.TEXT(),
      },
    },
    {
      sequelize,
      tableName: "title",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: false,
    }
  );

  return TitleModel;
};
