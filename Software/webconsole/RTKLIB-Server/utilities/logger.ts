import winston = require("winston");
import * as config from "../config";

export function getLogger(name: string) {
	const logger = new (winston.Logger)({
		transports: [new winston.transports.Console({
			timestamp: true,
			colorize: true,
			humanReadableUnhandledException: true,
		})],
	});
	logger.level = config.log_level || "info";
	return logger;
}
