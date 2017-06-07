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
import angular_ui_bootstrap = require('angular-ui-bootstrap');

import { IAdminService } from "../../../../shared/services/admin.service";
import { IConfigurationService,IParameter,IStreamInfo } from "../../../../shared/services/configuration.service";

export interface IPushConfScope extends angular.IScope{
    mode:string;
    requiredParameters:IParameter[];
    advancedParameters:IParameter[];
    otherParameters: IParameter[];
    cmdParameters:IParameter[];
    outputType:string;
    outputValue:string;
    inputStreams : IStreamInfo[];
     outputStreams: IStreamInfo[];

     wasRoverStarted : boolean;
     wasBaseStated: boolean;

}

export default /*@ngInject*/ function ($q: ng.IQService, $scope: IPushConfScope, configuration: IConfigurationService, admin: IAdminService,
    $modalInstance: angular_ui_bootstrap.IModalInstanceService, mode : string,
    requiredParams : IParameter[], advancedParams : IParameter[], otherParams : IParameter[], cmdParams : IParameter[],
    outputType : string, outputValue : string,inputStreams : IStreamInfo[], outputStreams: IStreamInfo[]) {

    /* Controller parameters */
    $scope.mode = mode;
    $scope.requiredParameters = requiredParams;
    $scope.advancedParameters = advancedParams;
    $scope.otherParameters = otherParams;
    $scope.cmdParameters = cmdParams;
    $scope.outputType = outputType;
    $scope.outputValue = outputValue;
    $scope.inputStreams = inputStreams;
    $scope.outputStreams = outputStreams;

    $scope.wasBaseStated = false;
    $scope.wasRoverStarted = false;

    // $scope.isRover = $scope.mode === 'ROVER';
    // $scope.isBase = $scope.mode === 'BASE';

    $scope.loading = false;

    /**
     * Function called to push config file
     */
    $scope.ok =  () =>{
        $scope.loading = true;
        stopRunningService().then((response)=>{

        });
    };

    function pushAndStart(shouldEnable: boolean) {
        if ($scope.mode == "ROVER") {
            configuration.saveFile({
                'requiredParameters': $scope.requiredParameters,
                'advancedParameters': $scope.advancedParameters,
                'otherParameters': $scope.otherParameters,
                'cmdParameters': $scope.cmdParameters
            }).then(() => {
                
            //     if (shouldEnable) {
            //         admin.adminService('enable', $scope.mode).then(() => {
            //             admin.adminService('start', $scope.mode).then(() => {
            //                 //admin.getConfigType();
            //                 $scope.loading = false;
            //                 $modalInstance.close();
            //             });
            //         });
            //     } else {
            //         admin.adminService('start', $scope.mode).then(() => {
            //             //admin.getConfigType();
            //             $scope.loading = false;
            //             $modalInstance.close();
            //         });
            //     }
             });
        } else if ($scope.mode == "BASE") {
            //throw new Error("BASE config save not implemented");
            configuration.saveFile({
                'cmdParameters': $scope.cmdParameters
            }).then(() => {
            //     var out = $scope.outputType + '://';
            //     if ($scope.outputType === 'tcpsvr') {
            //         out = out + ':'
            //     }
            //     out = out + $scope.outputValue;

            //     configuration.saveRunBase({
            //         'out': out
            //     }).then(() => {
            //         if (shouldEnable) {
            //             admin.adminService('enable', $scope.mode).then(() => {
            //                 admin.adminService('start', $scope.mode).then(() => {
            //                     admin.getConfigType();
            //                     $scope.loading = false;
            //                     $modalInstance.close();
            //                 });
            //             });
            //         } else {
            //             admin.adminService('start', $scope.mode).then(() => {
            //                 admin.getConfigType();
            //                 $scope.loading = false;
            //                 $modalInstance.close();
            //             });
            //         }
            //     });
             });
        }else{
            throw new Error("mode not implemented " + $scope.mode);
        }
    }

    function stopRunningService() : angular.IPromise<boolean> {
        let stop_rover_promise = admin.adminService("status","ROVER").then((response)=>{
            if (response.isActive){
                $scope.wasRoverStarted = true;
            }
                admin.adminService("stop","ROVER").then((response)=>{
                    
                    return true;
                });
            });
            let stop_base_promise = admin.adminService("status","BASE").then((response)=>{
                if (response.isActive){
                    $scope.wasBaseStated = true;
                }
                admin.adminService("stop","BASE").then((response)=>{
                    return true;
                });
            });



        return $q.all<boolean>(
            {
                stop_rover_promise,
                stop_base_promise
            }    
        );
        


        // admin.adminService('status', 'ROVER').then((response) => {
        //     if (response.isActive) {
        //         admin.adminService('stop', 'ROVER').then(() => {
        //             if ($scope.isRover === false) {
        //                 admin.adminService('disable', 'ROVER').then(() => {
        //                     callback(true);
        //                 });
        //             } else {
        //                 callback(false);
        //             }
        //         });
        //     } else if (response.isEnabled) {
        //         if ($scope.isRover === false) {
        //             admin.adminService('disable', 'ROVER').then(() => {
        //                 callback(true);
        //             });
        //         } else {
        //             callback(false);
        //         }
        //     } else {
        //         admin.adminService('status', 'BASE').then((response) => {
        //             if (response.isActive) {
        //                 admin.adminService('stop', 'BASE').then(() => {
        //                     if ($scope.isBase === false) {
        //                         admin.adminService('disable', 'BASE').then(() => {
        //                             callback(true);
        //                         });
        //                     } else {
        //                         callback(false);
        //                     }
        //                 });
        //             } else if (response.isEnabled) {
        //                 if ($scope.isBase === false) {
        //                     admin.adminService('disable', 'BASE').then(() => {
        //                         callback(true);
        //                     });
        //                 } else {
        //                     callback(false);
        //                 }
        //             }
        //         });
        //     }
        // });
    }

    /**
     * Function called to cancel the push.
     */
    $scope.cancel = () => {
        $modalInstance.dismiss('cancel');
    };

}