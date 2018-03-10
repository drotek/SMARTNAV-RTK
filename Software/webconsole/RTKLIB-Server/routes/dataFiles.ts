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
import * as config from "../config";
import path = require("path");

import * as logger from "../utilities/logger";
const log = logger.getLogger("data_files");

import * as rtkrcv_service from "../services/rtkrcv_service";

export default function dataFilesReader(app: express.Express) {

	app.get("/positions", async (req, res) => {
		log.info("GET /positions");

		try {
			const last_position = await rtkrcv_service.getLastPosition();
			log.debug("GET /positions result", last_position);
			res.json(last_position);
		} catch (e) {
			log.error("unable to get last position", e);
			res.status(500).send("unable to get last position");
		}
	});

}
