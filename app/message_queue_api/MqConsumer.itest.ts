import amqplib from "amqplib";
import {Title} from "../domain/entities";
import {TitleService} from "../domain/services/TitleService";
import {redisClient, titleRepository} from "../gateways";
import {MqPublisher} from "../gateways/message_queue/MqPublisher";
import {RabbitMqConnection} from "../gateways/message_queue/RabbitMqConnection";
import {OpenAiClient} from "../gateways/openAI/OpenAiClient";
import {sequelizeConnection} from "../gateways/sequelize/connection";
import models from "../gateways/sequelize/models";
import {purgeQueues} from "../lib/helpers";
import {sleep} from "../lib/utils";
import {KnownQueue} from "./constants";
import MqConsumer from "./MqConsumer";

jest.mock("gateways/openAI/OpenAiClient");

const TIMEOUT = 600000;

describe("MqConsumer", () => {
  let mqConnection: RabbitMqConnection;
  let publishChannel: amqplib.Channel;
  let consumer: MqConsumer;
  let dbPersistedTitle: Title;
  let mockGetTitle: jest.Mock;

  const terminatorWiki = `The Terminator is a 1984 science fiction action film directed by James Cameron.
              It stars Arnold Schwarzenegger as the Terminator, a cyborg assassin sent back in time from 2029
              to 1984 to kill Sarah Connor(Linda Hamilton), whose unborn son will one day save mankind from
              extinction by a hostile artificial intelligence in a post- apocalyptic
              future.Michael Biehn plays Kyle Reese, a soldier sent back in time to protect Sarah.
              The screenplay is credited to Cameron and producer Gale Anne Hurd, while co - writer
              William Wisher Jr.received a credit for additional dialogue.`;
  const hashValue = "hash";

  beforeAll(async () => {
    mqConnection = (await RabbitMqConnection.build())!;

    publishChannel = await mqConnection.createChannel();

    const openAiClient = new OpenAiClient(redisClient);
    const titleService = new TitleService(titleRepository, redisClient, new MqPublisher(publishChannel), openAiClient);
    mockGetTitle = openAiClient.getTitle as jest.Mock;

    consumer = new MqConsumer(mqConnection, titleService);
    await consumer.listen();
  }, TIMEOUT);

  afterAll(async () => {
    await models.TitleModel.destroy({truncate: {cascade: true}});
    await purgeQueues([KnownQueue.CreateTitle]);
    await publishChannel.close();
    await mqConnection.disconnect();
    await sequelizeConnection.close();
    redisClient.del(hashValue);
  }, TIMEOUT);

  beforeEach(async () => {
    await models.TitleModel.destroy({truncate: {cascade: true}});
    await purgeQueues([KnownQueue.CreateTitle]);
    redisClient.del(hashValue);

    const queuedTitle: Title = {
      text: terminatorWiki,
      status: "queued",
      hash: hashValue,
    };
    dbPersistedTitle = await titleRepository.create(queuedTitle);
  });
  describe("When processing: create-title messages", () => {
    it(
      "for valid message it should create title in database",
      async () => {
        const message = {
          cid: "uuid",
          version: "1",
          body: {
            title: {
              id: dbPersistedTitle.id,
              text: terminatorWiki,
              hash: hashValue,
              status: "queued",
            },
          },
        };

        mockGetTitle.mockReturnValue("Terminator");
        const messageBuffer = Buffer.from(JSON.stringify(message));
        publishChannel.sendToQueue(KnownQueue.CreateTitle, messageBuffer);

        await sleep(1000);

        const titles = await models.TitleModel.findAll();
        expect(titles.length).toBe(1);
        expect(titles[0].text).toBe(message.body.title.text);
        expect(titles[0].hash).toBe(message.body.title.hash);
        expect(titles[0].shortTitle).toBeDefined();
        expect(titles[0].status).toBe("complete");
      },
      TIMEOUT
    );

    it(
      "should reject invalid message",
      async () => {
        const message = {correlationId: "uuidV4"};
        const messageBuffer = Buffer.from(JSON.stringify(message));
        publishChannel.sendToQueue(KnownQueue.CreateTitle, messageBuffer);

        await sleep(500);

        const publishQueue = await publishChannel.assertQueue(KnownQueue.CreateTitle);
        expect(publishQueue.messageCount).toBe(0);
        const titles = await models.TitleModel.findAll();
        expect(titles.length).toBe(1);
        expect(titles[0].status).toBe("queued");
      },
      TIMEOUT
    );
  });
});
