import {Channel, connect, Connection} from "amqplib";
import {Logger} from "../../lib/logger";
import {sleep} from "../../lib/utils";
import {KnownQueue} from "../../message_queue_api/constants";
import {mqConfig, MQConnectionString} from "./config";

export class RabbitMqConnection {
  private constructor(private connection: Connection) {}

  /**
   * Factory method for instantiation of MqConnection.
   * Reason for this is typescripts limitation that constructor can't be async
   */
  public static async build(): Promise<RabbitMqConnection> {
    // do your async stuff here
    const connection = await this.connect();

    await this.assertKnownQueues(await connection.createChannel());

    // now instantiate and return a class
    return new RabbitMqConnection(connection);
  }

  /**
   * Connecting to rabbit mq instance with retries and exponential back off.
   */
  private static async connect(): Promise<Connection> {
    let retryCount = 0;
    let mqConnection: Connection | undefined;

    while (!mqConnection && retryCount < mqConfig.connectRetryCount) {
      try {
        mqConnection = await connect(MQConnectionString);
        return mqConnection;
      } catch (err) {
        if (err.cause && err.cause.code === "ECONNREFUSED" && retryCount < mqConfig.connectRetryCount) {
          retryCount++;
          const backOffRetryTimeout = retryCount * mqConfig.connectRetryTimeout;
          Logger.info(`Message Queue is unavailable. Retrying connection in ${backOffRetryTimeout / 1000}s`);
          await sleep(backOffRetryTimeout);
        } else {
          Logger.error(`Rabbit mq protocol error: ${JSON.stringify(err)}`);
          throw err;
        }
      }
    }
    const errMessage = `
    Failed to acquire Rabbitmq connection retried ${retryCount} times,
    with exponential timeout between retries ${mqConfig.connectRetryTimeout / 1000} s x number of retry.`;
    throw new Error(errMessage);
  }

  /**
   * Asserting known queues
   */
  private static async assertKnownQueues(channel: Channel): Promise<void> {
    for (const queue of Object.values(KnownQueue)) {
      Logger.info(`Asserting (creating) queue ${queue}`);
      await channel.assertQueue(queue, {durable: true});
    }
  }

  /**
   * Check if connected to rabbitMq instance
   */
  public isConnected(): boolean {
    return !!this.connection;
  }

  /**
   * Disconnect from rabbitMQ
   */
  public async createChannel(): Promise<Channel> {
    return this.connection.createChannel();
  }

  /**
   * Disconnect from rabbitMQ
   */
  public async disconnect(): Promise<void> {
    await this.connection.close();
  }
}
