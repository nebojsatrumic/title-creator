import {Sequelize} from "sequelize";
import {Logger, LoggerType} from "../../lib/logger";
import {getDatabaseUriFromEnv} from "../../lib/utils";

const databaseUri = getDatabaseUriFromEnv();

export const sequelizeConnection = new Sequelize(databaseUri, {
  logging: (msg): LoggerType => Logger.debug(msg),
});
