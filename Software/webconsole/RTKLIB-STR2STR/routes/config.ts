import * as fs from "../utilities/fs_wrapper";

import * as logger from "../utilities/logger";
const log = logger.getLogger("config");

import * as config from "../config";

import { IStationPositionDegrees, IStationPositionMeters, ISTR2STRConfig } from "../models/str2str_config";

import { Application } from "../app";

import * as file_list from "../models/file_list";

interface IServiceCommands {
	[id: string]: string;
}

export default function controlModule(application: Application) {
	const app = application.app;

	app.get("/configuration", async (req, res) => {
		log.info("GET /configuration", req.body);

		try {
			const str2str_configuration = await fs.deserialize_file<ISTR2STRConfig>(config.str2str_config);
			res.send(str2str_configuration);
		} catch (e) {
			log.error("error getting configuration", e);
			res.status(500).send("error getting configuration");
		}
	});

	app.post("/configuration", async (req, res) => {
		log.info("POST /configuration", req.body);

		try {
			await fs.serialize_file<ISTR2STRConfig>(config.str2str_config, req.body);

			const str2str_configuration = await fs.deserialize_file<ISTR2STRConfig>(config.str2str_config);
			res.send(str2str_configuration);
		} catch (e) {
			log.error("error saving configuration", e);
			res.status(500).send("error saving configuration");
		}
	});

	app.get("/listCommands", async (req, res) => {
		log.info("GET /listCommands", req.body);

		try {
			const config_files = await file_list.get_config_files();
			res.send(config_files);
		} catch (e) {
			log.error("error listing commands/configuration files");
			res.status(500).send("error listing commands/configuration files");
		}
	});

}
