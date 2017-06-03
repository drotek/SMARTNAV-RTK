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
import angular_toastr = require("angular-toastr");
import { IAdminService } from "../../shared/services/admin.service";

export default /*@ngInject*/ function ($scope: angular.IScope, admin: IAdminService, $rootScope: angular.IRootScopeService, toastr: any) {

    /* Déclaration du logger */
    console.log('dashboard');

    /* Déclaration des variables utilisées dans le controlleur */
    $scope = angular.extend($scope, {
        showMenu: true,
        isMenuOpen: false
    });

    /* Watch Expressions */
    $scope.$watch(() => {
        return admin.getActiveMode();
    }, (newVal) => {
        if (typeof newVal !== 'undefined') {
            checkMode(newVal);
        }
    });

    $scope.switchMenu = () => {
        $scope.isMenuOpen = !$scope.isMenuOpen;
    };

    function checkMode(newVal: string) {
        $scope.showMenu = newVal === 'ROVER';
    };

    /* Loading Process */
    admin.getConfigType();

    $rootScope.$on("unhandledException", (e, err: string, cause) => {
        toastr.error(err.substr(0, err.indexOf(":")), 'Error');
    });

};