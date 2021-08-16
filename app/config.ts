import dotenv from "dotenv";

dotenv.config();
export const conf = {
  logLevel: process.env.LOG_LEVEL || "info",
  serviceApiKey: process.env.TITLE_CREATOR_SERVICE_API_KEY || "1234",
  serviceVersion: process.env.SERVICE_VERSION || "1.0.default",
  port: process.env.PORT || 3010,
  mqPort: process.env.MQ_WEB_SERVER_PORT || 3011,
  nodeEnv: process.env.NODE_ENV || "development",
  sentryDsn: process.env.SENTRY_DSN || "",
  dockerEnv: process.env.DOCKER_ENV || "",
};

export const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || "5432",
  name: process.env.DB_DATABASE || "title",
  user: process.env.DB_USER || "",
  pass: process.env.DB_PASSWORD || "",
};

export const redisConfig = {
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT || "6379",
  pass: process.env.REDIS_PASSWORD || "redis_password_1234",
};
