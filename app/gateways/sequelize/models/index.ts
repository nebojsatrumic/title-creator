import {sequelizeConnection} from "../connection";
import {createTitleModel} from "./TitleModel";

const models: Record<string, any> = {
  TitleModel: createTitleModel(sequelizeConnection),
};

Object.keys(models).forEach((key): void => {
  if ("associate" in models[key]) {
    models[key].associate(models);
  }
});

export default models;
