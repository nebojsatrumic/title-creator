import Boom from "@hapi/boom";
import {Auth, Request, ResponseToolkit, Server, ServerAuthScheme, ServerAuthSchemeObject, ServerAuthSchemeOptions} from "@hapi/hapi";
import {conf} from "../../config";
import {HEALTH_ROUTE} from "../routes/constants";

export const customScheme: ServerAuthScheme = (server: Server, options?: ServerAuthSchemeOptions): ServerAuthSchemeObject => ({
  authenticate: async (request: Request, h: ResponseToolkit): Promise<Auth> => {
    const {key} = request.headers;

    if (request.path !== HEALTH_ROUTE) {
      if (!key || key !== conf.serviceApiKey) {
        throw Boom.unauthorized("You are not allowed to use this API");
      }
    }

    return h.authenticated({
      credentials: {
        key,
      },
    });
  },
});
