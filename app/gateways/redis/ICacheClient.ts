
export interface ICacheClient {
  getClient(): any;
  set(key: string, value: any, option?: string, ttl?: number): any;
  get(key: string): any;
  del(key: string): any;
}
