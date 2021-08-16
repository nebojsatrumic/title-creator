import {Boom} from "@hapi/boom";
import {Request, ResponseToolkit, Server} from "@hapi/hapi";
import pg from "pg";
import {conf} from "../config";
import {ErrorReport, INTERNAL_SERVER_ERROR} from "../lib/ErrorReport";
import {Logger} from "../lib/logger";
import {customScheme} from "./auth";
import plugins from "./plugins";
import getRoutes from "./routes";

export const server = new Server({
  port: conf.port || 3000,
  debug: {request: ["error"]},
  routes: {
    cors: true,
    validate: {
      failAction: async (request: Request, h: ResponseToolkit, err: any) => {
        Logger.warn(`ValidationError: ${err.message}`);
        throw err;
      },
    },
  },
});

export const init = async (): Promise<void> => {
  pg.types.setTypeParser(1114, (str: any) => new Date(Date.parse(str + "+0000")));

  server.auth.scheme("custom-scheme", customScheme);
  server.auth.strategy("custom-strategy", "custom-scheme");
  server.auth.default("custom-strategy");

  const routes = await getRoutes();
  server.route(routes);

  await server.register(plugins);

  server.ext("onPreResponse", (request: Request, h: ResponseToolkit) => {
    Logger.info(`Request: ${request.url} | body: ${JSON.stringify(request.payload)} | params:${JSON.stringify(request.params)}`);
    // Handle custom error reports (business logic errors)
    if (request.response instanceof ErrorReport) {
      return h.response(request.response.body).code(request.response.httpStatus);
    }
    if ((request.response as any).isBoom && (request.response as any).isServer) {
      Logger.error(request.response.message);
      Logger.error((request.response as Boom).stack);
      return h.response(INTERNAL_SERVER_ERROR.body).code(INTERNAL_SERVER_ERROR.httpStatus);
    }

    return h.continue;
  });

  await server.start();
  Logger.info(`Server running on ${server.info.uri}`);
};

process.on("unhandledRejection", (err): void => {
  // tslint:disable-next-line
  console.log(err);
  Logger.error(JSON.stringify(err));
  process.exit(1);
});
