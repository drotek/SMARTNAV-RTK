
// usage: rtkrcv [-s][-p port][-d dev][-o file][-w pwd][-r level][-t level][-sta sta]
// options
//   -s         start RTK server on program startup
//   -p port    port number for telnet console
//   -m port    port number for monitor stream
//   -d dev     terminal device for console
//   -o file    processing options file
//   -w pwd     login password for remote console ("": no password)
//   -r level   output solution status file (0:off,1:states,2:residuals)
//   -t level   debug trace level (0:off,1-5:on)
//   -fl file   log file [rtkrcv_%Y%m%d%h%M.trace]",
//   -fs file   stat file [rtkrcv_%Y%m%d%h%M.stat]",
//   -sta sta   station name for receiver dcb

export const DEFAULT_CONSOLE_PORT = 12000;

export interface IRTKRCVConfig {
	options_file: string;

	trace_level: number; // 0-5
	log_file: string;
	stat_file: string;

	output_solution_status_file_level: number;
	console_port: number;
	monitor_port: number;
	login_password: string;
	station_name: string;
	enabled: boolean;
}

import { Application } from "../app";
import * as config from "../config";
import * as fs from "../utilities/fs_wrapper";
import moment = require("moment");
import path = require("path");
import { FileMonitor } from "../utilities/file_monitor";
import * as rtkrcv from "../utilities/rtkrcv";
import * as rtkrcv_accessor from "../utilities/rtkrcv_accessor";
import * as rtkrcv_monitor from "../utilities/rtkrcv_monitor";

import * as logger from "../utilities/logger";
const log = logger.getLogger("rtkrcv_config");

export interface IModuleResponse {
	error?: Error;
	stdout?: string;
	stderr?: string;
	isActive?: boolean;
	isEnabled?: boolean;
}

export async function get_configuration(){
	return await fs.deserialize_file<IRTKRCVConfig>(config.rtkrcv_config);
}

export async function control(application: Application, commandType: string) {
	let error: Error = null;

	const response: IModuleResponse = {};

	try {
		switch (commandType) {
			case "start":
				if (!application.rtkrcv_instance) {
					if (!await fs.exists(config.rtkrcv_config)) {
						throw new Error("rtkrcv configuration is missing: " + config.rtkrcv_config);
					}
					const rtkrcv_configuration = await get_configuration();

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
					application.rtkrcv_instance_monitor.on("position", (position) => {
						application.last_position = position;
						application.monitor_events.emit("position", position);
					});

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
					const rtkrcv_configuration = await get_configuration();

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
				const rtkrcv_config = await get_configuration();
				response.isActive = application.rtkrcv_instance && application.rtkrcv_instance.status();
				response.isEnabled = rtkrcv_config.enabled;
				break;
			case "enable": {
				const rtkrcv_configuration = await get_configuration();
				rtkrcv_configuration.enabled = true;
				await fs.serialize_file<IRTKRCVConfig>(config.rtkrcv_config, rtkrcv_configuration);
			}              break;
			case "disable": {
				const rtkrcv_configuration = await get_configuration();
				rtkrcv_configuration.enabled = false;
				await fs.serialize_file<IRTKRCVConfig>(config.rtkrcv_config, rtkrcv_configuration);
			}
			default:
				log.error("command type unrecognized", commandType);
				throw new Error("command type unrecognized");
		}

	} catch (e) {
		log.error("error", commandType, e);
		error = e;
	}
	response.stdout = (application.rtkrcv_instance) ? application.rtkrcv_instance.getStdout() : null;
	response.stderr = (application.rtkrcv_instance) ? application.rtkrcv_instance.getStderr() : null;
	response.error = error;

	if (application.rtkrcv_instance == null || (!application.rtkrcv_instance.status())) {
		application.rtkrcv_instance = null;
	}

	return response;
}
