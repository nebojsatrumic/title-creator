import {Boom} from "@hapi/boom";
import {Request, ResponseObject, ResponseToolkit, Server} from "@hapi/hapi";
import {conf} from "../config";
import {RabbitMqConnection} from "../gateways/message_queue/RabbitMqConnection";
import {sequelizeConnection} from "../gateways/sequelize/connection";
import {ErrorReport, INTERNAL_SERVER_ERROR, RABBIT_MQ_NOT_AVAILABLE} from "../lib/ErrorReport";
import {Logger} from "../lib/logger";
export class WebServer {
  private server!: Server;
  private mqConnection!: RabbitMqConnection;
  constructor() {
    this.server = new Server({
      port: conf.mqPort,
      debug: {request: ["error"]},
      routes: {
        cors: true,
        validate: {
          failAction: async (_request: Request, _h: ResponseToolkit, err: any) => {
            Logger.warn(`ValidationError: ${err.message}`);
            throw err;
          },
        },
      },
    });
    this.server.route({
      method: "GET",
      path: "/health",
      handler: async (_request: Request, h: ResponseToolkit): Promise<ResponseObject> => {
        if (!this.mqConnection.isConnected()) {
          throw RABBIT_MQ_NOT_AVAILABLE;
        }
        await sequelizeConnection.query("SELECT version();");

        return h.response({
          version: conf.serviceVersion,
        });
      },
    });

    this.server.ext("onPreResponse", (request: Request, h: ResponseToolkit) => {
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
  }
  public async start(mqConnection: RabbitMqConnection): Promise<void> {
    this.mqConnection = mqConnection;
    await this.server.start();
    Logger.info(`Server running on ${this.server.info.uri}`);
  }

  public async stop() {
    await this.server.stop();
    Logger.info(`Stopping server on ${this.server.info.uri}`);
  }
}
