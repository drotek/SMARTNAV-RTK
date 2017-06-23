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

import angular = require("angular");
import _ = require("lodash");

export interface IParameter {
	key: string;
	value?: string | number;
	unit?: string;
	comment?: string;
	restriction?: string[];
}

export interface IParamResponse {
	name?: string;
	requiredParameters?: IParameter[];
	advancedParameters?: IParameter[];
	otherParameters?: IParameter[];
	cmdParameters?: IParameter[];
}

// export interface IRunBase {
// 	out: string;
// }

export interface IStreamInfo {
	streamType: string | "serial" | "file" | "tcpsvr" | "tcpcli" | "udp" | "ntrips" | "ntripc" | "ftp" | "http";
	streamFormat: string | "" | "rtcm2" | "rtcm3" | "nov" | "oem3" | "ubx" | "ss2" | "hemis" | "stq" | "gw10" | "javad" | "nvs" | "binex" | "rt17" | "sbf" | "cmr";
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

export interface IFileInfo {
	name: string;
	filename: string;
	full_path: string;
}

export interface IConfigurationService {
	// getMode(): string;
	getRequiredParams(): IParameter[];
	getAdvancedParams(): IParameter[];
	getOtherParams(): IParameter[];
	getCmdParams(): IParameter[];
	getOutputType(): string;
	getOutputValue(): string;
	getFile(fileName?: string): Promise<boolean>;
	// getBaseCmdFile(): Promise<boolean>;
	// getRunBase(): Promise<void>;
	saveFile(fileContent: IParamResponse): Promise<IParamResponse>;
	// saveBaseCmdFile(fileContent: IParamResponse): Promise<IParamResponse>;
	// saveRunBase(params: IRunBase): Promise<IRunBase>;
	getListConfigFile(): Promise<string[]>;
	// switchMode(): void;
	// setMode(modeToSet: string): void;

