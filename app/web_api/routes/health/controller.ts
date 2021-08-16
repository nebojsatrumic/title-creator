import * as hapi from "@hapi/hapi";
import {conf} from "../../../config";
import models from "../../../gateways/sequelize/models";

class HealthController {
  public get = async (_request: hapi.Request, h: hapi.ResponseToolkit): Promise<hapi.ResponseObject> => {
    await models.TitleModel.findOne();

    return h.response({
      version: conf.serviceVersion,
    });
  };
}

export const healthController = new HealthController();
