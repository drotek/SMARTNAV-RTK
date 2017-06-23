
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
	return (await superagent.post(config.rtkrcv_serviceUrl + "/control").send({ commandType })).body;
}

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

export async function getConfiguration(): Promise<IRTKRCVConfig> {
	return (await superagent.get(config.rtkrcv_serviceUrl + "/configuration").send()).body;
}

export async function setConfiguration(configuration: IRTKRCVConfig): Promise<IRTKRCVConfig> {
	return (await superagent.post(config.rtkrcv_serviceUrl + "/configuration").send(configuration)).body;
}
