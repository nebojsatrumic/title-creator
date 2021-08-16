import amqplib from "amqplib";
import {Title} from "../../../domain/entities";
import {rabbitMqConnection} from "../../../gateways";
import {RabbitMqConnection} from "../../../gateways/message_queue/RabbitMqConnection";
import {sequelizeConnection} from "../../../gateways/sequelize/connection";
import models from "../../../gateways/sequelize/models";
import {purgeQueues} from "../../../lib/helpers";
import {KnownQueue} from "../../../message_queue_api/constants";
import {init, server} from "../../server";
import {AUTH_HEADER} from "../constants";

describe("Testing title API endpoints", (): void => {
  let mqConnection: RabbitMqConnection;
  let publishChannel: amqplib.Channel;
  const QUEUED_STATUS = "queued";
  beforeAll(async (): Promise<void> => {
    await init();
    mqConnection = (await RabbitMqConnection.build())!;
    publishChannel = await mqConnection.createChannel();
  });
  afterAll(async () => {
    await models.TitleModel.destroy({truncate: {cascade: true}});
    await purgeQueues([KnownQueue.CreateTitle]);
    await sequelizeConnection.close();
    await server.stop();
    await (await rabbitMqConnection()).disconnect();
    await publishChannel.close();
    await mqConnection.disconnect();
  });
  beforeEach(async () => {
    await models.TitleModel.destroy({truncate: {cascade: true}});
    await purgeQueues([KnownQueue.CreateTitle]);
  });

  it("should create title successfully and send message to the processing queue", async (): Promise<void> => {
    const payload = {
      text: "Once upon a time in America.",
    };
    const response = await server.inject({method: "POST", url: `/title/`, payload, headers: AUTH_HEADER});

    expect(response.statusCode).toEqual(200);
    expect(response.result).toBeDefined();

    const result = response.result as Title;
    expect(result.id).toBeDefined();
    expect(result.hash).toBeDefined();
    expect(result.text).toEqual(payload.text);
    expect(result.status).toEqual(QUEUED_STATUS);

    await publishChannel.assertQueue(KnownQueue.CreateTitle);
    const messageRaw = await publishChannel.get(KnownQueue.CreateTitle);
    publishChannel.ackAll();
    const messageParsed = JSON.parse(messageRaw ? messageRaw.content.toString() : "");
    expect(messageParsed.body.title).toBeDefined();
    expect(messageParsed.body.title.hash).toBeDefined();
    expect(messageParsed.body.title.text).toEqual(payload.text);
    expect(messageParsed.body.title.status).toEqual(QUEUED_STATUS);
  });

  it("should return existing title successfully", async (): Promise<void> => {
    const payload = {
      text: "Once upon a time in America.",
    };
    const response = await server.inject({method: "POST", url: `/title/`, payload, headers: AUTH_HEADER});
    expect(response.statusCode).toEqual(200);
    const result = response.result as Title;

    const getResponse = await server.inject({method: "GET", url: `/title/${result.id}`, headers: AUTH_HEADER});
    expect(getResponse.statusCode).toEqual(200);
    expect(getResponse.result).toBeDefined();

    const existingTitle = getResponse.result as Title;
    expect(existingTitle.id).toBe(result.id);
    expect(existingTitle.hash).toBe(result.hash);
    expect(existingTitle.text).toEqual(payload.text);
    expect(existingTitle.status).toEqual(QUEUED_STATUS);
  });
});
