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
import _ = require('lodash');

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



export interface IOutputStream {
	out_stream: string;
	out_stream_format: string;
}

export interface ISTR2STRConfig {
	in_stream: string;
	in_stream_format: string;
	out_streams: IOutputStream[];
	command: string;
	station_id: string;
	relay_messages_back: boolean;
	enabled: boolean;
}

export interface IRTKRCVConfig {
	options_file: string;
	trace_level: number;
	output_solution_status_file_level: number;
	console_port: number;
	monitor_port: number;
	login_password: string;
	station_name: string;
	enabled: boolean;
}

export interface IConfigurationService {
	//getMode(): string;
	getRequiredParams(): IParameter[];
	getAdvancedParams(): IParameter[];
	getOtherParams(): IParameter[];
	getCmdParams(): IParameter[];
	getOutputType(): string;
	getOutputValue(): string;
	getFile(fileName?: string): angular.IPromise<boolean>;
	//getBaseCmdFile(): angular.IPromise<boolean>;
	//getRunBase(): angular.IPromise<void>;
	saveFile(fileContent: IParamResponse): angular.IPromise<IParamResponse>;
	//saveBaseCmdFile(fileContent: IParamResponse): angular.IPromise<IParamResponse>;
	//saveRunBase(params: IRunBase): angular.IPromise<IRunBase>;
	getListConfigFile(): angular.IPromise<string[]>;
	// switchMode(): void;
	// setMode(modeToSet: string): void;

	saveSTR2STRConfig(config: ISTR2STRConfig): angular.IPromise<ISTR2STRConfig>;
	saveRTKRCVConfig(config: IRTKRCVConfig): angular.IPromise<IRTKRCVConfig>;
	getSTR2STRConfig(): angular.IPromise<ISTR2STRConfig>
	getRTKRCVConfig(config: IRTKRCVConfig): angular.IPromise<IRTKRCVConfig>

}

export default function () {
	return {
		$get: /*@ngInject*/ function ($http: angular.IHttpService, $rootScope: angular.IRootScopeService) {

			/* Déclaration des variables utilisées dans le service */

			//let mode = '';
			let requiredParams: IParameter[] = [];
			let advancedParams: IParameter[] = [];
			let otherParams: IParameter[] = [];
			let cmdParams: IParameter[] = [];
			let outputType = '';
			let outputValue = '';

			/**
			* Opérations disponibles pour le service configuration.
			*/
			var service: IConfigurationService = {
				//getMode: getMode,
				getRequiredParams: getRequiredParams,
				getAdvancedParams: getAdvancedParams,
				getOtherParams: getOtherParams,
				getCmdParams: getCmdParams,
				getOutputType: getOutputType,
				getOutputValue: getOutputValue,
				getFile: getFile,
				//getBaseCmdFile: getBaseCmdFile,
				//getRunBase: getRunBase,
				saveFile: saveFile,
				//saveBaseCmdFile: saveBaseCmdFile,
				//saveRunBase: saveRunBase,
				getListConfigFile: getListConfigFile,
				// switchMode: switchMode,
				// setMode: setMode,

				saveSTR2STRConfig: saveSTR2STRConfig,
				saveRTKRCVConfig: saveRTKRCVConfig,
				getSTR2STRConfig: getSTR2STRConfig,
				getRTKRCVConfig: getRTKRCVConfig

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

			function getListConfigFile(): angular.IPromise<string[]> {
				return $http({
					method: 'GET',
					url: $rootScope.host + ':3000/listConfigFile'
				}).then((response) => {
					return <{ listConfigFiles: string[] }>response.data;
				}).then((result) => {
					return result.listConfigFiles;
				});
			}

			function getFile(fileName?: string): angular.IPromise<boolean> {

				var url = $rootScope.host + ':3000/configFile';
				if (fileName) {
					url += '?name=' + fileName;
				}

				return $http({
					method: 'GET',
					url: url
				}).then((response) => {
					return response.data as IParamResponse;
				}).then((params) => {
					requiredParams = params.requiredParameters;
					advancedParams = params.advancedParameters;
					otherParams = params.otherParameters;
					cmdParams = params.cmdParameters;
					return true;
				});

			}

			function saveFile(fileContent: IParamResponse): angular.IPromise<IParamResponse> {
				return $http({
					method: 'POST',
					url: $rootScope.host + ':3000/configFile',
					data: fileContent
				}).then((response) => {
					return response.data as IParamResponse;
				});

			}

			// function getBaseCmdFile(): angular.IPromise<boolean> {

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

			// function getRunBase(): angular.IPromise<void> {
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



			// function saveBaseCmdFile(fileContent: IParamResponse): angular.IPromise<IParamResponse> {
			// 	return $http({
			// 		method: 'POST',
			// 		url: $rootScope.host + ':3000/baseCMD',
			// 		data: fileContent
			// 	}).then((response) => {
			// 		return response.data as IParamResponse;
			// 	});
			// }

			// function saveRunBase(params: IRunBase): angular.IPromise<IRunBase> {
			// 	return $http({
			// 		method: 'POST',
			// 		url: $rootScope.host + ':3000/runBase',
			// 		data: params
			// 	}).then((response) => {
			// 		return response.data;
			// 	});
			// }


			function saveSTR2STRConfig(config: ISTR2STRConfig): angular.IPromise<ISTR2STRConfig> {
				return $http({
					method: 'POST',
					url: $rootScope.host + ':3000/saveSTR2STRConfig',
					data: config
				}).then((response) => {
					return response.data as ISTR2STRConfig;
				});
			}

			function saveRTKRCVConfig(config: IRTKRCVConfig): angular.IPromise<IRTKRCVConfig> {
				return $http({
					method: 'POST',
					url: $rootScope.host + ':3000/saveRTKRCVConfig',
					data: config
				}).then((response) => {
					return response.data as IRTKRCVConfig;
				});
			}


			function getSTR2STRConfig(): angular.IPromise<ISTR2STRConfig> {
				return $http({
					method: 'GET',
					url: $rootScope.host + ':3000/getSTR2STRConfig'

				}).then((response) => {
					return response.data as ISTR2STRConfig;
				});
			}

			function getRTKRCVConfig(config: IRTKRCVConfig): angular.IPromise<IRTKRCVConfig> {
				return $http({
					method: 'GET',
					url: $rootScope.host + ':3000/getRTKRCVConfig',
				}).then((response) => {
					return response.data as IRTKRCVConfig;
				});
			}

			// fin - Définition des fonctions du service


		}
	};
};