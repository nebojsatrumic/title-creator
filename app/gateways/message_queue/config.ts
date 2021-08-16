const dockerEnv = process.env.DOCKER_ENV;

export const mqConfig = {
  ackThrottleTimeout: parseInt(process.env.ACK_THROTTLE_TIMEOUT!, 10) || 0,
  prefetchCount: parseInt(process.env.PREFETCH_COUNT!, 10) || 200,
  rmqHost: process.env.RMQ_HOST || "rabbitmq",
  rmqPort: parseInt(process.env.RMQ_PORT!, 10) || 5672,
  rmqUser: process.env.RMQ_USER || "guest",
  rmqPass: process.env.RMQ_PASSWORD || "guest",
  rmqProtocol: process.env.RMQ_PROTOCOL || "amqp",
  rmqCertificatePath: process.env.RMQ_SSL_CACERTFILE || "",
  connectRetryTimeout: parseInt(process.env.CONNECT_RETRY_TIMEOUT!, 10) || 1000,
  connectRetryCount: parseInt(process.env.CONNECT_RETRY_COUNT!, 10) || 10,
};

export const MQConnectionString = `${mqConfig.rmqProtocol}://${mqConfig.rmqUser}:${mqConfig.rmqPass}@${mqConfig.rmqHost}:${mqConfig.rmqPort}`;

