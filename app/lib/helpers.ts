import {RabbitMqConnection} from "../gateways/message_queue/RabbitMqConnection";
import {Logger} from "./logger";

export async function purgeQueues(queueNames: string[]) {
  const mqConnection = (await RabbitMqConnection.build())!;
  const cleanupChannel = await mqConnection.createChannel();

  for (const queue of queueNames) {
    Logger.info(`Purging queue=${queue}`);
    await cleanupChannel.purgeQueue(queue);
  }

  await cleanupChannel.close();
  await mqConnection.disconnect();
}
