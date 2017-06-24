
import * as logger from "../utilities/logger";
const log = logger.getLogger("admin");

import { Application } from "../app";
import * as rtkrcv_config from "../models/rtkrcv_config";

export default function controlModule(application: Application) {
	const app = application.app;

	app.post("/control", async (req, res) => {
		log.info("POST /control", req.body);

		const commandType: string = req.body.commandType;
		const response = await rtkrcv_config.control(application, commandType);

		log.debug("POST /control result", response);
		return res.send(response);
	});
}
