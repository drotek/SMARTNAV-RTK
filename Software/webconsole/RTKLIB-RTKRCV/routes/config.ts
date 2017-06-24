import * as fs from "../utilities/fs_wrapper";
import express = require("express");
import child_process = require("child_process");
const exec = child_process.exec;

import * as logger from "../utilities/logger";
const log = logger.getLogger("admin");

import * as rtkrcv from "../utilities/rtkrcv";

import * as config from "../config";
import path = require("path");

import { IRTKRCVConfig } from "../models/rtkrcv_config";

import { execution_manager } from "../utilities/execution_manager";

import { FileMonitor } from "../utilities/file_monitor";

interface IServiceCommands {
	[id: string]: string;
}

interface IModuleResponse {
	error?: Error;
	stdout?: string;
	stderr?: string;
	isActive?: boolean;
	isEnabled?: boolean;
}

import { Application } from "../app";

export default function controlModule(application: Application) {
	const app = application.app;

	app.get("/configuration", async (req, res) => {
		log.info("GET /configuration", req.body);

		const str2str_configuration = await fs.deserialize_file<IRTKRCVConfig>(config.rtkrcv_config);
		res.send(str2str_configuration);
	});

	app.post("/configuration", async (req, res) => {
		log.info("POST /configuration", req.body);

		await fs.serialize_file<IRTKRCVConfig>(config.rtkrcv_config, req.body);

		const str2str_configuration = await fs.deserialize_file<IRTKRCVConfig>(config.rtkrcv_config);
		res.send(str2str_configuration);
	});

	function execComandLine(res: express.Response, commandLine: string) {
		exec(commandLine, (error, stdout, stderr) => {

			const response: IModuleResponse = {};

			if (error) {
				response.error = error;
			}

			if (stdout) {
				response.stdout = stdout;
			}

			if (stderr) {
				response.stderr = stderr;
			}

			return res.send(response);

		});
	}

}
