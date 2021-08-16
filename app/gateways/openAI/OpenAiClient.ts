import OpenAI from "openai-api";
import {ICacheClient} from "../../gateways/redis/ICacheClient";
import {Logger} from "../../lib/logger";
import {sleep} from "../../lib/utils";
import {openAiApiConfig} from "./config";

const KEY_API_CALLS_SEC = "API_CALLS_MADE_IN_ONE_SECOND";
const OPENAI_COMPLETE_ENGINE = "davinci";
export class OpenAiClient {
  private openAi: OpenAI;
  constructor(private cacheClient: ICacheClient) {
    this.openAi = new OpenAI(openAiApiConfig.apiKey);
  }
  public async getTitle(text: string): Promise<string | undefined> {
    let result: string | undefined;
    let callsLimit = +(await this.cacheClient.get(KEY_API_CALLS_SEC)) || 0;
    if (callsLimit < 5) {
      callsLimit += 1;
      try {
        const response = await this.openAi.complete({
          engine: OPENAI_COMPLETE_ENGINE,
          prompt: text,
          temperature: 0,
          maxTokens: 30,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
          stop: ['"""'],
        });

        // return first choice text (additional logic can be created for returning better choice)
        result = response.data.choices[0].text;
      } catch (err) {
        Logger.error(`ERROR OpenAI request ${JSON.stringify(err)}`);
      }

      this.cacheClient.set(KEY_API_CALLS_SEC, callsLimit, "ex", 1);
      return result;
    } else {
      await sleep(1000);
      return this.getTitle(text);
    }
  }
}
