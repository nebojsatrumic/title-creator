import {mqConfig} from "../gateways/message_queue/config";
import {TitleService} from "../domain/services/TitleService";
import {RabbitMqConnection} from "../gateways/message_queue/RabbitMqConnection";
import {CreateTitle} from "./event_handlers/CreateTitle";

class MqConsumer {
  public constructor(private mqConnection: RabbitMqConnection, private titleService: TitleService) {}

  public async listen(): Promise<void> {
    const createTitleHandler = new CreateTitle(this.titleService, await this.mqConnection.createChannel(), mqConfig.prefetchCount);

    await Promise.all([createTitleHandler.listen()]);
  }
}

export default MqConsumer;
