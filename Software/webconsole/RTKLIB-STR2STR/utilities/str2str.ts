import { execution_manager } from "./execution_manager";

import * as logger from "../utilities/logger";
const log = logger.getLogger("admin");

import * as config from "../config";

import path = require("path");

import {IStationPositionDegrees, IStationPositionMeters, ISTR2STRConfig} from "../models/str2str_config";

import { FileMonitor } from "./file_monitor";

export class str2str extends execution_manager {
	private static parse_config(str2str_config: ISTR2STRConfig): string[] {
		log.debug("str2str parsing config", str2str_config);
		let ret: string[]; ret = [];
		if (str2str_config.input_command_file) {
			ret.push("-c");
			ret.push(str2str_config.input_command_file);
		}

		if (str2str_config.output_command_files && str2str_config.output_command_files.length) {
			let i = 1;
			for (const output_file of str2str_config.output_command_files) {
				if (output_file) {
					if (i > 4) {
						log.warn(`more than 4 output command files were specified, ignoring extra`);
						break;
					}

					ret.push(`-c${i}`);
					ret.push(output_file);
					i++;
				}
			}
		}

		if (str2str_config.in_streams && str2str_config.in_streams.length) {
			for (const in_stream of str2str_config.in_streams) {
				// if (in_stream.streamFormat && STREAM_FORMATS.indexOf(in_stream.streamFormat) === -1) {
				// 	throw new Error("in stream format is invalid:" + in_stream.streamFormat);
				// }

				if (in_stream.streamPath) {
					ret.push("-in");
					ret.push(((in_stream.streamType) ? in_stream.streamType + "://" : "") + in_stream.streamPath + ((in_stream.streamFormat) ? "#" + in_stream.streamFormat : ""));
				}
			}
		}

		if (str2str_config.out_streams && str2str_config.out_streams.length) {
			for (const out_stream of str2str_config.out_streams) {
				// if (out_stream.streamFormat && STREAM_FORMATS.indexOf(out_stream.streamFormat) === -1) {
				// 	throw new Error("out stream format is invalid:" + out_stream.streamFormat);
				// }

				if (out_stream.streamPath) {
					ret.push("-out");
					ret.push(((out_stream.streamType) ? out_stream.streamType + "://" : "") + out_stream.streamPath + ((out_stream.streamFormat) ? "#" + out_stream.streamFormat : ""));
				}
			}
		}

		if (str2str_config.station_id) {
			ret.push("-sta");
			ret.push(str2str_config.station_id.toString());
		}

		if (str2str_config.relay_messages_back !== undefined) {
			if (str2str_config.relay_messages_back) {
				ret.push("-b");
				ret.push("yes");
			}
		}

		if (str2str_config.trace_level) {
			ret.push("-t");
			ret.push(str2str_config.trace_level.toString());
		}

		if (str2str_config.timeout) {
			ret.push("-s");
			ret.push(str2str_config.timeout.toString());
		}

		if (str2str_config.reconnect_interval) {
			ret.push("-r");
			ret.push(str2str_config.reconnect_interval.toString());
		}

		if (str2str_config.nmea_request_cycle) {
			ret.push("-n");
			ret.push(str2str_config.nmea_request_cycle.toString());
		}

		if (str2str_config.file_swap_margin) {
			ret.push("-f");
			ret.push(str2str_config.file_swap_margin.toString());
		}

		if (str2str_config.station_position) {
			const degrees_position = (str2str_config.station_position as IStationPositionDegrees);
			const meters_position = (str2str_config.station_position as IStationPositionMeters);
			if (degrees_position.lon && degrees_position.lat && degrees_position.height) {
				ret.push("-p");
				ret.push(degrees_position.lat.toString());
				ret.push(degrees_position.lon.toString());
				ret.push(degrees_position.height.toString());
			} else if (meters_position.x && meters_position.y && meters_position.z) {
				ret.push("-x");
				ret.push(meters_position.x.toString());
				ret.push(meters_position.y.toString());
				ret.push(meters_position.z.toString());
			} else {
				log.warn("invalid position specified", str2str_config.station_position);
			}
		}

		if (str2str_config.antenna_info) {
			ret.push("-a");
			ret.push(str2str_config.antenna_info.join(","));
		}

		if (str2str_config.receiver_info) {
			ret.push("-i");
			ret.push(str2str_config.receiver_info.join(","));
		}

		if (str2str_config.antenna_offset) {
			ret.push("-o");
			ret.push(str2str_config.antenna_offset.e.toString());
			ret.push(str2str_config.antenna_offset.n.toString());
			ret.push(str2str_config.antenna_offset.u.toString());
		}

		if (str2str_config.ftp_http_local_directory) {
			ret.push("-l");
			ret.push(str2str_config.ftp_http_local_directory);
		}

		if (str2str_config.http_ntrip_proxy_address) {
			ret.push("-x");
			ret.push(str2str_config.http_ntrip_proxy_address);
		}

		if (str2str_config.ntrip_souce_table_file) {
			ret.push("-ft");
			ret.push(str2str_config.ntrip_souce_table_file);
		}

		if (str2str_config.log_file) {
			ret.push("-fl");
			ret.push(str2str_config.log_file);
		}

		return ret;
	}

	private _file_monitor: FileMonitor;

	constructor(public str2str_config: ISTR2STRConfig) {
		super(config.str2str, str2str.parse_config(str2str_config));

		this._file_monitor = new FileMonitor(path.join(path.dirname(config.str2str), path.basename(config.str2str) + ".trace"));

		this.on("close", () => {
			this._file_monitor.close();
		});
	}
}