	listSTR2STRCommandFiles(): Promise<IFileInfo[]>;
	saveSTR2STRConfig(config: ISTR2STRConfig): Promise<ISTR2STRConfig>;
	saveRTKRCVConfig(config: IRTKRCVConfig): Promise<IRTKRCVConfig>;
	getSTR2STRConfig(): Promise<ISTR2STRConfig>;
	getRTKRCVConfig(): Promise<IRTKRCVConfig>;

}

export default function() {
	return {
		$get($http: angular.IHttpService, $rootScope: angular.IRootScopeService) {
			console.log("initializing configuration service");
			/* Déclaration des variables utilisées dans le service */

			// let mode = '';
			let requiredParams: IParameter[] = [];
			let advancedParams: IParameter[] = [];
			let otherParams: IParameter[] = [];
			let cmdParams: IParameter[] = [];
			const outputType = "";
			const outputValue = "";

			// Opérations disponibles pour le service configuration.
			const service: IConfigurationService = {
				// getMode: getMode,
				getRequiredParams,
				getAdvancedParams,
				getOtherParams,
				getCmdParams,
				getOutputType,
				getOutputValue,
				getFile,
				// getBaseCmdFile: getBaseCmdFile,
				// getRunBase: getRunBase,
				saveFile,
				// saveBaseCmdFile: saveBaseCmdFile,
				// saveRunBase: saveRunBase,
				getListConfigFile,
				// switchMode: switchMode,
				// setMode: setMode,

				saveSTR2STRConfig,
				saveRTKRCVConfig,
				getSTR2STRConfig,
				getRTKRCVConfig,
				listSTR2STRCommandFiles

			};

			return service;

			/* Définition des fonctions du service de configuration */

			// function setMode(modeToSet: string): void {
			// 	mode = modeToSet;
			// }

			// function switchMode(): void {
			// 	if (mode === 'ROVER') {
			// 		getBaseCmdFile().then(() => {
			// 			mode = 'BASE';
			// 		});
			// 	} else {
			// 		getFile().then(() => {
			// 			mode = 'ROVER';
			// 		});
			// 	}
			// }

			// function getMode(): string {
			// 	return mode;
			// }

			function getRequiredParams(): IParameter[] {
				return requiredParams;
			}

			function getAdvancedParams(): IParameter[] {
				return advancedParams;
			}

			function getOtherParams(): IParameter[] {
				return otherParams;
			}

			function getCmdParams(): IParameter[] {
				return cmdParams;
			}

			function getOutputType(): string {
				return outputType;
			}

			function getOutputValue(): string {
				return outputValue;
			}

			async function getListConfigFile(): Promise<string[]> {
				const response = await $http({
					method: "GET",
					url: $rootScope.host + ":3000/listConfigFile"
				});
				const result = response.data as { listConfigFiles: string[] };

				return result.listConfigFiles;
			}

			async function getFile(fileName?: string): Promise<boolean> {

				let url = $rootScope.host + ":3000/configFile";
				if (fileName) {
					url += "?name=" + fileName;
				}

				const response = await $http({
					method: "GET",
					url
				});
				const params = response.data as IParamResponse;

				requiredParams = params.requiredParameters;
				advancedParams = params.advancedParameters;
				otherParams = params.otherParameters;
				cmdParams = params.cmdParameters;
				return true;

			}

			async function saveFile(fileContent: IParamResponse): Promise<IParamResponse> {
				console.log("configuration.service.saveFile", fileContent);
				const response = await $http({
					method: "POST",
					url: $rootScope.host + ":3000/configFile",
					data: fileContent
				});
				return response.data as IParamResponse;

			}

			// function getBaseCmdFile(): Promise<boolean> {

			// 	var url = $rootScope.host + ':3000/baseCMD';

			// 	return $http({
			// 		method: 'GET',
			// 		url: url
			// 	}).then((response) => {
			// 		return response.data as IParamResponse;
			// 	}).then((params) => {
			// 		requiredParams = params.requiredParameters;
			// 		advancedParams = params.advancedParameters;
			// 		otherParams = params.otherParameters;
			// 		cmdParams = params.cmdParameters;
			// 		return true;
			// 	});

			// }

			// function getRunBase(): Promise<void> {
			// 	var url = $rootScope.host + ':3000/runBase';

			// 	return $http({
			// 		method: 'GET',
			// 		url: url
			// 	}).then((response) => {
			// 		return response.data as { type: string, value: string };
			// 	}).then((output) => {
			// 		outputType = output.type;
			// 		outputValue = output.value;
			// 	});
			// }

			// function saveBaseCmdFile(fileContent: IParamResponse): Promise<IParamResponse> {
			// 	return $http({
			// 		method: 'POST',
			// 		url: $rootScope.host + ':3000/baseCMD',
			// 		data: fileContent
			// 	}).then((response) => {
			// 		return response.data as IParamResponse;
			// 	});
			// }

			// function saveRunBase(params: IRunBase): Promise<IRunBase> {
			// 	return $http({
			// 		method: 'POST',
			// 		url: $rootScope.host + ':3000/runBase',
			// 		data: params
			// 	}).then((response) => {
			// 		return response.data;
			// 	});
			// }

			async function saveSTR2STRConfig(config: ISTR2STRConfig): Promise<ISTR2STRConfig> {
				const response = await $http({
					method: "POST",
					url: $rootScope.host + ":3000/saveSTR2STRConfig",
					data: config
				});
				return response.data as ISTR2STRConfig;
			}

			async function saveRTKRCVConfig(config: IRTKRCVConfig): Promise<IRTKRCVConfig> {
				const response = await $http({
					method: "POST",
					url: $rootScope.host + ":3000/saveRTKRCVConfig",
					data: config
				});
				return response.data as IRTKRCVConfig;
			}

			async function getSTR2STRConfig(): Promise<ISTR2STRConfig> {
				const response = await $http({
					method: "GET",
					url: $rootScope.host + ":3000/getSTR2STRConfig"

				});
				return response.data as ISTR2STRConfig;
			}

			async function getRTKRCVConfig(): Promise<IRTKRCVConfig> {
				const response = await $http({
					method: "GET",
					url: $rootScope.host + ":3000/getRTKRCVConfig",
				});
				return response.data as IRTKRCVConfig;
			}

			async function listSTR2STRCommandFiles(): Promise<IFileInfo[]> {
				const response = await $http({
					method: "GET",
					url: $rootScope.host + ":3000/listSTR2STRCommands",
				});
				return response.data as IFileInfo[];
			}

			// fin - Définition des fonctions du service

		}
	};
}
