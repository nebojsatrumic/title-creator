export interface IMqPublisher {
  publish(queue: string, message: any): Promise<void>;
}
