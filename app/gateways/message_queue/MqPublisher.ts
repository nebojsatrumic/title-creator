import amqplib from "amqplib";
import {Logger} from "../../lib/logger";
import { IMqPublisher } from "./IMqPublisher";

export class MqPublisher implements IMqPublisher {
  public constructor(private publishChannel: amqplib.Channel) {
    this.publishChannel = publishChannel;
  }

  public async publish(queue: string, message: any): Promise<void> {
    Logger.info(`layer=MqPublisher | Publish started`);
    const messageBuffer = Buffer.from(JSON.stringify(message));
    await this.publishChannel.sendToQueue(queue, messageBuffer);
    Logger.info(`layer=MqPublisher | message=${JSON.stringify(message)} | Published to ${queue}`);
  }
}
