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
import _ = require("lodash");

export interface ISatData {
	name: string;
	type: string;
	gnssId: number;
	svId: number;
	cno: number;
}

export interface IRoverSatData {
	"name": string;
	"snr": string;
}

export interface IStatus {
	[name: string]: string;
}

export interface ISatellite {
	SAT: string;
	C1: string;
	Az: number;
	El: number;
	L1: number;
	L2: number;
	Fix1: string;
	Fix2: string;
	P1Res: number;
	P2Res: number;
	L1Res: number;
	L2Res: number;
	Sl1: number;
	Sl2: number;
	Lock1: number;
	Lock2: number;
	Rj1: number;
	Rj2: number;
}

export interface IObserv {
	timestamp: Date;
	SAT: string;
	R: number;
	P1: number;
	P2: number;
	L1: number;
	L2: number;
	D1: number;
	D2: number;
	S1: number;
	S2: number;
	LLI1: number;
	LLI2: number;
}

export interface ISATData {
	SAT: string;
	S: string;
	IOD: number;
	IOC: number;
	FRQ: number;
	AA: number;
	SVH: string;
	Toe: Date;
	Toc: Date;
	TtrTof: Date;
	L2C: number;
	L2P: number;
}

export interface INaviData {
	SAT: ISATData[];
	ION: number[];
	UTC: number[];
	LEAPS: number;
}

export interface IStream {
	stream: string;
	type: string;
	fmt: string;
	S: string;
	in_byte: number;
	in_bps: number;
	out_byte: number;
	out_bps: number;
	path: string;
	message: string;
}

export interface IStatusService {
	getRoverSatellites(): Promise<IRoverSatData[]>;
	getBaseSatellites(): Promise<ISatData[]>;

	get_status(): Promise<IStatus>;

	get_satellite(): Promise<ISatellite[]>;

	get_observ(): Promise<IObserv[]>;

	get_navidata(): Promise<INaviData>;

	get_stream(): Promise<IStream[]>;
}

export default function() {
	return {
		$get: /*@ngInject*/  ($http: angular.IHttpService, $rootScope: angular.IRootScopeService) => {
			console.log("initializing status service");
			/* Déclaration des variables utilisées dans le service */

			// Opérations disponibles pour le service status.
			const service: IStatusService = {
				getRoverSatellites,
				getBaseSatellites,

				get_status,
				get_satellite,
				get_observ,
				get_navidata,
				get_stream
			};

			return service;

			async function get_status(): Promise < IStatus > {
				const response = await $http({
					method: "GET",
					url: $rootScope.host + ":3002/getStatus"
				});
				return response.data as IStatus;
			}

			async function get_satellite(): Promise < ISatellite[] > {
				const response = await $http({
					method: "GET",
					url: $rootScope.host + ":3002/getSatellite"
				});
				return response.data as ISatellite[];
			}

			async function get_observ(): Promise < IObserv[] > {
				const response = await $http({
					method: "GET",
					url: $rootScope.host + ":3002/getObserv"
				});
				return response.data as IObserv[];
			}

			async function get_navidata(): Promise < INaviData > {
				const response = await $http({
					method: "GET",
					url: $rootScope.host + ":3002/getNavidata"
				});
				return response.data as INaviData;
			}

			async function get_stream(): Promise < IStream[] > {
				const response = await $http({
					method: "GET",
					url: $rootScope.host + ":3002/getStream"
				});
				return response.data as IStream[];
			}

			/* Définition des fonctions du service de status */

			async function getRoverSatellites(): Promise<IRoverSatData[]> {

				const response = await $http({
					method: "GET",
					url: $rootScope.host + ":3000/roverSatellites"
				});
				const listSatellites = response.data as { fileName: string, nbLine: number, listSatData: string[] };
				return filter(listSatellites.listSatData);

			}

			async function getBaseSatellites(): Promise<ISatData[]> {

				const response = await $http({
					method: "GET",
					url: $rootScope.host + ":3000/baseSatellites"
				});
				const listSatellites = response.data as { name: string, listSatData: ISatData[] };
				return listSatellites.listSatData;

			}

			function filter(listData: string[]) {
				const result: IRoverSatData[] = [];

				if (!listData || listData.length === 0) {
					return result;
				}

				// $SAT,week,tow,sat,frq,az,el,resp,resc,vsat,snr,fix,slip,lock,outc,slipc,rejc
				let index = 0;
				let currentLine = listData[index].split(",");

				if (currentLine.length < 4) {
					index++;
					currentLine = listData[index].split(",");
				}

				let referenceWeek = currentLine[1];
				let referenceTow = currentLine[2];

				// In case of partial result (RTKLib currently writting sat datas)
				// --> ignore last sat datas
				do {
					index++;
					currentLine = listData[index].split(",");
				} while (currentLine[1] === referenceWeek && currentLine[2] === referenceTow);

				referenceWeek = currentLine[1];
				referenceTow = currentLine[2];

				do {
					result.push({
						name: currentLine[3],
						snr: currentLine[10]
					});

					index++;

					currentLine = listData[index].split(",");

				} while (currentLine[1] === referenceWeek && currentLine[2] === referenceTow);

				return result;
			}

			// fin - Définition des fonctions du service

		}
	};
}
