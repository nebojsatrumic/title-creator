import {dbConfig} from "../../config";

export function getDatabaseUriFromEnv(): string {
  return `postgres://${dbConfig.user}:${dbConfig.pass}@${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`;
}

export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
