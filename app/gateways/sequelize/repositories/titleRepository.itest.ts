import {titleRepository} from "../..";
import {Title, TitleDto} from "../../../domain/entities";
import {ENTITY_DOES_NOT_EXIST} from "../../../lib/ErrorReport";
import {sequelizeConnection} from "../connection";
import models from "../models";

describe("When working with TitleRepository", (): void => {
  const testTitle: Title = {
    text: "Story about robots taking over the world. Terminator is sent to the past.",
    shortTitle: "Terminator",
    status: "queued",
    hash: "hash",
  };

  afterAll(async (): Promise<void> => {
    await models.TitleModel.destroy({truncate: {cascade: true}});
    await sequelizeConnection.close();
  });

  it("should create a title", async (): Promise<void> => {
    const title = await titleRepository.create(testTitle);

    expect(title.id).toBeDefined();
    expect(title.shortTitle).toEqual(testTitle.shortTitle);
  });

  it("should throw an error when trying to get a non-existing title", async (): Promise<void> => {
    const nonExistingTitleId = "001e8d0f-d223-41cc-a63a-c749be0ce1ad";

    await expect(titleRepository.getById(nonExistingTitleId)).rejects.toThrow(ENTITY_DOES_NOT_EXIST);
  });

  it("should return a previously persisted title", async (): Promise<void> => {
    const title = await titleRepository.create(testTitle);
    const fetchedTitle = await titleRepository.getById(title.id!);

    expect(title.id).toEqual(fetchedTitle.id);
    expect(title.shortTitle).toEqual(fetchedTitle.shortTitle);
  });

  it("should update an existing title", async (): Promise<void> => {
    const title = await titleRepository.create(testTitle);
    const fetchedTitle = await titleRepository.getById(title.id!);

    fetchedTitle.shortTitle = "test update";
    fetchedTitle.status = "complete";

    const updatedTitle = await titleRepository.updateById(new TitleDto(fetchedTitle));

    expect(fetchedTitle.id).toEqual(updatedTitle.id);
    expect(fetchedTitle.shortTitle).toEqual(updatedTitle.shortTitle);
    expect(fetchedTitle.status).toEqual(updatedTitle.status);
  });
});
