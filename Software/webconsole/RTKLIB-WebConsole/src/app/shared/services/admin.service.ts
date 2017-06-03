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

export interface IModuleResponse {
    error?: Error;
    stdout?: string;
    stderr?: string;
    isActive?: boolean;
    isEnabled?: boolean;
}

export interface portConfig {
    comName: string;
    manufacturer: string;
    serialNumber: string;
    pnpId: string;
    locationId: string;
    vendorId: string;
    productId: string;
}

export interface IAdminService {
    adminService(command: string, config?: string): angular.IPromise<IModuleResponse>;
    getConfigType(): angular.IPromise<IModuleResponse>;
    getActiveMode(): string;

    updatePlatform(): angular.IPromise<IModuleResponse>;
    syncTime(): angular.IPromise<IModuleResponse>;

    listPorts() : angular.IPromise<portConfig[]>
}



export default function () {
    return {
        $get: /*@ngInject*/ function ($http: angular.IHttpService, $rootScope: angular.IRootScopeService) {

            /* Déclaration des variables utilisées dans le service */
            var activeMode = '';

            /**
            * Opérations disponibles pour le service configuration.
            */
            var service: IAdminService = {
                adminService: adminService,
                getConfigType: getConfigType,
                getActiveMode: getActiveMode,
                updatePlatform: updatePlatform,
                listPorts : listPorts,
                syncTime: syncTime
            };

            return service;

            /* Définition des fonctions du service de configuration */


            function adminService(command: string, config?: string) {

                var url = $rootScope.host + ':3000/service'

                var configType = $rootScope.confType;
                if (config) {
                    configType = config;
                }

                var params = {
                    commandType: command,
                    configType: configType
                }

                return $http({
                    method: 'POST',
                    url: url,
                    data: params
                }).then((response) => {
                    //console.log(response.data);
                    return <IModuleResponse>response.data;
                });

            }

            function getActiveMode() {
                return activeMode;
            }

            function getConfigType() {
                return adminService('status', 'ROVER').then((response) => {
                    console.log('status ROVER ', response);
                    if (response.isEnabled === true) {
                        console.log('ROVER enable');
                        activeMode = 'ROVER';
                        return response;
                    } else {
                        return adminService('status', 'BASE').then(function (response2) {
                            console.log('status BASE ', response2);
                            if (response2.isEnabled === true) {
                                console.log('BASE enable');
                                activeMode = 'BASE';
                            }
                            return response2;
                        });
                    }


                });
            }

            function updatePlatform() {
                var url = $rootScope.host + ':3000/updatePlatform'

                return $http({
                    method: 'GET',
                    url: url
                }).then(function (response) {
                    //console.log(response.data);
                    return response.data as IModuleResponse;
                });
            }

            function syncTime() {
                var url = $rootScope.host + ':3000/syncTime'

                return $http({
                    method: 'GET',
                    url: url
                }).then(function (response) {
                    //console.log(response.data);
                    return response.data;
                });
            }

            function listPorts() : angular.IPromise<portConfig[]>{
                var url = $rootScope.host + ':3000/listPorts'

                return $http({
                    method: 'GET',
                    url: url
                }).then(function (response) {
                    return response.data;
                });
            }

            // fin - Définition des fonctions du service


        }
    };
};