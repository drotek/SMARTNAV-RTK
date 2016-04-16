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

module.exports = /*@ngInject*/ function ($scope, configuration, admin, $modalInstance, mode,
                                         requiredParams, advancedParams, otherParams, cmdParams,
                                         outputType, outputValue) {

    /* Controller parameters */
    $scope.mode = mode;
    $scope.requiredParameters = requiredParams;
	$scope.advancedParameters = advancedParams;
	$scope.otherParameters = otherParams;
    $scope.cmdParameters = cmdParams;
    $scope.outputType = outputType;
    $scope.outputValue = outputValue;
 
    $scope.isRover = $scope.mode === 'ROVER';
    $scope.isBase = $scope.mode === 'BASE';
    
    $scope.loading = false;
    
    /**
     * Function called to push config file
     */
    $scope.ok = function () {
        $scope.loading = true;
        stopRunningService(pushAndStart);
    };
    
    function pushAndStart (shouldEnable) {
        if($scope.isRover){
            configuration.saveFile({
                'requiredParameters': $scope.requiredParameters, 
                'advancedParameters': $scope.advancedParameters,
                'otherParameters': $scope.otherParameters,
                'cmdParameters': $scope.cmdParameters
            }).then(function(){
                if(shouldEnable){
                    admin.adminService('enable',$scope.mode).then(function(){
                        admin.adminService('start',$scope.mode).then(function(){
                            admin.getConfigType();
                            $scope.loading = false;
                            $modalInstance.close();
                        });
                    });
                }else{
                    admin.adminService('start',$scope.mode).then(function(){
                        admin.getConfigType();
                        $scope.loading = false;
                        $modalInstance.close();
                    });
                }
            });
        }else if($scope.isBase){
            configuration.saveBaseCmdFile({
                'cmdParameters': $scope.cmdParameters
            }).then(function(){
                var out = $scope.outputType + '://';
                if($scope.outputType === 'tcpsvr'){
                    out = out + ':'
                }
                out = out + $scope.outputValue;

                configuration.saveRunBase({
                    'out': out
                }).then(function(){
                    if(shouldEnable){
                        admin.adminService('enable',$scope.mode).then(function(){
                            admin.adminService('start',$scope.mode).then(function(){
                                admin.getConfigType();
                                $scope.loading = false;
                                $modalInstance.close();
                            });
                        });
                    }else{
                        admin.adminService('start',$scope.mode).then(function(){
                            admin.getConfigType();
                            $scope.loading = false;
                            $modalInstance.close();
                        });
                    }
                });
            });
        }
    }
    
    function stopRunningService (callback) {
        admin.adminService('status','ROVER').then(function(response){
                if(response.isActive){
                    admin.adminService('stop','ROVER').then(function(){
                        if($scope.isRover === false){
                            admin.adminService('disable','ROVER').then(function(){
                                callback(true);
                            });
                        }else{
                            callback(false);
                        }
                    });       
                }else if(response.isEnabled){
                    if($scope.isRover === false){
                        admin.adminService('disable','ROVER').then(function(){
                            callback(true);
                        });
                    }else{
                        callback(false);
                    }
                }else{
                    admin.adminService('status','BASE').then(function(response){  
                        if(response.isActive){
                            admin.adminService('stop','BASE').then(function(){
                                if($scope.isBase === false){
                                    admin.adminService('disable','BASE').then(function(){
                                        callback(true);
                                    });
                                }else{
                                    callback(false);
                                }
                            });       
                        }else if(response.isEnabled){
                            if($scope.isBase === false){
                                admin.adminService('disable','BASE').then(function(){
                                    callback(true);
                                });
                            }else{
                                callback(false);
                            }
                        }
                    });
                }
        });
    }

    /**
     * Function called to cancel the push.
     */
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
}