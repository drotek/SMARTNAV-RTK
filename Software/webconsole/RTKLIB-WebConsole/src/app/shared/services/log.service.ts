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

export interface ILogService {
	getListLogFiles(): Promise<string[]>;
	getLogFile(logFileName: string): Promise<string>;
	getListUbxFiles(): Promise<string[]>;
	getUbxFile(ubxFileName: string): Promise<ArrayBuffer>;
}

export default function() {
	return {
		$get: /*@ngInject*/  ($http: angular.IHttpService, $rootScope: angular.IRootScopeService) => {
			console.log("initializing log service");
			/* Déclaration des variables utilisées dans le service */

			// Opérations disponibles pour le service configuration.
			const service: ILogService = {
				getListLogFiles,
				getLogFile,
				getListUbxFiles,
				getUbxFile
			};

			return service;

			/* Définition des fonctions du service de configuration */

			async function getListLogFiles(): Promise<string[]> {
				const response = await $http({
					method: "GET",
					url: $rootScope.host + ":3000/listLogFiles"
				});
				const result = response.data as { listFiles: string[] };

				return result.listFiles;

			}

			async function getLogFile(logFileName: string): Promise<string> {

				const url = $rootScope.host + ":3000/logFile";

				const params = {
					name: logFileName
				};

				const response = await $http({
					method: "POST",
					url,
					data: params
				});
				return response.data as string;

			}

			async function getListUbxFiles(): Promise<string[]> {
				const response = await $http({
					method: "GET",
					url: $rootScope.host + ":3000/listUbxFiles"
				});
				const result = response.data as { listFiles: string[] };
				return result.listFiles;
			}

			async function getUbxFile(ubxFileName: string): Promise<ArrayBuffer> {

				const url = $rootScope.host + ":3000/ubxFile";

				const params = {
					name: ubxFileName
				};

				const response = await $http({
					method: "POST",
					url,
					responseType: "arraybuffer",
					data: params
				});
				console.log(response);
				return response.data as ArrayBuffer;

			}

			// fin - Définition des fonctions du service

		}
	};
}
