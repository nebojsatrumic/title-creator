import {Channel, ConsumeMessage} from "amqplib";
import {ObjectSchema} from "joi";
import {mqConfig} from "../../gateways/message_queue/config";
import {QueueMessageStructure} from "../../gateways/message_queue/const";
import {Logger} from "../../lib/logger";
import {sleep} from "../../lib/utils";
import {KnownQueue} from "../constants";

export abstract class EventHandler {
  public constructor(
    protected channel: Channel,
    protected queueName: KnownQueue,
    protected eventSchema: ObjectSchema,
    protected prefetchCount = 200
  ) {
    this.handle = this.handle.bind(this);
    this.channel.prefetch(this.prefetchCount);
  }

  /**
   * Start listening for messages from the MQ
   */
  public async listen() {
    Logger.info(`${this.toString()} | Start listening...`);
    await this.channel.assertQueue(this.queueName, {durable: true});
    await this.channel.consume(this.queueName, this.handle);
  }

  /**
   * Discard message, don't requeue
   * @param message Message to discard
   */
  protected reject(message: ConsumeMessage) {
    this.channel.reject(message, false);
  }

  /**
   * Requeue the message after [ms]
   * @param message Message to requeue
   * @param ms Timeout in milliseconds
   */
  protected async snooze(message: ConsumeMessage, ms = 1000) {
    await sleep(ms);
    this.channel.nack(message, undefined, true);
  }

  /**
   * Handle one message consumed from the queue
   *
   * Child handlers override the processEvent method, all logic above that is shared between all event handler
   * @param messageRaw
   */
  public async handle(messageRaw: ConsumeMessage | null): Promise<void> {
    // Discard null messages, this sometimes happens with rabbitmq
    if (messageRaw == null) {
      return;
    }
    const start = process.hrtime();

    const messageParsed = JSON.parse(messageRaw.content.toString());
    Logger.info(`${this.toString()} | messageRaw=${messageRaw?.content.toString()}`);

    const validatedMessage = this.validateMessage(messageParsed);
    if (!validatedMessage) {
      return this.reject(messageRaw);
    }

    Logger.info(
      `${this.toString()}
      | cid=${validatedMessage.cid}
      | version=${validatedMessage.version}
      | body=${JSON.stringify(validatedMessage.body)}
      | Processing`
    );

    try {
      await this.processEvent(validatedMessage);

      Logger.info(
        `${this.toString()}
        | cid=${validatedMessage.cid}
        | version=${validatedMessage.version}
        | body=${JSON.stringify(validatedMessage.body)}
        | Finished processing`
      );
      await sleep(mqConfig.ackThrottleTimeout);
      return this.channel.ack(messageRaw);
    } catch (e) {
      Logger.error(e.stack);
      return this.snooze(messageRaw);
    } finally {
      const end = process.hrtime(start);
      Logger.info(`Handling of a message finished: ${end[0]}s ${end[1]}ns`);
    }
  }

  private validateMessage(messageParsed: any) {
    const validatedMessage = this.eventSchema.validate(messageParsed, {
      allowUnknown: true,
    });
    if (validatedMessage.error) {
      Logger.error(
        `${this.toString()}
        | message=${JSON.stringify(messageParsed)}
        | validation error ${validatedMessage.error} | Invalid message.`
      );
      return undefined;
    }
    return validatedMessage.value;
  }

  protected abstract processEvent(validatedMessageObject: QueueMessageStructure): Promise<void>;

  private toString(): string {
    return `${this.constructor.name} | queueName=${this.queueName}, prefetchCount=${this.prefetchCount}`;
  }
}
