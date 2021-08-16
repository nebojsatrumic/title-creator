import Winston, {format} from "winston";
import {conf} from "../../config";

export const Logger = Winston.createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new Winston.transports.Console({
      level: conf.logLevel,
    }),
  ],
});

export {Logger as LoggerType} from "winston";
