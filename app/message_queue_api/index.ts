import pg from "pg";
import {TitleService} from "../domain/services/TitleService";
import {mqPublisher, redisClient, titleRepository} from "../gateways";
import {RabbitMqConnection} from "../gateways/message_queue/RabbitMqConnection";
import {OpenAiClient} from "../gateways/openAI/OpenAiClient";
import {Logger} from "../lib/logger";
import {sleep} from "../lib/utils";
import MqConsumer from "./MqConsumer";
import {WebServer} from "./MqWebServer";

pg.types.setTypeParser(1114, (str: any) => new Date(Date.parse(str + "+0000")));

let webServer: WebServer | undefined;
const mainThreadRecoveryTimeout = 5000;

async function main() {
  let mqConnection: RabbitMqConnection | undefined;
  try {
    mqConnection = (await RabbitMqConnection.build())!;
    await runWebServer(mqConnection);
    await runMqWorker(mqConnection);
  } catch (err) {
    Logger.error(`Main process crashed restarting .............. | error: ${JSON.stringify(err)}`);
    if (mqConnection?.isConnected()) {
      await mqConnection.disconnect();
    }
    await sleep(mainThreadRecoveryTimeout);
    await main();
  }
}

async function runMqWorker(mqConn: RabbitMqConnection) {
  try {
    const titleService = new TitleService(titleRepository, redisClient, await mqPublisher(), new OpenAiClient(redisClient));

    const worker = new MqConsumer(mqConn, titleService);

    await worker.listen();
  } catch (err) {
    Logger.error(`MQ worker crashed | error: ${JSON.stringify(err)}`);
    throw err;
  }
}

async function runWebServer(mqConn: RabbitMqConnection) {
  try {
    if (!webServer) {
      webServer = new WebServer();
    }
    await webServer.start(mqConn);
  } catch (err) {
    Logger.error(`MQ web server crashed | error: ${JSON.stringify(err)}`);
    throw err;
  }
}

// tslint:disable-next-line
main();

process.on("unhandledRejection", (err): void => {
  Logger.error(`Fatal error: ${JSON.stringify(err)} ............. terminating main process!`);
  process.exit(1);
});
