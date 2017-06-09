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
import angular_ui_bootstrap = require("angular-ui-bootstrap");

import { ILogService } from "../../../shared/services/log.service";

export default/*@ngInject*/ async function($scope: angular.IScope, log: ILogService, $modal: angular_ui_bootstrap.IModalInstanceService) {

	/* Déclaration du logger */
	console.log("dashboard.log");

	/* Déclaration des variables utilisées dans le controlleur */
	$scope = angular.extend($scope, {
		logFiles: [],
		selectedLog: undefined,
		logContent: "",
		loading: true
	});

	/* Watch Expressions */
	$scope.$watch(() => {
		return $scope.selectedLog;
	}, async (newVal) => {
		if (typeof newVal !== "undefined") {
			$scope.loading = true;
			const result = await log.getLogFile(newVal);
			$scope.logContent = result;
			$scope.loading = false;

		}
	});

	/* Screen Functionnalities */
	async function refreshLogs() {

		const result = await log.getListLogFiles();
		$scope.logFiles = result;
		$scope.selectedLog = result[0];

	}

	/* Loading Process */
	await refreshLogs();

}
