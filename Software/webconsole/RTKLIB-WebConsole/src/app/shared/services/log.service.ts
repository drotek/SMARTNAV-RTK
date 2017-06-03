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

export interface ILogService {
	getListLogFiles(): angular.IPromise<string[]>;
	getLogFile(logFileName: string): angular.IPromise<string>;
	getListUbxFiles(): angular.IPromise<string[]>;
	getUbxFile(ubxFileName: string): angular.IPromise<ArrayBuffer>;
}

export default function () {
	return {
		$get: /*@ngInject*/ function ($http: angular.IHttpService, $rootScope: angular.IRootScopeService) {

			/* Déclaration des variables utilisées dans le service */

			/**
			* Opérations disponibles pour le service configuration.
			*/
			var service: ILogService = {
				getListLogFiles: getListLogFiles,
				getLogFile: getLogFile,
				getListUbxFiles: getListUbxFiles,
				getUbxFile: getUbxFile
			};

			return service;

			/* Définition des fonctions du service de configuration */

			function getListLogFiles() {
				return $http({
					method: 'GET',
					url: $rootScope.host + ':3000/listLogFiles'
				}).then((response) => {
					return response.data as { listFiles: string[] };
				}).then((result) => {
					return result.listFiles;
				});
			}

			function getLogFile(logFileName: string) {

				var url = $rootScope.host + ':3000/logFile'

				var params = {
					name: logFileName
				}

				return $http({
					method: 'POST',
					url: url,
					data: params
				}).then((response) => {
					return response.data as string;
				});

			}

			function getListUbxFiles() {
				return $http({
					method: 'GET',
					url: $rootScope.host + ':3000/listUbxFiles'
				}).then((response) => {
					return response.data as { listFiles: string[] };
				}).then((result) => {
					return result.listFiles;
				});
			}

			function getUbxFile(ubxFileName: string) {

				var url = $rootScope.host + ':3000/ubxFile'

				var params = {
					name: ubxFileName
				}

				return $http({
					method: 'POST',
					url: url,
					responseType: 'arraybuffer',
					data: params
				}).then((response) => {
					console.log(response);
					return response.data as ArrayBuffer;
				});

			}

			// fin - Définition des fonctions du service


		}
	};
};