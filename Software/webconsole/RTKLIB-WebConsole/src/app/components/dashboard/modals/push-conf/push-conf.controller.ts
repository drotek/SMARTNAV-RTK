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
import angular_toastr = require("angular-toastr");

import { IAdminService } from "../../../../shared/services/admin.service";
import { IConfigurationService, IParameter, IStreamInfo } from "../../../../shared/services/configuration.service";

export interface IPushConfScope extends angular.IScope {
	mode: string;
	requiredParameters: IParameter[];
	advancedParameters: IParameter[];
	otherParameters: IParameter[];
	cmdParameters: IParameter[];
	outputType: string;
	outputValue: string;
	inputStreams: IStreamInfo[];
	outputStreams: IStreamInfo[];

	wasRoverStarted: boolean;
	wasBaseStated: boolean;

}

export default /*@ngInject*/ function (
	$q: ng.IQService, $scope: IPushConfScope, configuration: IConfigurationService, admin: IAdminService,
	$modalInstance: angular_ui_bootstrap.IModalInstanceService, toastr: angular.toastr.IToastrService, mode: string,
	requiredParams: IParameter[], advancedParams: IParameter[], otherParams: IParameter[], cmdParams: IParameter[],
	outputType: string, outputValue: string, inputStreams: IStreamInfo[], outputStreams: IStreamInfo[]) {

	/* Controller parameters */
	$scope.mode = mode;
	$scope.requiredParameters = requiredParams;
	$scope.advancedParameters = advancedParams;
	$scope.otherParameters = otherParams;
	$scope.cmdParameters = cmdParams;
	$scope.outputType = outputType;
	$scope.outputValue = outputValue;
	$scope.inputStreams = inputStreams;
	$scope.outputStreams = outputStreams;

	$scope.wasBaseStated = false;
	$scope.wasRoverStarted = false;

	$scope.loading = false;

	// Function called to push config file
	$scope.ok = async () => {
		try {
			$scope.loading = true;
			const response = await stopRunningService();
			if (response) {
				console.log("services stopped successfully");
				await pushAndStart();
			} else {
				console.log("failed to stop services");
			}
		} catch (e) {
			console.log("error pushing changes", e);
			toastr.error("Error Pushing Changes");
		}
	};

	function find_or_create_property(parameters: IParameter[], key_name: string) {
		let parameter = parameters.find((p) => p.key === key_name);
		if (parameter == null) {
			parameter = {
				key: key_name
			};
			parameters.push(parameter);
		}
		return parameter;
	}

	async function pushAndStart() {
		if ($scope.mode === "ROVER") {
			// copy back input streams
			console.log("update ROVER input streams");
			if ($scope.inputStreams) {
				for (let i = 0; i < $scope.inputStreams.length; i++) {
					find_or_create_property($scope.otherParameters, `inpstr${i}-type`).value = $scope.inputStreams[i].streamType;
					find_or_create_property($scope.otherParameters, `inpstr${i}-path`).value = $scope.inputStreams[i].streamPath;
					find_or_create_property($scope.otherParameters, `inpstr${i}-format`).value = $scope.inputStreams[i].streamFormat;
				}
			}

			console.log("update ROVER output streams");
			// copy back output streams
			if ($scope.outputStreams) {
				for (let i = 0; i < $scope.outputStreams.length; i++) {
					find_or_create_property($scope.otherParameters, `outstr${i}-type`).value = $scope.outputStreams[i].streamType;
					find_or_create_property($scope.otherParameters, `outstr${i}-path`).value = $scope.outputStreams[i].streamPath;
					find_or_create_property($scope.otherParameters, `outstr${i}-format`).value = $scope.outputStreams[i].streamFormat;
				}
			}

			console.log("saving configuration file");
			await configuration.saveFile({
				requiredParameters: $scope.requiredParameters,
				advancedParameters: $scope.advancedParameters,
				otherParameters: $scope.otherParameters,
				cmdParameters: $scope.cmdParameters
			});

			if ($scope.wasRoverStarted) {
				console.log("starting ROVER service");
				let response = await admin.adminService("start", "ROVER");
			}

			$modalInstance.close();
			return true;
		} else if ($scope.mode === "BASE") {
			console.log("saving str2str(BASE) configuration");
			const config = await configuration.getSTR2STRConfig();
			config.in_streams = $scope.inputStreams;
			config.out_streams = $scope.outputStreams;
			const saved_config = await configuration.saveSTR2STRConfig(config);

			console.log("saving BASE configuration file");
			await configuration.saveFile({
				cmdParameters: $scope.cmdParameters,
				otherParameters: $scope.otherParameters
			});

			if ($scope.wasBaseStated) {
				let response = await admin.adminService("start", "BASE");
			}
			$modalInstance.close();
			return true;
		} else {
			throw new Error("mode not implemented " + $scope.mode);
		}
	}

	async function stopRunningService(): Promise<boolean> {
		const rover_status_result = await admin.adminService("status", "ROVER");
		if (rover_status_result.isActive) {
			$scope.wasRoverStarted = true;
		}
		const stop_rover_result = await admin.adminService("stop", "ROVER");

		const response = await admin.adminService("status", "BASE");
		if (response.isActive) {
			$scope.wasBaseStated = true;
		}
		const stop_base_result = await admin.adminService("stop", "BASE");

		return true;
	}

	// Function called to cancel the push.
	$scope.cancel = () => {
		$modalInstance.dismiss("cancel");
	};

}
