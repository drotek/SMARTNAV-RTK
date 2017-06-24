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

import express = require("express");
import bodyParser = require("body-parser");

import * as logger from "./utilities/logger";
const log = logger.getLogger("config_files");

import http = require("http");

import * as file_monitor from "./utilities/file_monitor";
import * as rtkrcv from "./utilities/rtkrcv";

import * as rtkrcv_accessor from "./utilities/rtkrcv_accessor";
import * as rtkrcv_monitor from "./utilities/rtkrcv_monitor";

import events = require("events");

import * as rtkrcv_config from "./models/rtkrcv_config";

export class Application {
	public app: express.Express;
	public server: http.Server;
	public rtkrcv_instance: rtkrcv.rtkrcv;
	public rtkrcv_log_monitor: file_monitor.FileMonitor;
	public rtkrcv_instance_monitor: rtkrcv_monitor.RTKRCV_Monitor;
	public rtkrcv_instance_accessor: rtkrcv_accessor.RTKRCV_Client;
	public last_position: rtkrcv_monitor.IPosition;
	public monitor_events: events.EventEmitter;

	constructor() {
		this.app = express();

		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: true }));

		const allowCrossDomain = (req: express.Request, res: express.Response, next: express.NextFunction) => {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
			res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

			// intercept OPTIONS method
			if ("OPTIONS" === req.method) {
				res.sendStatus(200);
			} else {
				next();
			}
		};
		this.app.use(allowCrossDomain);

		this.rtkrcv_instance = null;
		this.rtkrcv_log_monitor = null;
		this.monitor_events = new events.EventEmitter();

		this.server = this.app.listen(3002, () => {
			log.info("Listening on port %s...", this.server.address().port);
		});
	}

	public async start() {
		const config = await rtkrcv_config.get_configuration();
		if (config.enabled) {
			await rtkrcv_config.control(this, "start");
		}
	}
}
