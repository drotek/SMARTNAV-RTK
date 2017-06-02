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

import fs = require("fs");
import express = require("express");
import child_process = require("child_process");
const exec = child_process.exec;
import * as config from "../config";

import * as logger from "../logger";
const log = logger.getLogger("admin");

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

	const serviceCommands: IServiceCommands = {
		start: config.serviceController + " start ",
		stop: config.serviceController + " stop ",
		status: config.serviceController + " status ",
		enable: config.serviceController + " enable ",
		disable: config.serviceController + " disable "
	};

	app.post("/service",  (req, res) => {
		log.info("POST /service", req.body);
		res.setHeader("Access-Control-Allow-Origin", "*");

		const commandType: string = req.body.commandType;
		const configType: string = req.body.configType;
		let commandToExecute = serviceCommands[commandType];

		if (commandToExecute) {

			if (configType === "ROVER") {
				commandToExecute = commandToExecute + config.serviceRoverName;
			} else if (configType === "BASE") {
				commandToExecute = commandToExecute + config.serviceBaseName;
			}

			console.log(commandToExecute);
			exec(commandToExecute, (error, stdout, stderr) => {

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

				if (commandType === "status") {
					response.isActive = stdout.indexOf("active (running)") > -1;
					response.isEnabled = stdout.indexOf("enabled") > -1;
				}

				if ((commandType === "enable" || commandType === "disable")) {

					console.log(config.serviceController + " daemon-reload ");
					exec(config.serviceController + " daemon-reload ", (error2, stdout2, stderr2) => {

						let response_: IModuleResponse;
						response_ = {};

						if (error2) {
							response_.error = error2;
						}

						if (stdout2) {
							response_.stdout = stdout2;
						}

						if (stderr2) {
							response_.stderr = stderr2;
						}

						return res.send(response_);

					});

				} else {
					return res.send(response);
				}

			});
		} else {
			return res.send({
				error: "Command not found"
			});
		}
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
