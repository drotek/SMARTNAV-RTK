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
import { IArraysFactory } from "../../../shared/factories/arrays.factory";
import { IGpsFactory } from "../../../shared/factories/gps.factory";

import { IRoverSatData, IStatusService } from "../../../shared/services/status.service";

import { ILiveDataService, IPosition, IPositionMessage, QualityMap } from "../../../shared/services/live-data.service";

export default /*@ngInject*/ async function(
	$scope: angular.IScope, $rootScope: angular.IRootScopeService, status: IStatusService, arrays: IArraysFactory, gps: IGpsFactory, livedata: ILiveDataService) {

	/* Déclaration du logger */
	console.log("dashboard.status");

	$scope.chartOptions = {
		segementStrokeWidth: 20,
		barStrokeColor: "#000"
	};

	/* Screen Functionnalities*/
	async function getData() {
		{
			let result = await status.getRoverSatellites();
			// console.log(result);

			const labels = [];

			const roverSat = [];
			const baseSat = [];

			const nbSat = result.length;

			result = arrays.sortByKey<IRoverSatData>(result, "name");

			for (let i = 0; i < nbSat; i++) {
				const currentSat = result[i];
				// console.log(currentSat);
				labels.push(currentSat.name);
				roverSat.push(currentSat.snr);
				baseSat.push(0);
			}

			$scope.satRoverDatas = {
				labels,
				datasets: [
					{
						label: "rover",
						fillColor: "lightgreen", // DROTEK Color
						data: roverSat
					}
				]

			};
		}
		{
			let result = await status.getBaseSatellites();
			// console.log(result);

			const labels = [];

			const baseSat = [];

			result = arrays.sortByKey(result, "name");

			const nbSat = result.length;
			for (let i = 0; i < nbSat; i++) {
				const currentSat = result[i];
				// console.log(currentSat);
				labels.push(currentSat.name);
				baseSat.push(currentSat.cno);
			}

			$scope.satBaseDatas = {
				labels,
				datasets: [
					{
						label: "rover",
						fillColor: "lightgreen", // DROTEK Color
						data: baseSat
					}
				]

			};
		}

		{
			$rootScope.$on("rtkrcv:position", (e, msg: IPositionMessage) => {
				console.log("updating last position", msg);

				const lastPosition = msg.position;
				if (lastPosition) {
					if (lastPosition.quality_flag === 1) {
						$scope.lastStatus = "FIX";
					} else if (lastPosition.quality_flag === 2) {
						$scope.lastStatus = "FLOAT";
					} else if (lastPosition.quality_flag === 5) {
						$scope.lastStatus = "SINGLE";
					}

					$scope.lastLat = lastPosition.latitude;
					$scope.lastLng = lastPosition.longitude;
					$scope.lastAlt = lastPosition.height;
					$scope.$apply();
				}
			});
		}
	}

	$scope.refresh = async ($event: angular.IAngularEvent) => {
		$event.stopPropagation();

		await getData();
	};

	/* Loading Process*/
	await getData();

}
