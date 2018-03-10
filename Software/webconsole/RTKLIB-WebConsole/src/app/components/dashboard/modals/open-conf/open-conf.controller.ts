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

import { IConfigurationService } from "../../../../shared/services/configuration.service";

export default /*@ngInject*/ async function(
	$scope: angular.IScope,
	configuration: IConfigurationService,
	$modalInstance: angular_ui_bootstrap.IModalServiceInstance,
	toastr: angular.toastr.IToastrService
) {

	/* Controller parameters */
	$scope = angular.extend($scope, {
		fileToOpen: "rtkrcv_kinematic.conf",
		configurationFiles: undefined
	});

	try {
		const result = await configuration.getListConfigFile();
		$scope.configurationFiles = result;
	} catch (e) {
		console.log("error listing configuration files", e);
		toastr.error("Error Listing Configuration Files");
	}

	// Function called to load config file
	$scope.ok = async () => {
		await configuration.getFile($scope.fileToOpen);
		$modalInstance.close();

	};

	// Function called to cancel the load.
	$scope.cancel = () => {
		$modalInstance.dismiss("cancel");
	};

}
