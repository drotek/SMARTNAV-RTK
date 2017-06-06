/*
 * RTKLIB WEB CONSOLE code is placed under the GPL license.
 * Written by Frederic BECQUIER (frederic.becquier@openiteam.fr)
 * Copyright (c) 2016, DROTEK SAS
 * All rights reserved.

 * If you are interested in using RTKLIB WEB CONSOLE code as a part of a
 * closed source project, please contact DROTEK SAS (contact@drotek.com).

 * This file is part of RTKLIB WEB CONSOLE.

 * RTKLIB WEB CONSOLE is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * RTKLIB WEB CONSOLE is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with RTKLIB WEB CONSOLE. If not, see <http://www.gnu.org/licenses/>.
 */

// import fs = require("fs");
import * as fs from "../utilities/fs_wrapper";
import express = require("express");
import child_process = require("child_process");
const exec = child_process.exec;
import * as config from "../config";

import * as serial from "../utilities/serial";

import * as logger from "../utilities/logger";
const log = logger.getLogger("admin");

import * as rtkrcv from "../utilities/rtkrcv";
import * as str2str from "../utilities/str2str";

let rtkrcv_instance: rtkrcv.rtkrcv = null;
let str2str_instance: str2str.str2str = null;

import { execution_manager } from "../utilities/execution_manager";

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

