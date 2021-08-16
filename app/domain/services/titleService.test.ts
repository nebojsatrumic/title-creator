import {OpenAiClient} from "gateways/openAI/OpenAiClient";
import {mqPublisher, redisClient, titleRepository} from "../../gateways";
import {Title} from "../entities";
import {TitleService} from "./TitleService";

jest.mock("gateways");
const mockCreate = titleRepository.create as jest.Mock;
const mockGet = titleRepository.getById as jest.Mock;
let mockPublish: jest.Mock = mqPublisher as jest.Mock;

describe("TitleService", (): void => {
  let titleService: TitleService;
  let titleId: string;
  let mockedTitle: Title;
  let mockedTitleWithId: Title;

  beforeAll(async (): Promise<void> => {
    mockPublish.mockReturnValue({publish: () => jest.mock});

    titleService = new TitleService(titleRepository, redisClient, await mqPublisher(), new OpenAiClient(redisClient));
    titleId = "valid-uuidV4";
    mockedTitle = {
      text: "Terminator is a movie about machine taking over",
      shortTitle: "Treminator",
      hash: "mocked_hash",
      status: "queued",
    };
    mockedTitleWithId = {id: titleId, ...mockedTitle};
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should return title by id", async (): Promise<void> => {
    mockGet.mockReturnValue(mockedTitleWithId);

    const title = await titleService.get(titleId);

    expect(mockGet).toBeCalled();
    validateTitleResult(title);
  });

  it("should create title and return it", async (): Promise<void> => {
    mockCreate.mockReturnValue(mockedTitleWithId);

    const title = await titleService.create(mockedTitle);

    expect(mockCreate).toBeCalled();
    validateTitleResult(title);
  });

  function validateTitleResult(title: Title): void {
    expect(title.id).toBe(mockedTitleWithId.id);
    expect(title.text).toBe(mockedTitleWithId.text);
    expect(title.shortTitle).toBe(mockedTitleWithId.shortTitle);
    expect(title.hash).toBe(mockedTitleWithId.hash);
    expect(title.status).toBe(mockedTitleWithId.status);
  }
});
