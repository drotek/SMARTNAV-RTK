import { execution_manager } from "./execution_manager";

import * as logger from "../utilities/logger";
const log = logger.getLogger("admin");

import * as config from "../config";

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
//   -sta sta   station name for receiver dcb

const DEFAULT_CONSOLE_PORT = 12000;

export interface IRTKRCVConfig {
	options_file: string;
	trace_level: number;
	output_solution_status_file_level: number;
	console_port: number;
	monitor_port: number;
	login_password: string;
	station_name: string;
	enabled:boolean;
}

export class rtkrcv extends execution_manager {
	private static parse_config(rtkrcv_config: IRTKRCVConfig): string[] {
		log.debug("rtkrcv parsing config",rtkrcv_config);
		let ret: string[]; ret = [];

		ret.push("-s"); // start RTK server

		if (rtkrcv_config.options_file) {
			ret.push("-o");
			ret.push(rtkrcv_config.options_file);
		}

		ret.push("-p");
		ret.push((rtkrcv_config.console_port || DEFAULT_CONSOLE_PORT).toString());

		if (rtkrcv_config.monitor_port) {
			ret.push("-m");
			ret.push(rtkrcv_config.monitor_port.toString());
		}

		if (rtkrcv_config.login_password) {
			ret.push("-w");
			ret.push(rtkrcv_config.login_password);
		}

		if (rtkrcv_config.output_solution_status_file_level) {
			ret.push("-r");
			ret.push(rtkrcv_config.output_solution_status_file_level.toString());
		}

		if (rtkrcv_config.station_name) {
			ret.push("-sta");
			ret.push(rtkrcv_config.station_name);
		}
		// trace level
		ret.push("-t");
		ret.push("5");

		return ret;
	}
	constructor(public rtkrcv_config: IRTKRCVConfig) {
		super(config.rtkrcv, rtkrcv.parse_config(rtkrcv_config));
	}

}
