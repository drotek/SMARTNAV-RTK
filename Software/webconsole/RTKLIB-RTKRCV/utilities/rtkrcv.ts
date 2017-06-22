import { execution_manager } from "./execution_manager";

import * as logger from "../utilities/logger";
const log = logger.getLogger("admin");

import * as config from "../config";
import {IRTKRCVConfig,DEFAULT_CONSOLE_PORT} from "../models/rtkrcv_config";


export class rtkrcv extends execution_manager {
	private static parse_config(rtkrcv_config: IRTKRCVConfig): string[] {
		log.debug("rtkrcv parsing config", rtkrcv_config);
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

		if (rtkrcv_config.trace_level) {
			ret.push("-t");
			ret.push(rtkrcv_config.trace_level.toString());
		}

		if (rtkrcv_config.log_file) {
			ret.push("-fl");
			ret.push(rtkrcv_config.log_file);
		}

		if (rtkrcv_config.stat_file) {
			ret.push("-fs");
			ret.push(rtkrcv_config.stat_file);
		}



		return ret;
	}
	constructor(public rtkrcv_config: IRTKRCVConfig) {
		super(config.rtkrcv, rtkrcv.parse_config(rtkrcv_config));
	}

}
