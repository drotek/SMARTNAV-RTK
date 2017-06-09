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

///// <reference path="../../../../../node_modules/@types/angular/index.d.ts" />
import angular = require("angular");
import angular_ui_bootstrap = require('angular-ui-bootstrap');
import angular_toastr = require("angular-toastr");

import { ILogService } from "../../../shared/services/log.service";
import { IAdminService } from "../../../shared/services/admin.service";
import { IConfigurationService } from "../../../shared/services/configuration.service";

import export_log_controller from "../modals/export-log/export-log.controller";
import export_ubx_controller from '../modals/export-ubx/export-ubx.controller';
import share_log_controller from '../modals/share-log/share-log.controller';
import update_platform_controller from '../modals/update-platform/update-platform.controller';

export default /*@ngInject*/ function ($scope: angular.IScope, log: ILogService, admin: IAdminService, configuration: IConfigurationService,
    $modal: angular_ui_bootstrap.IModalService, $rootScope: angular.IRootScopeService, toastr: angular.toastr.IToastrService) {

    /* Déclaration du logger */
    console.log('dashboard.admin');

    /* Déclaration des variables utilisées dans le controlleur */
    $scope = angular.extend($scope, {
        oneAtATime: false,
        status: {
            isServiceOpen: true,
            isLogsOpen: true,
            isUpdateOpen: true,
            isFirstDisabled: false
        },
        isServiceActive: false,
        logFiles: [],
        confType: $rootScope.confType //ROVER/BASE
        //isRover: true
    });

    /* Watch Expressions */
    // $scope.$watch(() => {
    //     return admin.getActiveMode();
    // }, (newVal) => {
    //     if (typeof newVal !== 'undefined') {
    //         console.log('admin.getActiveMode() ' + newVal);
    //         $rootScope.confType = newVal;
    //         checkMode();
    //     }
    // });

    $scope.exportLog = ($event: angular.IAngularEvent) => {
        $event.stopPropagation();

        var modalInstance = $modal.open({
            animation: true,
            template: require('../modals/export-log/export-log.html'),
            controller: export_log_controller,
        });

        modalInstance.result.then(function () { // returned input on ok
            console.log('Log exported');
            toastr.info('Log exported');
        }, () => {
            console.log('Export log modal dismissed at: ' + new Date());

        });
    };

    /* Screen Functionnalities */
    function refreshStatus() {
        admin.adminService('status').then((response) => {
            if (response) {
                $scope.isServiceActive = response.isActive;
                if (response.error || response.stderr) {
                    toastr.error((response.error) ? response.error.message : "" + response.stderr, 'Error Getting Status');
                }
            }
        });
    }

    $scope.start = ($event: angular.IAngularEvent) => {
        $event.stopPropagation();

        admin.adminService('start').then((response) => {
            if (response && response.error) {
                console.log(response);
                toastr.error((response.error) ? response.error.message : "" + response.stderr, 'Error Starting Service');
            }
            refreshStatus();
        });
    };

    $scope.stop = ($event: angular.IAngularEvent) => {
        $event.stopPropagation();

        admin.adminService('stop').then((response) => {
            if (response.error) {
                console.log(response.error);
                toastr.error((response.error) ? response.error.message : "" + response.stderr, 'Error Stopping Service');
            }
            refreshStatus();
        });
    };

    $scope.exportUbx = ($event: angular.IAngularEvent) => {
        $event.stopPropagation();

        var modalInstance = $modal.open({
            animation: true,
            template: require('../modals/export-ubx/export-ubx.html'),
            controller: export_ubx_controller,
        });

        modalInstance.result.then(() => { // returned input on ok
            console.log('Ubx exported');
            toastr.info('Ubx exported');
        }, function () {
            console.log('Export ubx modal dismissed at: ' + new Date());
        });
    };

    $scope.share = ($event: angular.IAngularEvent) => {
        $event.stopPropagation();

        var modalInstance = $modal.open({
            animation: true,
            template: require('../modals/share-log/share-log.html'),
            controller: share_log_controller,
        });

        modalInstance.result.then(() => { // returned input on ok
            console.log('Log shared');
            toastr.info('Log shared');
        }, function () {
            console.log('share log modal dismissed at: ' + new Date());
        });
    };

    $scope.syncTime = ($event: angular.IAngularEvent) => {
        $event.stopPropagation();

        admin.syncTime().then((response) => {
            if (response.error) {
                console.log(response.error);
                toastr.error((response.error) ? response.error.message : "" + response.stderr, 'Error Syncing Time');
            }
        });
    };

    $scope.updatePlatform = ($event: angular.IAngularEvent) => {
        $event.stopPropagation();

        var modalInstance = $modal.open({
            animation: true,
            template: require('../modals/update-platform/update-platform.html'),
            controller: update_platform_controller,
        });

        modalInstance.result.then(() => { // returned input on ok
            console.log('Platform updated');
            toastr.error('Platform updated');
        }, function () {
            console.log('Update platform modal dismissed at: ' + new Date());
        });
    };

    function checkMode() {
        //$scope.isRover = $rootScope.confType === 'ROVER';
        $scope.confType = $rootScope.confType;
    };

    /* Loading Process */
    // admin.getConfigType().then((response) => {
    //     if (response && response.isActive) {
    //         $scope.isServiceActive = response.isActive === true;
    //     }
    //     if (response.error) {
    //         console.log(response.error);
    //         toastr.error(response.error || "" + response.stderr, 'Error Getting Config');
    //     }
    // });

    setInterval(refreshStatus, 5000);

};