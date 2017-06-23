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

		const str2str_configuration = await fs.deserialize_file<ISTR2STRConfig>(config.str2str_config);
		res.send(str2str_configuration);
	});

	app.post("/configuration", async (req, res) => {
		log.info("POST /configuration", req.body);

		await fs.serialize_file<ISTR2STRConfig>(config.str2str_config, req.body);

		const str2str_configuration = await fs.deserialize_file<ISTR2STRConfig>(config.str2str_config);
		res.send(str2str_configuration);
	});

	app.get("/listCommands", async (req, res) => {
		log.info("GET /listCommands", req.body);

		const config_files = await file_list.get_config_files();
		res.send(config_files);
	});

}
