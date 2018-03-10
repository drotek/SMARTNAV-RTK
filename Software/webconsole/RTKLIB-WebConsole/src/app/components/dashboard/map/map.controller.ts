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
import { IGpsFactory } from "../../../shared/factories/gps.factory";
import { ILiveDataService, IPosition, IPositionMessage, QualityMap } from "../../../shared/services/live-data.service";

export interface IScaleMap {
	[id: string]: number;
}

export interface IMapScope extends angular.IScope {
	scale: IScaleMap;
	selectedScale: number;
	lastPosition: IPosition;
	positions: IPosition[];
	qualityMap: { [id: number]: string };
}

export default /*@ngInject*/ async function(
	$scope: IMapScope, $rootScope: angular.IRootScopeService, gps: IGpsFactory,
	$window: angular.IWindowService, livedata: ILiveDataService) {

	/* Déclaration du logger */
	console.log("dashboard.map");

	$scope = angular.extend($scope, {
		scale: {
			"0.25 meter": 37 * 4,
			"0.5 meter": 37 * 2,
			"1 meter": 37,
			"2 meters": 37 / 2,
			"3 meters": 37 / 3,
			"4 meters": 37 / 4,
			"5 meters": 37 / 5,
			"10 meters": 37 / 10,
			"25 meters": 37 / 25,
			"50 meters": 37 / 50,
			"100 meters": 37 / 100,
			"1000 meters": 37 / 1000,
		} as IScaleMap,
		qualityMap: QualityMap as { [id: number]: string },
		selectedScale: undefined,
		lastPosition: null,
		positions: [],
	} as IMapScope);

	const registered_rtkrcv_position = $rootScope.$on("rtkrcv:position", (e, msg: IPositionMessage) => {
		console.log("updating last position", msg);
		$scope.lastPosition = msg.position;
		$scope.positions.push(msg.position);
		$scope.$apply();
		getData();
	});

	/* Watch Expressions */
	$scope.$watch(() => {
		return $scope.selectedScale;
	}, (newVal) => {
		if (typeof newVal !== "undefined") {
			getData();
		}
	});

	/* Target Rendering */
	const radar = document.getElementById("radar");
	const canvas = document.getElementById("chart") as HTMLCanvasElement;
	const ctx = canvas.getContext("2d");

	let scaleInitialized = false;

	let zoom = 1;
	const diameter = 300;
	if ($rootScope.isDesktop) {
		zoom = ($window.innerHeight - 250) / diameter;
	}

	canvas.width = zoom * diameter;
	canvas.height = zoom * diameter;

	const radius = diameter / 2;
	const padding = 14;
	const rings = 4;
	const saturation = 50;
	const lightness = 400;
	const lineWidth = 2 / zoom;

	radar.style.marginLeft = radar.style.marginTop = (-zoom * diameter / 2) - padding + "px";
	radar.style.minWidth = (zoom * diameter) + "px";
	radar.style.minHeight = (zoom * diameter) + "px";

	const renderRings = () => {
		let i;
		for (i = 0; i < rings; i++) {
			ctx.beginPath();
			ctx.arc(radius, radius, ((radius - (lineWidth / 2)) / rings) * (i + 1), 0, 2 * Math.PI, false);
			ctx.strokeStyle = "green";
			ctx.lineWidth = lineWidth;
			ctx.stroke();
		}
	};

	const renderGrid = () => {
		ctx.beginPath();
		ctx.moveTo(radius - lineWidth / 2, lineWidth);
		ctx.lineTo(radius - lineWidth / 2, diameter - lineWidth);
		ctx.moveTo(lineWidth, radius - lineWidth / 2);
		ctx.lineTo(diameter - lineWidth, radius - lineWidth / 2);
		ctx.strokeStyle = "green";
		ctx.stroke();
	};

	const renderScanLines = () => {
		ctx.beginPath();
		for (let i = 0; i < diameter; i += 2) {
			ctx.moveTo(0, i + .5);
			ctx.lineTo(diameter, i + .5);
		}
		ctx.lineWidth = 1;
		ctx.strokeStyle = "hsla( 0, 0%, 0%, .02 )";
		ctx.globalCompositeOperation = "source-over";
		ctx.stroke();
	};

	const renderPoints = async () => {

		const result = $scope.positions;

		if ($scope.positions && $scope.positions.length > 0) {
			const baseEcef = gps.llatoecef({
				lat: $scope.lastPosition.latitude,
				lng: $scope.lastPosition.longitude,
				alt: $scope.lastPosition.height
			});

			const listPointsToRender = [];
			let nbPoints = 0;
			let xTotal = 0;
			let yTotal = 0;

			const nbPosition = result.length;
			for (let i = 0; i < nbPosition; i++) {
				const currentPosition = result[i];

				const parsedPosition = gps.llatoecef({
					lat: currentPosition.latitude,
					lng: currentPosition.longitude,
					alt: currentPosition.height
				});

				const currentLla = gps.eceftolla(parsedPosition);
				const currentEnu = gps.eceftoenu(baseEcef, parsedPosition, currentLla);

				const mapCoordX = 148 + currentEnu.north * $scope.selectedScale; // 1m = 37 , 2m = 18.5, 4m = 9.25
				const mapCoordY = 148 + currentEnu.east * $scope.selectedScale;

				listPointsToRender.push({
					status: currentPosition.quality_flag,
					x: currentEnu.north,
					y: currentEnu.east
				});

				nbPoints++;

				xTotal += currentEnu.north;
				yTotal += currentEnu.east;

			}

			const translationCoordinates = {
				x: xTotal / nbPoints,
				y: yTotal / nbPoints
			};

			listPointsToRender.forEach((currentPoint) => {
				if (currentPoint.status === 1) {
					ctx.fillStyle = "#00FF00";
				} else if (currentPoint.status === 2) {
					ctx.fillStyle = "yellow";
				} else if (currentPoint.status === 5) {
					ctx.fillStyle = "red";
				}
				const mapCoordX = 148 +
					(currentPoint.x - translationCoordinates.x) * $scope.selectedScale; // 1m = 37 , 2m = 18.5, 4m = 9.25
				const mapCoordY = 148 +
					(currentPoint.y - translationCoordinates.y) * $scope.selectedScale;

				ctx.fillRect(mapCoordX,
					mapCoordY,
					3 / zoom,
					3 / zoom);
			});

		}

	};

	function clear() {
		ctx.globalCompositeOperation = "destination-out";
		ctx.fillStyle = "hsla( 0, 0%, 0%, 0.1 )";
		ctx.fillRect(0, 0, diameter, diameter);
	}

	function draw() {
		ctx.globalCompositeOperation = "lighter";
		renderRings();
		renderGrid();
		renderPoints();
	}

	function getData() {
		if (!scaleInitialized) {
			ctx.scale(zoom, zoom);
			scaleInitialized = true;
		}
		ctx.clearRect(0, 0, zoom * 300, zoom * 300);
		draw();
	}

	/* Loading Process */
	$scope.selectedScale = $scope.scale["2 meters"];

	$scope.$on("$destroy", () => {
		console.log("destroy map.controller");
		registered_rtkrcv_position();
	});

}