export default function adminModule(app: express.Express) {

	// const serviceCommands: IServiceCommands = {
	// 	start: config.serviceController + " start ",
	// 	stop: config.serviceController + " stop ",
	// 	status: config.serviceController + " status ",
	// 	enable: config.serviceController + " enable ",
	// 	disable: config.serviceController + " disable "
	// };

	app.post("/service", async (req, res) => {
		log.info("POST /service", req.body);
		res.setHeader("Access-Control-Allow-Origin", "*");

		const commandType: string = req.body.commandType;
		const configType: string = req.body.configType;

		const response: IModuleResponse = {};

		let error: Error = null;

		switch (configType) {
			case "ROVER":
				try {
					switch (commandType) {
						case "start":
							if (!rtkrcv_instance) {
								if (!await fs.exists(config.rtkrcv_config)) {
									throw new Error("rtkrcv configuration is missing: " + config.rtkrcv_config);
								}
								let rtkrcv_configuration = await fs.deserialize_file<rtkrcv.IRTKRCVConfig>(config.rtkrcv_config);
								rtkrcv_instance = new rtkrcv.rtkrcv(rtkrcv_configuration);
								rtkrcv_instance.start();
								rtkrcv_configuration.enabled = true;
								await fs.serialize_file<rtkrcv.IRTKRCVConfig>(config.rtkrcv_config, rtkrcv_configuration);
							} else {
								throw new Error("can't start an already stated service");
							}
							break;
						case "stop":
							if (rtkrcv_instance) {
								rtkrcv_instance.stop();
								rtkrcv_instance = null;
								let rtkrcv_configuration = await fs.deserialize_file<rtkrcv.IRTKRCVConfig>(config.rtkrcv_config);
								rtkrcv_configuration.enabled = false;
								await fs.serialize_file<rtkrcv.IRTKRCVConfig>(config.rtkrcv_config, rtkrcv_configuration);
							}
							break;
						case "status":
							let rtkrcv_config = await fs.deserialize_file<rtkrcv.IRTKRCVConfig>(config.rtkrcv_config);
							response.isActive = rtkrcv_instance && rtkrcv_instance.status();
							response.isEnabled = rtkrcv_config.enabled;
							break;
						case "enable": {
							let rtkrcv_configuration = await fs.deserialize_file<rtkrcv.IRTKRCVConfig>(config.rtkrcv_config);
							rtkrcv_configuration.enabled = true;
							await fs.serialize_file<rtkrcv.IRTKRCVConfig>(config.rtkrcv_config, rtkrcv_configuration);
						}
							break;
						case "disable": {
							let rtkrcv_configuration = await fs.deserialize_file<rtkrcv.IRTKRCVConfig>(config.rtkrcv_config);
							rtkrcv_configuration.enabled = false;
							await fs.serialize_file<rtkrcv.IRTKRCVConfig>(config.rtkrcv_config, rtkrcv_configuration);
						}
					}
				} catch (e) {
					log.error("error",configType, commandType, e);
					error = e;
				}
				response.stdout = (rtkrcv_instance) ? rtkrcv_instance.stdout() : null;
				response.stderr = (rtkrcv_instance) ? rtkrcv_instance.stderr() : null;
				response.error = error;

				break;
			case "BASE":
				try {
					switch (commandType) {
						case "start":
							if (!str2str_instance) {
								if (!await fs.exists(config.str2str_config)) {
									throw new Error("str2str configuration is missing: " + config.str2str_config);
								}
								let str2str_configuration = await fs.deserialize_file<str2str.ISTR2STRConfig>(config.str2str_config);
								str2str_instance = new str2str.str2str(str2str_configuration);
								str2str_instance.start();
								str2str_configuration.enabled = true;
								await fs.serialize_file<str2str.ISTR2STRConfig>(config.str2str_config, str2str_configuration);
							} else {
								throw new Error("can't start an already stated service");
							}
							break;
						case "stop":
							if (str2str_instance) {
								str2str_instance.stop();
								str2str_instance = null;
								let str2str_configuration = await fs.deserialize_file<str2str.ISTR2STRConfig>(config.str2str_config);
								str2str_configuration.enabled = false;
								await fs.serialize_file<str2str.ISTR2STRConfig>(config.str2str_config, str2str_configuration);
							}
							break;
						case "status": {
							let str2str_configuration = await fs.deserialize_file<str2str.ISTR2STRConfig>(config.str2str_config);
							response.isActive = str2str_instance && str2str_instance.status();
							response.isEnabled = str2str_configuration.enabled;
						}
							break;
						case "enable": {
							let str2str_configuration = await fs.deserialize_file<str2str.ISTR2STRConfig>(config.str2str_config);
							str2str_configuration.enabled = true;
							await fs.serialize_file<str2str.ISTR2STRConfig>(config.str2str_config, str2str_configuration);
						}
							break;
						case "disable": {
							let str2str_configuration = await fs.deserialize_file<str2str.ISTR2STRConfig>(config.str2str_config);
							str2str_configuration.enabled = false;
							await fs.serialize_file<str2str.ISTR2STRConfig>(config.str2str_config, str2str_configuration);
						}
					}
				} catch (e) {
					log.error("error",configType, commandType, e);
					error = e;
				}
				response.stdout = (str2str_instance) ? str2str_instance.stdout() : null;
				response.stderr = (str2str_instance) ? str2str_instance.stderr() : null;
				response.error = error;

				break;
		}
		return res.send(response);

		// 	let commandToExecute = serviceCommands[commandType];

		// if (commandToExecute) {

		// 	if (configType === "ROVER") {
		// 		commandToExecute = commandToExecute + config.serviceRoverName;
		// 	} else if (configType === "BASE") {
		// 		commandToExecute = commandToExecute + config.serviceBaseName;
		// 	}

		// 	console.log(commandToExecute);
		// 	exec(commandToExecute, (error, stdout, stderr) => {

		// 		const response: IModuleResponse = {};

		// 		if (error) {
		// 			response.error = error;
		// 		}

		// 		if (stdout) {
		// 			response.stdout = stdout;
		// 		}

		// 		if (stderr) {
		// 			response.stderr = stderr;
		// 		}

		// 		if (commandType === "status") {
		// 			response.isActive = stdout.indexOf("active (running)") > -1;
		// 			response.isEnabled = stdout.indexOf("enabled") > -1;
		// 		}

		// 		if ((commandType === "enable" || commandType === "disable")) {

		// 			console.log(config.serviceController + " daemon-reload ");
		// 			exec(config.serviceController + " daemon-reload ", (error2, stdout2, stderr2) => {

		// 				let response_: IModuleResponse;
		// 				response_ = {};

		// 				if (error2) {
		// 					response_.error = error2;
		// 				}

		// 				if (stdout2) {
		// 					response_.stdout = stdout2;
		// 				}

		// 				if (stderr2) {
		// 					response_.stderr = stderr2;
		// 				}

		// 				return res.send(response_);

		// 			});

		// 		} else {
		// 			return res.send(response);
		// 		}

		// 	});
		// } else {
		// 		return res.send({
		// 			error: "Command not found"
		// 		});
		// 	};
	});

	app.get("/updatePlatform", (req, res) => {
		log.info("GET /updatePlatform");
		res.setHeader("Access-Control-Allow-Origin", "*");
		execComandLine(res, config.updateCommandLine);

	});

	app.get("/syncTime", (req, res) => {
		log.info("GET /syncTime");
		res.setHeader("Access-Control-Allow-Origin", "*");
		execComandLine(res, config.timeSyncCommandLine);

	});

	app.get("/listPorts", async (req, res) => {
		const ports = await serial.list();
		res.send(ports);
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
