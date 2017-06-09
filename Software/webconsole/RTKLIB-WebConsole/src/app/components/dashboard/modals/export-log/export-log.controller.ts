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

export default /*@ngInject*/ async function($scope: angular.IScope, log: ILogService, $modalInstance: angular_ui_bootstrap.IModalInstanceService) {

	/* Controller parameters */
	$scope = angular.extend($scope, {
		downloadFile: undefined,
		logFiles: undefined
	});

	const log_files = await log.getListLogFiles();
	$scope.logFiles = log_files;
	$scope.downloadFile = log_files[0];

	function createDownloadLink(blob: Blob, fileName: string) {
		let url;
		const downloadLink = document.createElement("a");
		const downloadAttributeSupported = "download" in downloadLink;
		const urlCreator = window.URL || (window as any).webkitURL || (window as any).mozURL || (window as any).msURL;

		if (urlCreator) {
			if (downloadAttributeSupported) {
				url = urlCreator.createObjectURL(blob);
				downloadLink.href = url;
				downloadLink.download = fileName;
				downloadLink.style.display = "none";
				downloadLink.click();
			} else {
				url = urlCreator.createObjectURL(blob);
				window.open(url, "_blank", "");
			}
		}
	}

	function saveBlob(blob: Blob, fileName: string) {

		(window as any).saveAs = (window as any).saveAs || (window as any).webkitSaveAs || (window as any).mozSaveAs || (window as any).msSaveAs;
		if ((window as any).saveAs) {
			(window as any).saveAs(blob, fileName);
		} else {
			(navigator as any).saveBlob(blob, fileName);
		}
	}

	function saveFile(blob: Blob, fileName: string) {

		(navigator as any).saveBlob = (navigator as any).saveBlob || navigator.msSaveBlob ||
			(navigator as any).mozSaveBlob || (navigator as any).webkitSaveBlob;

		if ((navigator as any).saveBlob) {
			saveBlob(blob, fileName);
		} else {
			createDownloadLink(blob, fileName);
		}
	}

	// Function called to export log file
	$scope.ok = async () => {
		const result = await log.getLogFile($scope.downloadFile);

		const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
		saveFile(blob, $scope.downloadFile);

		$modalInstance.close();

	};

	// Function called to cancel the export.
	$scope.cancel = () => {
		$modalInstance.dismiss("cancel");
	};

}
