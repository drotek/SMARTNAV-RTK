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
const log = logger.getLogger("log_files");

export default function logFilesReader(app: express.Express) {

	function endsWith(str: string, suffix: string) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

	async function getListFile(directory: string, listExtensions: string[]) {
		const toReturn = {
			listFiles: [] as string[]
		};

		const files = await fs.readdir(directory);
		const nbFile = files.length;

		const nbExtension = listExtensions.length;

		for (let i = 0; i < nbFile; i++) {
			const currentLogFile = files[i];

			let isOk = false;

			for (let j = 0; j < nbExtension && !isOk; j++) {
				isOk = endsWith(currentLogFile, listExtensions[j]);
			}

			if (isOk) {
				toReturn.listFiles.push(currentLogFile);
			}

		}

		return toReturn;
	}

	app.get("/listLogFiles", async (req, res) => {
		log.info("GET /listLogFiles");
		res.setHeader("Access-Control-Allow-Origin", "*");
		const listeLogs = await getListFile(config.logFilesPath, [".stat", ".trace"]);
		res.send(listeLogs);
	});

	app.get("/listUbxFiles", (req, res) => {
		log.info("GET /listUbxFiles");
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.send(getListFile(config.logFilesPath, [".ubx"]));
	});

	app.post("/logFile", async (req, res) => {
		log.info("POST /logFile", req.body);
		res.setHeader("Access-Control-Allow-Origin", "*");

		if (req.body.name) {
			const fileName = req.body.name;

			try {
				await fs.access(path.join(config.logFilesPath, fileName), fs.constants.F_OK);

				res.setHeader("content-type", "plain/text");
				fs.createReadStream(path.join(config.logFilesPath, fileName)).pipe(res);
			} catch (e) {
				res.status(500).send("unable to save log");
			}
		}
	});

	app.post("/ubxFile", async (req, res) => {
		log.info("POST /ubxFile", req.body);
		res.setHeader("Access-Control-Allow-Origin", "*");

		if (req.body.name) {
			const fileName: string = req.body.name;

			try {
				await fs.access(path.join(config.logFilesPath, fileName), fs.constants.F_OK);
				res.setHeader("content-type", "application/octet-stream");
				res.sendFile(fileName, { root: config.logFilesPath });
			} catch (e) {
				res.status(500).send("unable to save ubx file");
			}
		}
	});

	app.get("/baseSatellites", async (req, res) => {
		log.info("GET /baseSatellites");
		res.setHeader("Access-Control-Allow-Origin", "*");

		const ubxFiles = await getListFile(config.dataFilesPath, [".ubx"]);
		const nbFile = ubxFiles.listFiles.length;

		if (nbFile > 0) {
			const fileName = ubxFiles.listFiles[0];
			const data = await fs.readFile(path.join(config.dataFilesPath, fileName));

			const buffer = data;
			const bufferSize = data.length;

			const listSatData = [];

			// 0xB5 0x62 0x02 0x15
			// 181  98   2    21
			/*for(var i=0; i<bufferSize-5; i++){
				if(buffer[i] === 181){
					if(buffer[i+1] === 98){
						if(buffer[i+2] === 2){
							if(buffer[i+3] === 21){
								var lenght = buffer[i+5].toString(16) + '' + buffer[i+4].toString(16);
								lenght = parseInt(lenght,16);
								var numMeas = (lenght -16)/32;
								console.log('numMeas --> ' + numMeas);

								i = i+6;

								console.log('numMeas --> ' + buffer[i+11]);

								var currentLoopSats = [];
								for(var j=0; j<numMeas; j++){
									var offset = 42 + 32*j;
									var cno = buffer[i+offset];
									offset = 36 + 32*j;
									var gnssId = buffer[i+offset];
									offset = 37 + 32*j;
									var svId = buffer[i+offset];

									currentLoopSats.push(buildSatData(gnssId,svId,cno));
								}

								listSatData.push(currentLoopSats);

							}
						}
					}
				}
			}*/

			let firstOccurSkipped = false;

			// 0xB5 0x62 0x02 0x15
			// 181  98   2    21
			for (let i = bufferSize - 5; 0 <= i && listSatData.length === 0; i--) {
				if (buffer[i] === 21) {
					if (buffer[i - 1] === 2) {
						if (buffer[i - 2] === 98) {
							if (buffer[i - 3] === 181) {
								if (firstOccurSkipped) {
									const bufferlength = buffer[i + 2].toString(16) + "" + buffer[i + 1].toString(16);
									const length = parseInt(bufferlength, 16);
									const numMeas = (length - 16) / 32;

									i = i + 3;

									for (let j = 0; j < numMeas; j++) {
										let offset = 42 + 32 * j;
										const cno = buffer[i + offset];
										offset = 36 + 32 * j;
										const gnssId = buffer[i + offset];
										offset = 37 + 32 * j;
										const svId = buffer[i + offset];

										listSatData.push(buildSatData(gnssId, svId, cno));
									}
								} else {
									firstOccurSkipped = true;
								}
							}
						}
					}
				}
			}

			res.send({
				name: fileName,
				listSatData
			});
			return;
		}

		res.send(null);
	});

	function buildSatData(gnssId: number, svId: number, cno: number) {
		const dataToReturn = {
			name: "gnssId:" + gnssId + ", svId:" + svId,
			type: "unknown",
			gnssId,
			svId,
			cno
		};

		switch (gnssId) {
			case 0:
				if (1 <= svId && svId <= 32) {
					dataToReturn.type = "GPS";
					dataToReturn.name = "G";
					if (svId < 10) {
						dataToReturn.name = dataToReturn.name + "0";
					}
					dataToReturn.name = dataToReturn.name + svId;
				}
				break;
			case 1:
				if (120 <= svId && svId <= 158) {
					dataToReturn.type = "SBAS";
					dataToReturn.name = "S" + svId;
				}
				break;
			case 2:
				if (1 <= svId && svId <= 36) {
					dataToReturn.type = "Galileo";
					dataToReturn.name = "E";
					if (svId < 10) {
						dataToReturn.name = dataToReturn.name + "0";
					}
					dataToReturn.name = dataToReturn.name + svId;
				}
				break;
			case 3:
				if (1 <= svId && svId <= 37) {
					dataToReturn.type = "BeiDou";
					dataToReturn.name = "B";
					if (svId < 10) {
						dataToReturn.name = dataToReturn.name + "0";
					}
					dataToReturn.name = dataToReturn.name + svId;
				}
				break;
			case 4:
				if (1 <= svId && svId <= 10) {
					dataToReturn.type = "IMES";
					dataToReturn.name = "I";
					if (svId < 10) {
						dataToReturn.name = dataToReturn.name + "0";
					}
					dataToReturn.name = dataToReturn.name + svId;
				}
				break;
			case 5:
				if (1 <= svId && svId <= 5) {
					dataToReturn.type = "QZSS";
					dataToReturn.name = "Q0" + svId;
				}
				break;
			case 6:
				if (1 <= svId && svId <= 32) {
					dataToReturn.type = "GLONASS";
					dataToReturn.name = "R";
					if (svId < 10) {
						dataToReturn.name = dataToReturn.name + "0";
					}
					dataToReturn.name = dataToReturn.name + svId;
				} else if (svId === 255) {
					dataToReturn.name = "R?";
				}
				break;
			default:
				break;
		}
		return dataToReturn;
	}

}
