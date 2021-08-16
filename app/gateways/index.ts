import {IMqPublisher} from "./message_queue/IMqPublisher";
import {MqPublisher} from "./message_queue/MqPublisher";
import {RabbitMqConnection} from "./message_queue/RabbitMqConnection";
import {ICacheClient} from "./redis/ICacheClient";
import {RedisClient} from "./redis/redisClient";
import {ITitleRepository, TitleRepository} from "./sequelize/repositories/TitleRepository";

/*
 Declare export variable with an interface type annotations
 Choose and instantiate appropriate implementation based on env variable or configuration
 */
export const titleRepository: ITitleRepository = new TitleRepository();
export const redisClient: ICacheClient = new RedisClient();

let rabbitConn: RabbitMqConnection;
export const rabbitMqConnection = async () => {
  if (!rabbitConn) {
    rabbitConn = await RabbitMqConnection.build();
  }
  return rabbitConn;
};

export const mqPublisher = async (): Promise<IMqPublisher> => {
  return new MqPublisher(await (await rabbitMqConnection()).createChannel());
};
