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
import _ = require('lodash');

export interface IBasePosition {
    pos1: string;
    pos2: string;
    pos3: string;
    postype: string;
}

export interface IPosition {
    fileName: string;
    nbLine: number;
    listPosData: string[];
}

export interface IFilteredPositions {
    'status': string;
    'x': string;
    'y': string;
    'z': string;
}

export interface IMapService {
    getBasePosition(): angular.IPromise<IBasePosition>;
    getPositions(): angular.IPromise<IFilteredPositions[]>;
    getLastPosition(): angular.IPromise<IFilteredPositions[]>;
}

export default function () {
    return {
        $get: /*@ngInject*/ function ($http: angular.IHttpService, $rootScope: angular.IRootScopeService) {

            /* Déclaration des variables utilisées dans le service */

            /**
            * Opérations disponibles pour le service map.
            */
            var service: IMapService = {
                getLastPosition: getLastPosition,
                getPositions: getPositions,
                getBasePosition: getBasePosition
            };

            return service;

            /* Définition des fonctions du service de map */

            function getBasePosition() {

                return $http({
                    method: 'GET',
                    url: $rootScope.host + ':3000/basePosition'
                }).then(function (response) {
                    return response.data as IBasePosition;
                }).then(function (position) {
                    return position;
                });

            }

            function getPositions() {

                return $http({
                    method: 'GET',
                    url: $rootScope.host + ':3000/positions'
                }).then(function (response) {
                    return response.data as IPosition;
                }).then(function (listPositions) {
                    return filter(listPositions.listPosData);
                });

            }

            function getLastPosition() {

                return $http({
                    method: 'GET',
                    url: $rootScope.host + ':3000/positions?nbPos=1'
                }).then(function (response) {
                    return response.data as IPosition;
                }).then(function (listPositions) {
                    return filter(listPositions.listPosData);
                });

            }

            function filter(listData: string[]): IFilteredPositions[] {
                var result = [];

                //$POS,week,tow,stat,posx,posy,posz,posxf,posyf,poszf

                var nbPosition = listData.length;
                for (var i = 0; i < nbPosition; i++) {
                    var currentLine = listData[i].split(",");
                    var status = currentLine[3];

                    var decal = 0;
                    if (status === "1" || status === "5") { // is Fix
                        result.push({
                            'status': status,
                            'x': currentLine[7],
                            'y': currentLine[8],
                            'z': currentLine[9]
                        });
                    } else if (status === "2") { // is Float
                        result.push({
                            'status': status,
                            'x': currentLine[4],
                            'y': currentLine[5],
                            'z': currentLine[6]
                        });
                    }
                }

                return result;
            }

            // fin - Définition des fonctions du service


        }
    };
};