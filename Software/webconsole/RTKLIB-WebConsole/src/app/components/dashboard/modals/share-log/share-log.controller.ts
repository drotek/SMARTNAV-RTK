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
import { ILogService } from "../../../../shared/services/log.service";

export default /*@ngInject*/ async function(
	$scope: angular.IScope,
	log: ILogService,
	$modalInstance: angular_ui_bootstrap.IModalServiceInstance,
	toastr: angular.toastr.IToastrService
) {

	/* Controller parameters */
	$scope = angular.extend($scope, {
		mailAdress: "x@y.com",
		downloadFile: undefined,
		logFiles: undefined
	});

	try {
		const log_files = await log.getListLogFiles();
		$scope.logFiles = log_files;
		$scope.downloadFile = log_files[0];
	} catch (e) {
		console.log("error listing log files", e);
		toastr.error("Error Listing Log Files");
	}

	// Function called to share log file
	$scope.ok = async () => {
		try {
			const result = await log.getLogFile($scope.downloadFile);

			const blob = new Blob([result], { type: "text/plain;charset=utf-8" });

			const formattedBody = result;
			const mailToLink = "mailto:" + $scope.mailAdress + "?subject=[RTKLIB Web Console] " + $scope.downloadFile + "&body=" + encodeURIComponent(formattedBody);
			window.location.href = mailToLink;

			$modalInstance.close();
		} catch (e) {
			console.log("error downloading log file", $scope.downloadFile, e);
			toastr.error("Error Downloading Log File");
		}
	};

	// Function called to cancel the share.
	$scope.cancel = () => {
		$modalInstance.dismiss("cancel");
	};

}
