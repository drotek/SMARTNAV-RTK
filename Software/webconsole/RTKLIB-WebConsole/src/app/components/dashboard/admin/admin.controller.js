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

'use strict';

module.exports = /*@ngInject*/ function ($scope, log, admin, configuration, $modal, $rootScope) {

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
        isRover: true
    });
    
    /* Watch Expressions */
    $scope.$watch(function () {
		return admin.getActiveMode();
    }, function (newVal) {
		if (typeof newVal !== 'undefined') {
            console.log('admin.getActiveMode() ' + newVal);
            $rootScope.confType = newVal;
            checkMode();
		}
    });
  
	$scope.exportLog = function($event){
		$event.stopPropagation();

        var modalInstance = $modal.open({
          animation: true,
          template: require('../modals/export-log/export-log.html'),
          controller: require('../modals/export-log/export-log.controller.js'),
        });

        modalInstance.result.then(function () { // returned input on ok
          console.log('Log exported');
        }, function () {
          console.log('Export log modal dismissed at: ' + new Date());
        });
	};
    
    /* Screen Functionnalities */ 
    function refreshStatus(){
        admin.adminService('status').then(function(response){
            if(response){
                $scope.isServiceActive = response.isActive;
            }
        });
    }
    
    $scope.start = function($event){
		$event.stopPropagation();

        admin.adminService('start').then(function(response){
            if(response.error){
                console.log(response.error);
            }
            refreshStatus();
        });
	};
    
    $scope.stop = function($event){
		$event.stopPropagation();

        admin.adminService('stop').then(function(response){
            if(response.error){
                console.log(response.error);
            }
            refreshStatus();
        });
	};
    
    $scope.exportUbx = function($event){
		$event.stopPropagation();

        var modalInstance = $modal.open({
          animation: true,
          template: require('../modals/export-ubx/export-ubx.html'),
          controller: require('../modals/export-ubx/export-ubx.controller.js'),
        });

        modalInstance.result.then(function () { // returned input on ok
          console.log('Ubx exported');
        }, function () {
          console.log('Export ubx modal dismissed at: ' + new Date());
        });
	};
    
    $scope.share = function($event){
		$event.stopPropagation();

        var modalInstance = $modal.open({
          animation: true,
          template: require('../modals/share-log/share-log.html'),
          controller: require('../modals/share-log/share-log.controller.js'),
        });

        modalInstance.result.then(function () { // returned input on ok
          console.log('Log shared');
        }, function () {
          console.log('share log modal dismissed at: ' + new Date());
        });
	};
    
    $scope.syncTime = function($event){
		$event.stopPropagation();

        admin.syncTime().then(function(response){
            if(response.error){
                console.log(response.error);
            }
        });
	};
    
    $scope.updatePlatform = function($event){
		$event.stopPropagation();

        var modalInstance = $modal.open({
          animation: true,
          template: require('../modals/update-platform/update-platform.html'),
          controller: require('../modals/update-platform/update-platform.controller.js'),
        });

        modalInstance.result.then(function () { // returned input on ok
          console.log('Platform updated');
        }, function () {
          console.log('Update platform modal dismissed at: ' + new Date());
        });
	};
    
    function checkMode (){
        $scope.isRover = $rootScope.confType === 'ROVER';
    };
    
    /* Loading Process */ 
    admin.getConfigType().then(function(response){
        if(response && response.isActive){
            $scope.isServiceActive = response.isActive === true;
        }
    });
	

};