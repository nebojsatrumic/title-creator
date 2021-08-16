import {ENTITY_DOES_NOT_EXIST} from "../../../lib/ErrorReport";

export interface IBaseRepository<T> {
  create(entity: T): Promise<T>;
  getById(id: string): Promise<T>;
}

export class BaseRepository<T> implements IBaseRepository<T> {
  constructor(public model: any) {}
  public async create(entity: T): Promise<T> {
    return this.model.create(entity);
  }

  public async getById(id: string): Promise<T> {
    const entity = await this.model.findByPk(id);
    if (!entity) throw ENTITY_DOES_NOT_EXIST;

    return entity;
  }
}
