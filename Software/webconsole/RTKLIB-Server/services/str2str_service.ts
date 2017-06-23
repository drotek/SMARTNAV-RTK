import superagent = require("superagent");
import * as config from "../config";

export interface IModuleResponse {
	error?: Error;
	stdout?: string;
	stderr?: string;
	isActive?: boolean;
	isEnabled?: boolean;
}

export async function control(commandType: string): Promise<IModuleResponse> {
	return (await superagent.post(config.str2str_serviceUrl + "/control").send({ commandType })).body;
}

export interface IStreamInfo {
	streamType: "serial" | "file" | "tcpsvr" | "tcpcli" | "udp" | "ntrips" | "ntripc" | "ftp" | "http";
	streamFormat: null | "" | "rtcm2" | "rtcm3" | "nov" | "oem3" | "ubx" | "ss2" | "hemis" | "stq" | "gw10" | "javad" | "nvs" | "binex" | "rt17" | "sbf" | "cmr";
	streamPath: string;
}

export interface IStationPositionDegrees {
	lat: number;
	lon: number;
	height: number;
}

export interface IStationPositionMeters {
	x: number;
	y: number;
	z: number;
}

export interface IAntennaOffset {
	e: number;
	n: number;
	u: number;
}

export interface ISTR2STRConfig {
	in_streams: IStreamInfo[];
	out_streams: IStreamInfo[];
	input_command_file: string;
	output_command_files: string[];

	station_id: number;
	relay_messages_back: boolean;

	timeout: number;
	reconnect_interval: number;
	nmea_request_cycle: number;
	file_swap_margin: number;
	station_position: IStationPositionDegrees | IStationPositionMeters;
	antenna_info: string[];
	receiver_info: string[];
	antenna_offset: IAntennaOffset;

	ftp_http_local_directory: string;
	http_ntrip_proxy_address: string;
	ntrip_souce_table_file: string;

	trace_level: number; // 0-5
	log_file: string;

	enabled: boolean;
}

export async function getConfiguration(): Promise<ISTR2STRConfig> {
	return (await superagent.get(config.str2str_serviceUrl + "/configuration").send()).body;
}

export async function setConfiguration(configuration: ISTR2STRConfig): Promise<ISTR2STRConfig> {
	return (await superagent.post(config.str2str_serviceUrl + "/configuration").send(configuration)).body;
}

export interface IFileInfo {
	name: string;
	filename: string;
	full_path: string;
}

export async function listCommandFiles(): Promise<IFileInfo[]> {
	return (await superagent.get(config.str2str_serviceUrl + "/listCommands").send()).body;
}
