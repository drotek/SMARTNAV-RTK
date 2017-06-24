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

import * as rtkrcv_accessor from "../utilities/rtkrcv_accessor";
import * as rtkrcv_monitor from "../utilities/rtkrcv_monitor";

import moment = require("moment");

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

	app.post("/control", async (req, res) => {
		log.info("POST /control", req.body);
		res.setHeader("Access-Control-Allow-Origin", "*");

		const commandType: string = req.body.commandType;
		const configType: string = req.body.configType;

		const response: IModuleResponse = {};

		let error: Error = null;

		try {
			switch (commandType) {
				case "start":
					if (!application.rtkrcv_instance) {
						if (!await fs.exists(config.rtkrcv_config)) {
							throw new Error("rtkrcv configuration is missing: " + config.rtkrcv_config);
						}
						const rtkrcv_configuration = await fs.deserialize_file<IRTKRCVConfig>(config.rtkrcv_config);

						const timestamp = moment(new Date()).format("YYYYMMDD-HHmmss.SSS");

						rtkrcv_configuration.log_file = path.join(config.logs_path, `rtkrcv_${timestamp}.trace`);
						rtkrcv_configuration.stat_file = path.join(config.logs_path, `rtkrcv_${timestamp}.stat`);

						application.rtkrcv_instance = new rtkrcv.rtkrcv(rtkrcv_configuration);
						application.rtkrcv_instance.start();

						await fs.serialize_file<IRTKRCVConfig>(config.rtkrcv_config, rtkrcv_configuration);

						let log_filename: string = null;
						if (rtkrcv_configuration.log_file) {
							log_filename = path.resolve(path.join(config.rtkrcv_path, rtkrcv_configuration.log_file));
						}
						//  else {
						//     log_filename = path.resolve(config.rtkrcv_default_tracefile);
						// }
						application.rtkrcv_log_monitor = new FileMonitor(log_filename);

						application.rtkrcv_instance.on("close", (code) => {
							application.monitor_events.emit("close", code);
						});

						application.rtkrcv_instance.on("stderr", (data) => {
							application.monitor_events.emit("stderr", data);
						});

						application.rtkrcv_instance.on("stdout", (data) => {
							application.monitor_events.emit("stdout", data);
						});

						application.rtkrcv_log_monitor.on("line", (line: string) => {
							application.monitor_events.emit("line", line);
						});

						application.rtkrcv_instance_monitor = new rtkrcv_monitor.RTKRCV_Monitor("localhost", rtkrcv_configuration.monitor_port);
						application.rtkrcv_instance_monitor.start();

						application.rtkrcv_instance_accessor = new rtkrcv_accessor.RTKRCV_Client("localhost", rtkrcv_configuration.console_port, rtkrcv_configuration.login_password);
						application.rtkrcv_instance_accessor.start();

					} else {
						throw new Error("can't start an already stated service");
					}
					break;
				case "stop":
					if (application.rtkrcv_instance) {
						application.rtkrcv_instance.stop();
						application.rtkrcv_instance = null;
						const rtkrcv_configuration = await fs.deserialize_file<IRTKRCVConfig>(config.rtkrcv_config);

						await fs.serialize_file<IRTKRCVConfig>(config.rtkrcv_config, rtkrcv_configuration);

						if (application.rtkrcv_log_monitor) {
							application.rtkrcv_log_monitor.close();
							application.rtkrcv_log_monitor = null;
						}

						if (application.rtkrcv_instance_monitor) {
							application.rtkrcv_instance_monitor.stop();
							application.rtkrcv_instance_monitor = null;
						}

						if (application.rtkrcv_instance_accessor) {
							application.rtkrcv_instance_accessor.stop();
							application.rtkrcv_instance_accessor = null;
						}

					}

					break;
				case "status":
					const rtkrcv_config = await fs.deserialize_file<IRTKRCVConfig>(config.rtkrcv_config);
					response.isActive = application.rtkrcv_instance && application.rtkrcv_instance.status();
					response.isEnabled = rtkrcv_config.enabled;
					break;
				case "enable": {
					const rtkrcv_configuration = await fs.deserialize_file<IRTKRCVConfig>(config.rtkrcv_config);
					rtkrcv_configuration.enabled = true;
					await fs.serialize_file<IRTKRCVConfig>(config.rtkrcv_config, rtkrcv_configuration);
				}              break;
				case "disable": {
					const rtkrcv_configuration = await fs.deserialize_file<IRTKRCVConfig>(config.rtkrcv_config);
					rtkrcv_configuration.enabled = false;
					await fs.serialize_file<IRTKRCVConfig>(config.rtkrcv_config, rtkrcv_configuration);
				}
				default:
					log.error("command type unrecognized", commandType);
					return res.status(500).send("command type unrecognized");
			}
		} catch (e) {
			log.error("error", configType, commandType, e);
			error = e;
		}
		response.stdout = (application.rtkrcv_instance) ? application.rtkrcv_instance.getStdout() : null;
		response.stderr = (application.rtkrcv_instance) ? application.rtkrcv_instance.getStderr() : null;
		response.error = error;

		if (application.rtkrcv_instance == null || (!application.rtkrcv_instance.status())) {
			application.rtkrcv_instance = null;
		}

		log.debug("POST /control result", response);
		return res.send(response);
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
