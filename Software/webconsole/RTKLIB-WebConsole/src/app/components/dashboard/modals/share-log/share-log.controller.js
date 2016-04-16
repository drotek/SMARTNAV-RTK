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

module.exports = /*@ngInject*/ function ($scope, log, $modalInstance) {

    /* Controller parameters */
    $scope = angular.extend($scope, {
        mailAdress: 'x@y.com',
        downloadFile: undefined,
		logFiles: undefined
    });
    
    log.getListLogFiles().then(function(result){
        $scope.logFiles = result;
        $scope.downloadFile = result[0];
    });
    
    /**
     * Function called to share log file
     */
    $scope.ok = function () {
        log.getLogFile($scope.downloadFile).then(function(result){
            
            var blob = new Blob([result], {type: 'text/plain;charset=utf-8'});
            
            var formattedBody = result;
            var mailToLink = 'mailto:'+$scope.mailAdress+'?subject=[RTKLIB Web Console] '+$scope.downloadFile+'&body=' + encodeURIComponent(formattedBody);
            window.location.href = mailToLink;
            
            $modalInstance.close();
        });
    };

    /**
     * Function called to cancel the share.
     */
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
}