import {Channel} from "amqplib";
import Joi from "joi";
import {TitleService} from "../../domain/services/TitleService";
import {Logger} from "../../lib/logger";
import {KnownQueue} from "../constants";
import {EventHandler} from "./EventHandler";
import {baseMessageSchema} from "./sharedSchemas";

export const createTitleSchema = baseMessageSchema.keys({
  body: Joi.object({
    title: Joi.object({
      id: Joi.string().required(),
      text: Joi.string().required(),
      shortTitle: Joi.string().allow(null, ""),
      status: Joi.string(),
      hash: Joi.string(),
    }).required(),
  }).required(),
});

/**
 * Use AI to create short title from the text
 */
export class CreateTitle extends EventHandler {
  constructor(private titleService: TitleService, protected channel: Channel, protected prefetchCount = 200) {
    super(channel, KnownQueue.CreateTitle, createTitleSchema, prefetchCount);
  }
  /**
   * Calls OpenAI API to create and then saves title to database based on the message received
   * @param message Message to handle. Expected format is createTitleSchema
   */
  protected async processEvent(message: any): Promise<void> {
    Logger.info(`layer=interface | message=${JSON.stringify(message)} | Processing`);

    await this.titleService.processTextAndGenerateTitle(message.body.title);

    Logger.info(`layer=interface | created title with id ${JSON.stringify(message.body.title.id)} | Finished processing`);
  }
}
