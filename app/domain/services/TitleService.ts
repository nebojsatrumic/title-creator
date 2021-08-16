import crypto from "crypto";
import {uuid} from "uuidv4";
import {QueueMessageStructure, QUEUE_MESSAGE_VERSION} from "../../gateways/message_queue/const";
import {IMqPublisher} from "../../gateways/message_queue/IMqPublisher";
import {OpenAiClient} from "../../gateways/openAI/OpenAiClient";
import {ICacheClient} from "../../gateways/redis/ICacheClient";
import {ITitleRepository} from "../../gateways/sequelize/repositories/TitleRepository";
import {OPEN_AI_FAILURE} from "../../lib/ErrorReport";
import {Logger} from "../../lib/logger";
import {KnownQueue} from "../../message_queue_api/constants";
import {Title, TitleDto} from "../entities";

const ENCODING = "hex";
const HASHING_ALGORITHM = "md5";

export class TitleService {
  constructor(
    private titleRepository: ITitleRepository,
    private cacheClient: ICacheClient,
    private mqPublisher: IMqPublisher,
    private openAiClient: OpenAiClient
  ) {}

  public async create(title: Title): Promise<TitleDto> {
    Logger.info(`Creating title ${JSON.stringify(title)}`);
    const hashedSummary = crypto.createHash(HASHING_ALGORITHM).update(title.text).digest(ENCODING);

    const cachedTitle = await this.cacheClient.get(hashedSummary);
    if (cachedTitle) {
      return new TitleDto(JSON.parse(cachedTitle));
    }

    title.hash = hashedSummary;
    title.status = "queued";

    const createdTitle = await this.titleRepository.create(title);
    const response = new TitleDto(createdTitle);

    await this.cacheClient.set(hashedSummary, JSON.stringify(response));
    const queueMessage: QueueMessageStructure = {cid: uuid(), version: QUEUE_MESSAGE_VERSION, body: {title: response}};

    await this.mqPublisher.publish(KnownQueue.CreateTitle, queueMessage);

    return response;
  }

  public async get(id: string): Promise<TitleDto> {
    const title = await this.titleRepository.getById(id);
    return new TitleDto(title);
  }

  public async processTextAndGenerateTitle(title: Title) {
    const cachedTitle = await this.cacheClient.get(title.hash);
    if (cachedTitle?.status === "complete") {
      return;
    }
    const titleFromDb = new TitleDto(await this.titleRepository.getById(title.id!));

    const shortTitle = await this.openAiClient.getTitle(title.text);
    if (!shortTitle) {
      throw OPEN_AI_FAILURE;
    }
    titleFromDb.status = "complete";
    titleFromDb.shortTitle = shortTitle;
    await this.titleRepository.updateById(titleFromDb);
    await this.cacheClient.set(titleFromDb.hash, JSON.stringify(titleFromDb));
  }
}
