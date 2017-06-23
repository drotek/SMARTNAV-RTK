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

import { execution_manager } from "../utilities/execution_manager";

import * as rtkrcv_service from "../services/rtkrcv_service";
import * as str2str_service from "../services/str2str_service";

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
					const result = await rtkrcv_service.control(commandType);
					log.debug("POST /service results", result);
					res.json(result);
				} catch (e) {
					log.error("error", configType, commandType, e);
					error = e;
				}
				break;
			case "BASE":
				try {
					const result = await str2str_service.control(commandType);
					log.debug("POST /service results", result);
					res.json(result);
				} catch (e) {
					log.error("error", configType, commandType, e);
					error = e;
				}

				break;
		}

		// response.stdout = (str2str_instance) ? str2str_instance.stdout() : null;
		// response.stderr = (str2str_instance) ? str2str_instance.stderr() : null;
		// response.error = error;
		// return res.send(response);
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
