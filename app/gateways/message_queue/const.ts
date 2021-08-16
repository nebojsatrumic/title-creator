export interface QueueMessageStructure {
  cid: string;
  version: string;
  body: any;
}
export const QUEUE_MESSAGE_VERSION = "1";
