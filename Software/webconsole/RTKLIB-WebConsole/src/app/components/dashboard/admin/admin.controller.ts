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

import { IAdminService, IModuleResponse } from "../../../shared/services/admin.service";
import { IConfigurationService } from "../../../shared/services/configuration.service";
import { ILogService } from "../../../shared/services/log.service";
import { IStatusService, IStream } from "../../../shared/services/status.service";

import export_log_controller from "../modals/export-log/export-log.controller";
import export_ubx_controller from "../modals/export-ubx/export-ubx.controller";
import share_log_controller from "../modals/share-log/share-log.controller";
import update_platform_controller from "../modals/update-platform/update-platform.controller";

import { ILiveLogsService, IStatusMessage } from "../../../shared/services/live-logs.service";

export interface IAdminScope extends angular.IScope {
	oneAtATime: boolean;
	status: {
		isServiceOpen: boolean,
		isLogsOpen: boolean,
		isUpdateOpen: boolean,
		isFirstDisabled: boolean
	};
	logFiles: string[];
	services: { [id: string]: IModuleResponse; };
	services_status: { [id: string]: string; };
	streams: IStream[];
}

export default /*@ngInject*/ async function(
	$scope: IAdminScope, log: ILogService, admin: IAdminService, configuration: IConfigurationService,
	$modal: angular_ui_bootstrap.IModalService, $rootScope: angular.IRootScopeService, toastr: angular.toastr.IToastrService,
	livelog: ILiveLogsService, status: IStatusService) {

	/* Déclaration du logger */
	console.log("dashboard.admin.controller");

	console.log("dashboard livelog instance", livelog);

	/* Déclaration des variables utilisées dans le controlleur */
	$scope = angular.extend($scope, {
		oneAtATime: false,
		status: {
			isServiceOpen: true,
			isLogsOpen: true,
			isUpdateOpen: true,
			isFirstDisabled: false
		},
		logFiles: [],
		services: {}, // ROVER/BASE
		services_status: {},
		streams: [],
	} as IAdminScope);

	const registered_str2str_status = $rootScope.$on("str2str:status", (e, msg: IStatusMessage) => {
		$scope.services_status["BASE"] = `${(new Date(msg.data.timestamp)).toLocaleString()} ${msg.data.unknown} Total: ${msg.data.received.toLocaleString()} bytes, ${msg.data.bps.toLocaleString()}bps - ${msg.data.msg}`;
	});

	$scope.$on("$destroy", () => {
		console.log("destroy dashboard.admin.controller");
		registered_str2str_status();
	});

	/* Watch Expressions */
	await refreshStatus();

	$scope.exportLog = async ($event: angular.IAngularEvent): Promise<any> => {
		$event.stopPropagation();

		const modalInstance = $modal.open({
			animation: true,
			template: require("../modals/export-log/export-log.html"),
			controller: export_log_controller,
		});

		try {
			const result = await modalInstance.result;
			console.log("Log exported");
			toastr.info("Log exported");
		} catch (e) {
			console.log("Export log modal dismissed at: " + new Date(), e);
		}

	};

	/* Screen Functionnalities */
	async function refreshStatus() {
		try {
			const rover_status = await admin.adminService("status", "ROVER");
			if (typeof rover_status !== "undefined") {
				console.log('admin.adminService("status","ROVER") ', rover_status);
				$scope.services["ROVER"] = rover_status;

				if (rover_status.error || rover_status.stderr) {
					toastr.error((rover_status.error) ? rover_status.error.message : "" + rover_status.stderr, "Error ROVER Status");
				}
			}
		} catch (e) {
			console.log("error checking service status", "ROVER", e);
			toastr.error("Error Checking ROVER Status");
		}

		try {
			const base_status = await admin.adminService("status", "BASE");
			if (typeof base_status !== "undefined") {
				console.log('admin.adminService("status","BASE") ', base_status);
				$scope.services["BASE"] = base_status;

				if (base_status.error || base_status.stderr) {
					toastr.error((base_status.error) ? base_status.error.message : "" + base_status.stderr, "Error BASE Status");
				}
			}
		} catch (e) {
			console.log("error checking service status", "BASE", e);
			toastr.error("Error Checking BASE Status");
		}

		if ($scope.services["ROVER"].isActive) {
			$scope.streams = await status.get_stream();
		} else {
			$scope.streams = null;
		}
	}

	$scope.start = async ($event: angular.IAngularEvent, service_name: string) => {
		$event.stopPropagation();
		console.log("starting service", service_name, $event);

		const response = await admin.adminService("start", service_name);
		if (response && response.error) {
			console.log(response);
			toastr.error((response.error) ? response.error.message : "" + response.stderr, "Error Starting Service");
		}
		await refreshStatus();
	};

	$scope.stop = async ($event: angular.IAngularEvent, service_name: string) => {
		$event.stopPropagation();
		console.log("stopping service", service_name, $event);

		const response = await admin.adminService("stop", service_name);
		if (response.error) {
			console.log(response.error);
			toastr.error((response.error) ? response.error.message : "" + response.stderr, "Error Stopping Service");
		}
		await refreshStatus();
	};

	$scope.enable = async ($event: angular.IAngularEvent, service_name: string) => {
		$event.stopPropagation();
		console.log("enabling service", service_name, $event);

		const response = await admin.adminService("enable", service_name);
		if (response.error) {
			console.log(response.error);
			toastr.error((response.error) ? response.error.message : "" + response.stderr, "Error Enabling Service");
		}
		await refreshStatus();
	};

	$scope.disable = async ($event: angular.IAngularEvent, service_name: string) => {
		$event.stopPropagation();
		console.log("disabling service", service_name, $event);

		const response = await admin.adminService("disable", service_name);
		if (response.error) {
			console.log(response.error);
			toastr.error((response.error) ? response.error.message : "" + response.stderr, "Error Disabling Service");
		}
		await refreshStatus();
	};

	$scope.exportUbx = async ($event: angular.IAngularEvent) => {
		$event.stopPropagation();

		const modalInstance = $modal.open({
			animation: true,
			template: require("../modals/export-ubx/export-ubx.html"),
			controller: export_ubx_controller,
		});

		try {
			const result = await modalInstance.result; // returned input on ok
			console.log("Ubx exported");
			toastr.info("Ubx exported");
		} catch (e) {
			console.log("Export ubx modal dismissed at: " + new Date(), e);
		}
	};

	$scope.share = async ($event: angular.IAngularEvent) => {
		$event.stopPropagation();

		const modalInstance = $modal.open({
			animation: true,
			template: require("../modals/share-log/share-log.html"),
			controller: share_log_controller,
		});

		try {
			const result = await modalInstance.result; // returned input on ok
			console.log("Log shared");
			toastr.info("Log shared");
		} catch (e) {
			console.log("share log modal dismissed at: " + new Date(), e);
		}
	};

	$scope.syncTime = async ($event: angular.IAngularEvent) => {
		$event.stopPropagation();

		const response = await admin.syncTime();
		if (response.error) {
			console.log(response.error);
			toastr.error((response.error) ? response.error.message : "" + response.stderr, "Error Syncing Time");
		}
	};

	$scope.updatePlatform = async ($event: angular.IAngularEvent) => {
		$event.stopPropagation();

		const modalInstance = $modal.open({
			animation: true,
			template: require("../modals/update-platform/update-platform.html"),
			controller: update_platform_controller,
		});

		try {
			const result = await modalInstance.result; // returned input on ok

			console.log("Platform updated");
			toastr.error("Platform updated");
		} catch (e) {
			console.log("Update platform modal dismissed at: " + new Date(), e);
		}
	};

	let interval_id = setInterval(refreshStatus, 5000);

	$scope.$on("$destroy", () => {
		console.log("dashboard.admin.controller unloaded");
		clearInterval(interval_id);
		interval_id = null;
	});
}
