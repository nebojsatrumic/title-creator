import {Title} from "../../../domain/entities";
import models from "../models";
import {BaseRepository, IBaseRepository} from "./BaseRepository";

export interface ITitleRepository extends IBaseRepository<Title> {
  updateById(title: Partial<Title>): Promise<Title>;
}

export class TitleRepository extends BaseRepository<Title> implements ITitleRepository {
  constructor() {
    super(models.TitleModel);
  }
  public async updateById(title: Partial<Title>): Promise<Title> {
    const sequelizeResult = await this.model.update(title, {
      where: {id: title.id},
      returning: true,
      plain: true,
    });
    return sequelizeResult[1];
  }
}
