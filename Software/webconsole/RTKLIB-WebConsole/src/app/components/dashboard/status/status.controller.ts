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

import { INaviData, IObserv, IRoverSatData, ISatellite, IStatus, IStatusService, IStream } from "../../../shared/services/status.service";

import { ILiveDataService, IPosition, IPositionMessage, QualityMap } from "../../../shared/services/live-data.service";

export interface IStatusScope extends angular.IScope {
	chartOptions: { segementStrokeWidth: number; barStrokeColor: string };
	status: IStatus;
	satellites: ISatellite[];
	observ: IObserv[];
	navidata: INaviData;
	stream: IStream[];
}

export default /*@ngInject*/ async function(
	$scope: IStatusScope,
	$rootScope: angular.IRootScopeService,
	status: IStatusService,
	arrays: IArraysFactory,
	gps: IGpsFactory,
	livedata: ILiveDataService,
	toastr: angular.toastr.IToastrService
) {

	/* Déclaration du logger */
	console.log("dashboard.status");

	$scope.chartOptions = {
		segementStrokeWidth: 20,
		barStrokeColor: "#000"
	};

	$scope.labels = ["1", "2", "3"];
	$scope.series = ["Rover", "Base"];
	$scope.data = [[5, 10, 15], [6, 11, 16]];
	$scope.colors = ["lightgreen", "green"];
	// $scope.colors = [
	// 	{ // grey
	// 		backgroundColor: "rgba(148,159,177,0.2)",
	// 		pointBackgroundColor: "rgba(148,159,177,1)",
	// 		pointHoverBackgroundColor: "rgba(148,159,177,1)",
	// 		borderColor: "rgba(148,159,177,1)",
	// 		pointBorderColor: "#fff",
	// 		pointHoverBorderColor: "rgba(148,159,177,0.8)"
	// 	},
	// 	{ // dark grey
	// 		backgroundColor: "rgba(77,83,96,0.2)",
	// 		pointBackgroundColor: "rgba(77,83,96,1)",
	// 		pointHoverBackgroundColor: "rgba(77,83,96,1)",
	// 		borderColor: "rgba(77,83,96,1)",
	// 		pointBorderColor: "#fff",
	// 		pointHoverBorderColor: "rgba(77,83,96,0.8)"
	// 	}
	// ];

	// function getRandomColor() {
	//     let letters = '0123456789ABCDEF'.split('');
	//     let color = '#';
	//     for (let i = 0; i < 6; i++) {
	//         color += letters[Math.floor(Math.random() * 16)];
	//     }
	//     return color;
	// }

	// $scope.colors = Array.apply(null, Array(50)).map(getRandomColor) ;

	$scope.options = {
		animation: {
			duration: 100
		},
		responsive: true,
		maintainAspectRatio: false,
		// height: "200px",
		elements: {
			line: {
				borderWidth: 0.5
			},
			point: {
				radius: 0
			}
		},
		legend: {
			display: false
		},
		scales: {
			xAxes: [{
				display: true,
				ticks: {
					stepSize: 10
				}
			}],
			yAxes: [{
				display: true,
				ticks: {
					stepSize: 10
				}
			}],
			gridLines: {
				display: false
			}
		},
		tooltips: {
			enabled: true
		}
	};

	async function refresh() {
		try {
			$scope.status = await status.get_status();
		} catch (e) {
			console.log("error getting status", e);
			toastr.error("Error Getting Status");
		}
		// $scope.satellites = await status.get_satellite();
		try {
			$scope.observ = await status.get_observ();
		} catch (e) {
			console.log("error getting observation", e);
			toastr.error("Error Getting Observation");
		}

		let base_labels: string[]; base_labels = [];
		let base_snr: number[]; base_snr = [];

		let rover_labels: string[]; rover_labels = [];
		let rover_snr: number[]; rover_snr = [];

		// console.log("SAT INFO", $scope.satellites);

		$scope.observ.forEach((obs) => {
			base_labels.push(obs.SAT);
			rover_labels.push(obs.SAT);
			rover_snr.push(obs.S1);
			base_snr.push(obs.S2);
		});

		console.log("labels", rover_labels);
		$scope.labels = rover_labels;
		$scope.data = [rover_snr, base_snr];

		// $scope.satRoverDatas = {
		// 	labels: rover_labels,
		// 	datasets: [
		// 		{
		// 			label: "rover",
		// 			fillColor: "lightgreen", // DROTEK Color
		// 			data: rover_snr
		// 		}
		// 	]

		// };

		// $scope.satBaseDatas = {
		// 	labels: base_labels,
		// 	datasets: [
		// 		{
		// 			label: "base",
		// 			fillColor: "lightgreen", // DROTEK Color
		// 			data: base_snr
		// 		}
		// 	]

		// };

		// $scope.navidata = await status.get_navidata();
		// $scope.stream = await status.get_stream();
	}

	/* Screen Functionnalities*/
	const registered_rtkrcv_position = $rootScope.$on("rtkrcv:position", async (e, msg: IPositionMessage) => {
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

			should_update = true;
		}

	});

	await refresh();

	// update interval

	let should_update = false;
	let updating = false;

	const update_interval = setInterval(async () => {
		if (updating === true) {
			return;
		}
		updating = true;
		if (should_update) {
			await refresh();
			should_update = false;
		}
		updating = false;
	}, 1000);

	$scope.$on("$destroy", () => {
		console.log("destroy status.controller");
		registered_rtkrcv_position();
	});
}
