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
import * as config from "../config";
import path = require("path");

import * as logger from "../utilities/logger";
const log = logger.getLogger("config_files");

interface IParams {
	[id: string]: string[];
}

interface IParamUnit {
	[id: string]: string;
}

interface IParamComment {
	[id: string]: string;
}

interface IParameter {
	key: string;
	value?: string | number;
	unit?: string;
	comment?: string;
	restriction?: string[];
}
interface IParamResponse {
	name: string;
	requiredParameters: IParameter[];
	advancedParameters: IParameter[];
	otherParameters: IParameter[];
	cmdParameters: IParameter[];
}

export default function configFileEditor(app: express.Express) {

	const requireParams: IParams = {
		"pos1-posmode": ["single", "dgps", "kinematic", "static", "movingbase", "fixed", "ppp-kine", "ppp-static"],
		"ant2-postype": ["llh", "xyz", "single", "posfile", "rinexhead", "rtcm"],
		"ant2-pos1": [],
		"ant2-pos2": [],
		"ant2-pos3": [],
		"inpstr2-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripcli", "ftp", "http"],
		"inpstr2-path": [],
		"inpstr2-format": ["rtcm2", "rtcm3", "oem4", "oem3", "ubx", "ss2", "hemis", "skytraq", "gw10", "javad", "sp3"],
		"outstr1-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripcli"],
		"outstr2-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripcli"],
		"outstr1-path": [],
		"outstr2-path": [],
		"outstr1-format": ["llh", "xyz", "enu", "nmea", "ubx", "base"],
		"outstr2-format": ["llh", "xyz", "enu", "nmea", "ubx", "base"]
	};

	const advancedParams: IParams = {
		"pos1-elmask": [],
		"pos1-snrmask_r": ["off", "on"],
		"pos1-snrmask_b": ["off", "on"],
		"pos1-snrmask_L1": [],
		"pos1-dynamics": ["off", "on"],
		"pos1-tidecorr": ["off", "on"],
		"pos1-ionoopt": ["off", "brdc", "sbas", "dual-freq", "est-stec", "ionex-tec", "qzs-brdc", "qzs-lex", "vtec_sf", "vtec_ef", "gtec"],
		"pos1-tropopt": ["off", "saas", "sbas", "est-ztd", "est-ztdgrad"],
		"pos1-sateph": ["brdc", "precise", "brdc+sbas", "brdc+ssrapc", "brdc+ssrcom"],
		"pos1-exclsats": [],
		"pos1-navsys": [], // 'gps','sbas','glo','gal','qzs','comp'
		"pos2-armode": ["off", "continuous", "instantaneous", "fix-and-hold"],
		"pos2-gloarmode": ["off", "on", "autocal"]
	};

	const otherParams: IParams = {
		"pos1-frequency": ["l1", "l1+l2", "l1+l2+l5"],
		"pos1-soltype": ["forward", "backward", "combined"],
		"pos1-snrmask_L2": [],
		"pos1-snrmask_L5": [],
		"pos1-posopt1": ["off", "on"],
		"pos1-posopt2": ["off", "on"],
		"pos1-posopt3": ["off", "on"],
		"pos1-posopt4": ["off", "on"],
		"pos1-posopt5": ["off", "on"],
		"pos2-arthres": [],
		"pos2-arlockcnt": [],
		"pos2-arelmask": [],
		"pos2-arminfix": [],
		"pos2-elmaskhold": [],
		"pos2-aroutcnt": [],
		"pos2-maxage": [],
		"pos2-slipthres": [],
		"pos2-rejionno": [],
		"pos2-rejgdop": [],
		"pos2-niter": [],
		"pos2-baselen": [],
		"pos2-basesig": [],
		"out-solformat": ["llh", "xyz", "enu", "nmea", "ubx", "base"],
		"out-outhead": ["off", "on"],
		"out-outopt": ["off", "on"],
		"out-timesys": ["gpst", "utc", "jst"],
		"out-timeform": ["tow", "hms"],
		"out-timendec": [],
		"out-degform": ["deg", "dms"],
		"out-fieldsep": [],
		"out-height": ["ellipsoidal", "geodetic"],
		"out-geoid": ["internal", "egm96", "egm08_2.5", "egm08_1", "gsi2000"],
		"out-solstatic": ["all", "single"],
		"out-nmeaintv1": [],
		"out-nmeaintv2": [],
		"out-outstat": ["off", "state", "residual"],
		"stats-eratio1": [],
		"stats-eratio2": [],
		"stats-errphase": [],
		"stats-errphaseel": [],
		"stats-errphasebl": [],
		"stats-errdoppler": [],
		"stats-stdbias": [],
		"stats-stdiono": [],
		"stats-stdtrop": [],
		"stats-prnaccelh": [],
		"stats-prnaccelv": [],
		"stats-prnbias": [],
		"stats-prniono": [],
		"stats-prntrop": [],
		"stats-clkstab": [],
		"ant1-postype": ["llh", "xyz", "single", "posfile", "rinexhead", "rtcm"],
		"ant1-pos1": [],
		"ant1-pos2": [],
		"ant1-pos3": [],
		"ant1-anttype": [],
		"ant1-antdele": [],
		"ant1-antdeln": [],
		"ant1-antdelu": [],
		"ant2-anttype": [],
		"ant2-antdele": [],
		"ant2-antdeln": [],
		"ant2-antdelu": [],
		"misc-timeinterp": ["off", "on"],
		"misc-sbasatsel": ["all"], // Warning '0' in initial config file
		"misc-rnxopt1": [],
		"misc-rnxopt2": [],
		"file-satantfile": [],
		"file-rcvantfile": [],
		"file-staposfile": [],
		"file-geoidfile": [],
		"file-ionofile": [],
		"file-dcbfile": [],
		"file-eopfile": [],
		"file-blqfile": [],
		"file-tempdir": [],
		"file-geexefile": [],
		"file-solstatfile": [],
		"file-tracefile": [],
		"inpstr1-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripcli", "ftp", "http"],
		"inpstr3-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripcli", "ftp", "http"],
		"inpstr1-path": [],
		"inpstr3-path": [],
		"inpstr1-format": ["rtcm2", "rtcm3", "oem4", "oem3", "ubx", "ss2", "hemis", "skytraq", "gw10", "javad", "sp3"],
		"inpstr3-format": ["rtcm2", "rtcm3", "oem4", "oem3", "ubx", "ss2", "hemis", "skytraq", "gw10", "javad", "sp3"],
		"inpstr2-nmeareq": ["off", "latlon", "single"],
		"inpstr2-nmealat": [],
		"inpstr2-nmealon": [],
		"logstr1-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripsvr"],
		"logstr2-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripsvr"],
		"logstr3-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripsvr"],
		"logstr1-path": [],
		"logstr2-path": [],
		"logstr3-path": [],
		"misc-svrcycle": [],
		"misc-timeout": [],
		"misc-reconnect": [],
		"misc-nmeacycle": [],
		"misc-buffsize": [],
		"misc-navmsgsel": ["all", "rover", "base", "corr"],
		"misc-proxyaddr": [],
		"misc-fswapmargin": [],
		"file-cmdfile1": []
	};

	const paramUnit: IParamUnit = {
		"pos1-elmask": "deg",
		"pos2-arelmask": "deg",
		"pos2-elmaskhold": "deg",
		"pos2-maxage": "s",
		"pos2-slipthres": "m",
		"pos2-rejionno": "m",
		"pos2-baselen": "m",
		"pos2-basesig": "m",
		"out-nmeaintv1": "s",
		"out-nmeaintv2": "s",
		"stats-errphase": "m",
		"stats-errphaseel": "m",
		"stats-errphasebl": "m/10km",
		"stats-errdoppler": "Hz",
		"stats-stdbias": "m",
		"stats-stdiono": "m",
		"stats-stdtrop": "m",
		"stats-prnaccelh": "m/s^2",
		"stats-prnaccelv": "m/s^2",
		"stats-prnbias": "m",
		"stats-prniono": "m",
		"stats-prntrop": "m",
		"stats-clkstab": "s/s",
		"ant1-pos1": "deg|m",
		"ant1-pos2": "deg|m",
		"ant1-pos3": "m|m",
		"ant1-antdele": "m",
		"ant1-antdeln": "m",
		"ant1-antdelu": "m",
		"ant2-pos1": "deg|m",
		"ant2-pos2": "deg|m",
		"ant2-pos3": "m|m",
		"ant2-antdele": "m",
		"ant2-antdeln": "m",
		"ant2-antdelu": "m",
		"inpstr2-nmealat": "deg",
		"inpstr2-nmealon": "deg",
		"misc-svrcycle": "ms",
		"misc-timeout": "ms",
		"misc-reconnect": "ms",
		"misc-nmeacycle": "ms",
		"misc-buffsize": "bytes",
		"misc-fswapmargin": "s"
	};

	const paramComment: IParamComment = {
		"pos1-dynamics": "on to estimate the vel and acc of vehicle using std-dev values, more fix values?",
		"pos1-tidecorr": "on to consider solid earthtide corrections",
		"pos1-posopt1": "satellite PCV variation file",
		"pos1-posopt2": "Receiver PCV variation file",
		"pos1-posopt3": "Phase windup PPP",
		"pos1-posopt4": "PPP",
		"pos1-posopt5": "Ublox M8T supports RAIM FDE",
		"pos1-exclsats": "prn ...",
		"pos2-armode": "continuous is good for kinematic",
		"pos2-arthres": 'value "2" has false positive rate of 3/600',
		"pos2-arlockcnt": "carrier lock count changes quickly",
		"pos2-arminfix": "for fix-and-hold",
		"pos2-elmaskhold": "for fix-and-hold",
		"pos2-niter": "useful when baseline < 1m",
		"pos2-baselen": "for moving base mode",
		"pos2-basesig": "for moving base mode",
		"out-solstatic": "for rtkpost",
		"file-dcbfile": "for dual frequency receivers",
		"inpstr1-path": "rover",
		"inpstr2-path": "base"
	};

	function endsWith(str: string, suffix: string) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

	app.get("/listConfigFile", (req, res) => {
		log.info("GET /listConfigFile");
		res.setHeader("Access-Control-Allow-Origin", "*");

		const toReturn = {
			listConfigFiles: [] as string[]
		};

		const files = fs.readdirSync(config.configFilesPath);
		const nbFile = files.length;

		for (let i = 0; i < nbFile; i++) {
			const currentConfigFile = files[i];

			if (currentConfigFile.indexOf(config.configFiles["current_conf"]) > -1 ||
				endsWith(currentConfigFile, config.configFiles.user_extension) ||
				endsWith(currentConfigFile, config.configFiles.drotek_extension)) {
				toReturn.listConfigFiles.push(currentConfigFile);
			}
		}

		res.send(toReturn);

	});

	app.get("/configFile", (req, res) => {
		log.info("GET /configFile");
		res.setHeader("Access-Control-Allow-Origin", "*");

		let fileName = config.configFiles["current_conf"];
		if (req.query.name) {
			fileName = req.query.name;
		}

		fs.readFile(path.join(config.configFilesPath , fileName), "utf-8", function read(err, data) {
			if (err) {
				throw err;
			}

			const lines = data.split("\n");
			const nbLines = lines.length;

			const requiredParameters: IParameter[] = [];
			const advancedParameters: IParameter[] = [];
			const otherParameters: IParameter[] = [];
			const cmdParameters: IParameter[] = [];

			let pathCmd: string;
			let pathCmdKey: string;
			let pathCmdValue: string;

			for (let i = 0; i < nbLines; i++) {
				let currentLine = lines[i];
				currentLine = currentLine.replace(/\s/g, "");

				if (currentLine !== "" && currentLine.indexOf("=") > -1) {
					const lineComponents = currentLine.split("=");
					const key = lineComponents[0];
					let value = lineComponents[1];

					if (value.indexOf("#") > -1) {
						value = value.split("#")[0];
					}

					if (key === "file-cmdfile1") {
						pathCmd = value;
					}

					pathCmdKey = key;
					pathCmdValue = value;

					const currentParam: IParameter = {
						key,
						value,
						unit: paramUnit[key],
						comment: paramComment[key]
					};

					if (requireParams[key]) {
						currentParam.restriction = requireParams[key];
						requiredParameters.push(currentParam);
					} else if (advancedParams[key]) {
						currentParam.restriction = advancedParams[key];
						advancedParameters.push(currentParam);
					} else {
						currentParam.restriction = otherParams[key];
						otherParameters.push(currentParam);
					}
				}
			}

			if (pathCmd) {
				fs.readFile(pathCmd, "utf-8", function read(errCmd, dataCmd) {
					if (errCmd) {
						throw errCmd;
					}

					const linesCmd = dataCmd.split("\n");
					const nbLinesCmd = linesCmd.length;

					for (let j = 0; j < nbLinesCmd; j++) {
						const currentCmdLine = linesCmd[j];

						if (currentCmdLine.substring(0, 1) !== "#") {
							const cmdLineComponents = currentCmdLine.split(" ");

							if (cmdLineComponents.length > 0) {
								const currentCmdType = cmdLineComponents[1];

								const currentParam: IParameter = {
									key: currentCmdType,
									value: pathCmdValue,
									unit: paramUnit[pathCmdKey],
									comment: paramComment[pathCmdKey]
								};

								if (currentCmdType === "CFG-RATE") {
									currentParam.value = 1000 / parseInt(cmdLineComponents[2]);
									currentParam.unit = "Hz";
									currentParam.comment = "Frequency";
									cmdParameters.push(currentParam);
								} else if (currentCmdType === "CFG-PRT") {
									currentParam.value = cmdLineComponents[6];
									currentParam.unit = "";
									currentParam.comment = "Baud Rate";
									cmdParameters.push(currentParam);
								}
							}
						}
					}

					const response: IParamResponse = {
						name: fileName,
						requiredParameters,
						advancedParameters,
						otherParameters,
						cmdParameters
					};

					res.send(response);

				});
			} else {
				res.send({
					name: fileName,
					requiredParameters,
					advancedParameters,
					otherParameters,
					cmdParameters
				});
			}

		});

	});

	app.get("/baseCMD", (req, res) => {
		log.info("GET /baseCMD");
		fs.readFile(path.join(config.configFilesPath , config.configFiles.base_cmd), "utf-8", function read(errCmd, dataCmd) {
			if (errCmd) {
				throw errCmd;
			}

			const linesCmd = dataCmd.split("\n");
			const nbLinesCmd = linesCmd.length;

			const cmdParameters = [];

			for (let j = 0; j < nbLinesCmd; j++) {
				const currentCmdLine = linesCmd[j];

				if (currentCmdLine.substring(0, 1) !== "#") {
					const cmdLineComponents = currentCmdLine.split(" ");

					if (cmdLineComponents.length > 0) {
						const currentCmdType = cmdLineComponents[1];

						const currentParam: IParameter = {
							key: currentCmdType
						};

						if (currentCmdType === "CFG-RATE") {
							currentParam.value = 1000 / parseInt(cmdLineComponents[2]);
							currentParam.unit = "Hz";
							currentParam.comment = "Frequency";
							cmdParameters.push(currentParam);
						} else if (currentCmdType === "CFG-PRT") {
							currentParam.value = cmdLineComponents[6];
							currentParam.unit = "";
							currentParam.comment = "Baud Rate";
							cmdParameters.push(currentParam);
						}
					}
				}
			}

			res.send({
				name: config.configFiles.base_cmd,
				requiredParameters: [],
				advancedParameters: [],
				otherParameters: [],
				cmdParameters
			});

		});
	});

	app.get("/basePosition", (req, res) => {
		log.info("GET /basePosition");
		res.setHeader("Access-Control-Allow-Origin", "*");

		fs.readFile(path.join(config.configFilesPath , config.configFiles["current_conf"]), "utf-8", function read(err, data) {
			if (err) {
				throw err;
			}

			let pos1;
			let pos2;
			let pos3;
			let postype;

			const lines = data.split("\n");
			const nbLines = lines.length;

			let i = 0;
			while (i < nbLines && (!pos1 || !pos2 || !pos3 || !postype)) {
				let currentLine = lines[i];

				currentLine = currentLine.replace(/\s/g, "");

				if (currentLine !== "" && currentLine.substring(0, 1) !== "#" && currentLine.indexOf("=") > -1) {
					const lineComponents = currentLine.split("=");
					const key = lineComponents[0];

					switch (key) {
						case "ant2-pos1":
							pos1 = getValue(lineComponents[1]);
							break;
						case "ant2-pos2":
							pos2 = getValue(lineComponents[1]);
							break;
						case "ant2-pos3":
							pos3 = getValue(lineComponents[1]);
							break;
						case "ant2-postype":
							postype = getValue(lineComponents[1]);
							break;
						default:
							break;
					}

				}

				i++;
			}

			res.send({
				pos1,
				pos2,
				pos3,
				postype
			});
		});

	});

	function getValue(value: string) {
		let toReturn = value;

		if (toReturn.indexOf("#") > -1) {
			toReturn = toReturn.split("#")[0];
		}

		return toReturn;
	}

	function formatDate(number: number) {
		if (number < 10) {
			return "0" + number;
		}

		return number;
	}

	function copyFileSync(srcFile: string, destFile: string) {
		const BUF_LENGTH = 64 * 1024;
		const buff = new Buffer(BUF_LENGTH);
		const fdr = fs.openSync(srcFile, "r");
		const fdw = fs.openSync(destFile, "w");
		let bytesRead = 1;
		let pos = 0;

		while (bytesRead > 0) {
			bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
			fs.writeSync(fdw, buff, 0, bytesRead);
			pos += bytesRead;
		}

		fs.closeSync(fdr);
		fs.closeSync(fdw);
	}

	app.post("/configFile", (req, res) => {
		log.info("POST /configFile", req.body);
		res.setHeader("Access-Control-Allow-Origin", "*");

		const requiredParameters = req.body.requiredParameters;
		const advancedParameters = req.body.advancedParameters;
		const otherParameters = req.body.otherParameters;
		const cmdParameters = req.body.cmdParameters;

		let pathCmd: string;

		let configFileAsString = "# SMARTNAV-RTK options (2013/03/01 10:41:04, v.2.4.2)\n\n";
		configFileAsString = configFileAsString + "#Logs location /usr/drotek/logs/\n\n";

		configFileAsString = configFileAsString + "#Required parameters\n";
		let nbLines = requiredParameters.length;
		let currentParam;

		for (let i = 0; i < nbLines; i++) {
			currentParam = requiredParameters[i];
			configFileAsString = configFileAsString + currentParam.key + " =" + currentParam.value;

			if (currentParam.unit) {
				configFileAsString = configFileAsString + " # (" + currentParam.unit + ")";
			}

			if (currentParam.comment) {
				configFileAsString = configFileAsString + " # " + currentParam.comment;
			}

			configFileAsString = configFileAsString + "\n";
		}
		configFileAsString = configFileAsString + "\n";

		configFileAsString = configFileAsString + "#Advanced parameters\n";
		nbLines = advancedParameters.length;
		for (let i = 0; i < nbLines; i++) {
			currentParam = advancedParameters[i];
			configFileAsString = configFileAsString + currentParam.key + " =" + currentParam.value;

			if (currentParam.unit) {
				configFileAsString = configFileAsString + " # (" + currentParam.unit + ")";
			}

			if (currentParam.comment) {
				configFileAsString = configFileAsString + " # " + currentParam.comment;
			}

			configFileAsString = configFileAsString + "\n";
		}
		configFileAsString = configFileAsString + "\n";

		configFileAsString = configFileAsString + "#Other parameters\n";
		nbLines = otherParameters.length;
		for (let i = 0; i < nbLines; i++) {
			currentParam = otherParameters[i];

			const currentParamKey = currentParam.key;

			configFileAsString = configFileAsString + currentParamKey + " =" + currentParam.value;

			if (currentParam.unit) {
				configFileAsString = configFileAsString + " # (" + currentParam.unit + ")";
			}

			if (currentParam.comment) {
				configFileAsString = configFileAsString + " # " + currentParam.comment;
			}

			configFileAsString = configFileAsString + "\n";

			if (currentParamKey === "file-cmdfile1") {
				pathCmd = currentParam.value;
			}

		}

		let fileName;
		if (req.body.name) {
			fileName = "Saved_Conf_" + req.body.name;
		} else {
			fileName = config.configFiles["current_conf"];
		}

		fs.writeFile(path.join(config.configFilesPath , fileName), configFileAsString, (err) => {
			if (err) {
				throw err;
			}
			console.log("Config file saved!");

			const nbCmdParam = cmdParameters.length;
			if (pathCmd && nbCmdParam > 0) {

				return modifyCmdFile(pathCmd, cmdParameters, res, req);

			} else {
				return res.send(req.body);
			}
		});
	});

	app.post("/baseCMD", (req, res) => {
		log.info("POST /baseCMD", req.body);
		res.setHeader("Access-Control-Allow-Origin", "*");

		const cmdParameters = req.body.cmdParameters;

		const pathCmd = path.join(config.configFilesPath , config.configFiles.base_cmd);

		const nbCmdParam = cmdParameters.length;
		if (nbCmdParam > 0) {

			return modifyCmdFile(pathCmd, cmdParameters, res, req);

		} else {
			return res.send(req.body);
		}
	});

	function modifyCmdFile(pathCmd: string, cmdParameters: IParameter[], res: express.Response, req: express.Request) {
		let cmdFileAsString = "";

		fs.readFile(pathCmd, "utf-8", function read(errCmd, dataCmd) {
			if (errCmd) {
				throw errCmd;
			}

			const linesCmd = dataCmd.split("\n");
			const nbLinesCmd = linesCmd.length;

			for (let j = 0; j < nbLinesCmd; j++) {
				const currentCmdLine = linesCmd[j];

				if (currentCmdLine.substring(0, 1) !== "#") {
					const cmdLineComponents = currentCmdLine.split(" ");

					if (cmdLineComponents.length > 0) {
						const currentCmdType = cmdLineComponents[1];

						switch (currentCmdType) {
							case "CFG-RATE":
							case "CFG-PRT":
								cmdFileAsString += getCmdLine(currentCmdType, cmdLineComponents, cmdParameters);
								break;
							default:
								cmdFileAsString += currentCmdLine + "\n";
								break;
						}
					} else {
						cmdFileAsString += currentCmdLine + "\n";
					}
				} else {
					cmdFileAsString += currentCmdLine + "\n";
				}
			}

			fs.writeFile(pathCmd, cmdFileAsString, (err) => {
				if (err) {
					throw err;
				}
				console.log("CMD file saved!");

				return res.send(req.body);
			});
		});
	}

	function getCmdLine(cmdType: string, cmdLineComponents: string[], params: IParameter[]) {
		let commandToReturn = null;

		const nbCmdParam = params.length;
		for (let i = 0; i < nbCmdParam && commandToReturn === null; i++) {
			const currentParam = params[i];

			if (cmdType === currentParam.key) {
				if (cmdType === "CFG-RATE") {
					const period = 1000 / parseInt(currentParam.value as string);
					commandToReturn = "!UBX CFG-RATE " + period + " " +
						cmdLineComponents[3] + " " +
						cmdLineComponents[4] + "\n";
				} else if (cmdType === "CFG-PRT") {
					commandToReturn = "!UBX CFG-PRT " +
						cmdLineComponents[2] + " " +
						cmdLineComponents[3] + " " +
						cmdLineComponents[4] + " " +
						cmdLineComponents[5] + " " +
						+currentParam.value + " " +
						cmdLineComponents[7] + " " +
						cmdLineComponents[8] + " " +
						cmdLineComponents[9] + " " +
						cmdLineComponents[10] + "\n";
				}
			}
		}

		return commandToReturn;
	}

	app.get("/runBase", (req, res) => {
		log.info("GET /runBase");
		res.setHeader("Access-Control-Allow-Origin", "*");

		fs.readFile(path.join(config.runBaseFilePath , config.runBaseName), "utf-8", function read(err, data) {
			if (err) {
				throw err;
			}

			let type;
			let value;

			const lines = data.split("\n");
			const nbLines = lines.length;

			let i = 0;
			while (i < nbLines && (!type || !value)) {

				let currentLine = lines[i];
				currentLine = currentLine.replace(/\s/g, "");

				if (currentLine !== "" && currentLine.substring(0, 1) !== "#") {
					if (currentLine.indexOf("-outtcpsvr:") > -1) {
						type = "tcpsvr";
						value = currentLine.substring(currentLine.indexOf("tcpsvr://") + 7, currentLine.length).split(":")[1];
					} else if (currentLine.indexOf("-outfile:") > -1) {
						type = "file";
						value = currentLine.substring(currentLine.indexOf("file://") + 7, currentLine.length);
					}
				}

				i++;

			}

			res.send({
				type,
				value
			});
		});
	});

	app.post("/runBase", (req, res) => {
		log.info("POST /runBase", req.body);
		res.setHeader("Access-Control-Allow-Origin", "*");

		let runBaseFileAsString = "#!/bin/bash\n";
		runBaseFileAsString = runBaseFileAsString + "# Drotek SMARTNAV-RTK\n\n";

		runBaseFileAsString = runBaseFileAsString + "DIR=/usr/drotek\n";
		runBaseFileAsString = runBaseFileAsString + "RTKLIBDIR=$DIR/rtklib\n";
		runBaseFileAsString = runBaseFileAsString + "RTKLIBLOGDIR=$DIR/logs\n";
		runBaseFileAsString = runBaseFileAsString + "RTKLIBCONFDIR=$DIR/config\n\n";

		// -out tcpsvr://:2424 or file:///$RTKLIBLOGDIR/bas_%Y%m%d%h%M.ubx
		runBaseFileAsString = runBaseFileAsString + "$RTKLIBDIR/str2str -c $RTKLIBCONFDIR/base.cmd -in serial://ttyACM0 -out " + req.body.out + "\n";

		fs.writeFile(path.join(config.runBaseFilePath + config.runBaseName), runBaseFileAsString, (err) => {
			if (err) {
				throw err;
			}
			console.log("run-base saved");
		});

		return res.send(req.body);
	});

}
