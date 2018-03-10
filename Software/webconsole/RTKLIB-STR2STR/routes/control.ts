import * as fs from "../utilities/fs_wrapper";
import express = require("express");
import child_process = require("child_process");
const exec = child_process.exec;

import * as logger from "../utilities/logger";
const log = logger.getLogger("control");

import * as str2str from "../utilities/str2str";

import * as config from "../config";

import { execution_manager } from "../utilities/execution_manager";

import { IStationPositionDegrees, IStationPositionMeters, ISTR2STRConfig } from "../models/str2str_config";

import { Application } from "../app";
import path = require("path");

import { FileMonitor } from "../utilities/file_monitor";

import * as log_parser from "../models/log_parser";

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

export default function controlModule(application: Application) {
	const app = application.app;

	app.post("/control", async (req, res) => {
		log.info("POST /control", req.body);

		const commandType: string = req.body.commandType;

		const response: IModuleResponse = {};

		let error: Error = null;

		try {
			switch (commandType) {
				case "start":
					if (!application.str2str_instance) {
						if (!await fs.exists(config.str2str_config)) {
							throw new Error("str2str configuration is missing: " + config.str2str_config);
						}
						const str2str_configuration = await fs.deserialize_file<ISTR2STRConfig>(config.str2str_config);
						application.str2str_instance = new str2str.str2str(str2str_configuration);
						application.str2str_instance.start();

						await fs.serialize_file<ISTR2STRConfig>(config.str2str_config, str2str_configuration);

						let log_filename: string = null;
						if (str2str_configuration.log_file) {
							log_filename = path.resolve(path.join(config.str2str_path, str2str_configuration.log_file));
						} else {
							log_filename = path.resolve(config.str2str_default_tracefile);
						}
						application.str2str_log_monitor = new FileMonitor(log_filename);

						application.str2str_instance.on("close", (code) => {
							application.monitor_events.emit("close", code);
						});

						application.str2str_instance.on("status", (status) => {
							application.monitor_events.emit("status", status);
						});

						application.str2str_instance.on("stderr", (data) => {
							application.monitor_events.emit("stderr", data);
						});

						application.str2str_instance.on("stdout", (data) => {
							application.monitor_events.emit("stdout", data);
						});

						application.str2str_log_monitor.on("line", (line: string) => {
							const log_line = log_parser.parse(line);
							if (log_line != null) {
								application.monitor_events.emit("log_line", log_line);
							} else {
								log.warn("unable to parse log", line);
								application.monitor_events.emit("line", line);
							}
						});
					} else {
						throw new Error("can't start an already stated service");
					}
					break;
				case "stop":
					if (application.str2str_instance) {
						application.str2str_instance.stop();
						application.str2str_instance = null;
						const str2str_configuration = await fs.deserialize_file<ISTR2STRConfig>(config.str2str_config);
						await fs.serialize_file<ISTR2STRConfig>(config.str2str_config, str2str_configuration);

						if (application.str2str_log_monitor) {
							await application.str2str_log_monitor.close();
							application.str2str_log_monitor = null;
						}
					}
					break;
				case "status": {
					const str2str_configuration = await fs.deserialize_file<ISTR2STRConfig>(config.str2str_config);
					response.isActive = application.str2str_instance && application.str2str_instance.status();
					response.isEnabled = str2str_configuration.enabled;

				}              break;
				case "enable": {
					const str2str_configuration = await fs.deserialize_file<ISTR2STRConfig>(config.str2str_config);
					str2str_configuration.enabled = true;
					await fs.serialize_file<ISTR2STRConfig>(config.str2str_config, str2str_configuration);
				}              break;
				case "disable": {
					const str2str_configuration = await fs.deserialize_file<ISTR2STRConfig>(config.str2str_config);
					str2str_configuration.enabled = false;
					await fs.serialize_file<ISTR2STRConfig>(config.str2str_config, str2str_configuration);
				}
			}
		} catch (e) {
			log.error("error", commandType, e);
			error = e;
		}
		response.stdout = (application.str2str_instance) ? application.str2str_instance.getStdout() : null;
		response.stderr = (application.str2str_instance) ? application.str2str_instance.getStderr() : null;
		response.error = error;

		if (application.str2str_instance == null || (!application.str2str_instance.status())) {
			application.str2str_instance = null;
		}

		log.debug("POST /control result", response);
		return res.send(response);

	});

}
