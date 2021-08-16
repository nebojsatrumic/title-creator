import * as hapi from "@hapi/hapi";
import {Title} from "../../../domain/entities";
import {TitleService} from "../../../domain/services/TitleService";
import {mqPublisher, redisClient, titleRepository} from "../../../gateways";
import {OpenAiClient} from "../../../gateways/openAI/OpenAiClient";

class TitleController {
  constructor(private titleService: TitleService) {}

  public create = async (request: hapi.Request, h: hapi.ResponseToolkit): Promise<hapi.ResponseObject> => {
    const title = await this.titleService.create(request.payload as Title);
    return h.response(title);
  };

  public get = async (request: hapi.Request, h: hapi.ResponseToolkit): Promise<hapi.ResponseObject> => {
    const title = await this.titleService.get(request.params.id);
    return h.response(title);
  };
}
export const titleController = async (): Promise<TitleController> => {
  return new TitleController(new TitleService(titleRepository, redisClient, await mqPublisher(), new OpenAiClient(redisClient)));
};
