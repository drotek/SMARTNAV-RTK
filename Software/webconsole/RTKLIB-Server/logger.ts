import winston = require("winston");

export function getLogger(name: string) {
	const logger = new (winston.Logger)({
		transports: [
			new (winston.transports.Console)()
		]
	});
	return logger;
}
