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

var rtkOutputTypes = {

    "serial": {
        default: 'ttyUSB0:57600:8:n:1:off',
        example: "port[:bit_rate[:byte[:parity(n|o|e)[:stopb[:fctr(off|on)]]]]]",
    },
    "file": {
        default: "$RTKLIBLOGDIR/bas_%Y%m%d%h%M.ubx",
        example: ":path[::T[::+offset][::xspeed]]"
    },
    "tcpsvr": { 
        default: "2424",
        example: "port" 
    },
    "tcpcli": { 
        example: "addr:port" 
    },
    "ntripsvr": { 
        example: "user:passwd@addr:port/mntpnt[:str]" 
    },
    "ntripcli": { 
        example: "user:passwd@addr:port/mntpnt" 
    },
    "ftp": { 
        example: "user:passwd@addr/path[::T=poff,tint,off,rint]" 
    },
    "http": {
        example: "addr/path[::T=poff,tint,off,rint]"
    },
};

module.exports = /*@ngInject*/ function ($scope, configuration, $modal, $rootScope, admin) {

    /* Déclaration du logger */
    console.log('dashboard.configuration');
    
    /* Déclaration des variables utilisées dans le controlleur */
    $scope = angular.extend($scope, {
        oneAtATime: true,
        status: {
            isRequieredOpen: true,
            isFirstDisabled: false,
            isRunBaseOpen: true,
            isBaseCmdOpen: true
        },
        requiredParams: [],
		advancedParams: [],
		otherParams: [],
        cmdParams: [],
        isRover: true,
        
        selectedOutputType: '',
        outputTypes: ["serial","file","tcpsvr","tcpcli","udp","ntrips","ntripc","ftp","http"],//['file','tcpsvr','serial'],
        outputPath: '',
        currentMode: '',
        listNavSys: [
            {value: 1, name: 'GPS', selected:false},
            {value: 2, name: 'SBAS', selected:false},
            {value: 8, name: 'GALILEO', selected:false},
            {value: 4, name: 'GLONASS', selected:false},
            {value: 16, name: 'QZSS', selected:false},
            {value: 32, name: 'BEIDOU', selected:false}
          ],
        navSysParameter: undefined
    });
    
    $scope.listNavSys.sort(function(a, b) {
        return parseFloat(a.value) - parseFloat(b.value);
    });
    
    /* Watch Expressions */
    $scope.$watch(function () {
		return admin.getActiveMode();
    }, function (newVal) {
		if (typeof newVal !== 'undefined') {
            $scope.currentMode = newVal;
            configuration.setMode(newVal);
            checkMode(newVal);
		}
    });
    
    $scope.$watch(function () {
		return configuration.getMode();
    }, function (newVal) {
		if (typeof newVal !== 'undefined') {
            $scope.currentMode = newVal;
            checkMode(newVal);
		}
    });
    
    $scope.$watch(function () {
		return configuration.getOutputType();
    }, function (newVal) {
		if (typeof newVal !== 'undefined') {
            $scope.selectedOutputType = newVal;
		}
    });
    
    $scope.$watch(function () {
		return configuration.getOutputValue();
    }, function (newVal) {
		if (typeof newVal !== 'undefined') {
            $scope.outputPath = newVal;
		}
    });
  
    $scope.$watch(function () {
		return configuration.getRequiredParams();
    }, function (newVal) {
		if (typeof newVal !== 'undefined') {
			$scope.requiredParams = newVal;
		}
    });

    $scope.$watch(function () {
		return configuration.getAdvancedParams();
    }, function (newVal) {
		if (typeof newVal !== 'undefined') {
		    $scope.advancedParams = newVal;
		}
    });

    $scope.$watch(function () {
        return configuration.getOtherParams();
    }, function (newVal) {
        if (typeof newVal !== 'undefined') {
            $scope.otherParams = newVal;
        }
    });
    
    $scope.$watch(function () {
        return configuration.getCmdParams();
    }, function (newVal) {
        if (typeof newVal !== 'undefined') {
            $scope.cmdParams = newVal;
        }
    });
  
    /* Utility functions */ 
	$scope.hasRestriction = function(obj){
		var result = false;
		if(obj){
			result = obj.length > 0;
		}
		return result;
	};
    
    function checkMode (){
        $scope.isRover = $scope.currentMode === 'ROVER';
    };
    
    $scope.getDefaultPath = function(selectedItem){
        $scope.selectedOutputType = selectedItem;

        if (rtkOutputTypes[selectedItem]){
            $scope.outputPath = rtkOutputTypes[selectedItem].default;
            $scope.outputExample = rtkOutputTypes[selectedItem].example;
        }

        //$scope.outputExample
        switch (selectedItem){
            case "file":
            $scope.outputPath = '$RTKLIBLOGDIR/bas_%Y%m%d%h%M.ubx';
            break;
            case "tcpsvr":
            $scope.outputPath = '2424';
            break;
            case "serial":
            $scope.outputPath = 'ttyUSB0:57600:8:n:1:off';
            break;
        }
        // if(selectedItem === 'file'){
        //     $scope.outputPath = '$RTKLIBLOGDIR/bas_%Y%m%d%h%M.ubx';
        // }else if(selectedItem === 'tcpsvr'){
        //     $scope.outputPath = '2424';
        // }else if(selectedItem === 'serial'){
        //     $scope.outputPath = 'ttyUSB0:57600:8:n:1:off';
        // }
    }
  
    /* Screen Functionnalities */
	$scope.push = function($event){
        
        
        
		$event.stopPropagation();

        console.log($scope.currentMode);
        
        if($scope.currentMode === 'ROVER'){
            console.log(computeNavSysValue());
            console.log($scope.advancedParams);
        }
        
        var modalInstance = $modal.open({
          animation: true,
          template: require('../modals/push-conf/push-conf.html'),
          controller: require('../modals/push-conf/push-conf.controller.js'),
          resolve: {
              mode: function () {
                  return $scope.currentMode;
              },
              requiredParams: function () {
                  return $scope.requiredParams;
              },
              advancedParams: function () {
                  return $scope.advancedParams;
              },
              otherParams: function () {
                  return $scope.otherParams;
              },
              cmdParams: function () {
                  return $scope.cmdParams;
              },
              outputType: function () {
                  return $scope.selectedOutputType;
              },
              outputValue: function () {
                  return $scope.outputPath;
              }
          }
        });

        modalInstance.result.then(function () { // returned input on ok
          console.log('Config pushed');
        }, function () {
          console.log('Push config modal dismissed at: ' + new Date());
        });
	};
  
    
    $scope.save = function ($event) {
      $event.stopPropagation();

      var modalInstance = $modal.open({
          animation: true,
          template: require('../modals/save-conf/save-conf.html'),
          controller: require('../modals/save-conf/save-conf.controller.js'),
          resolve: {
              requiredParams: function () {
                  return $scope.requiredParams;
              },
              advancedParams: function () {
                  return $scope.advancedParams;
              },
              otherParams: function () {
                  return $scope.otherParams;
              },
              cmdParams: function () {
                  return $scope.cmdParams;
              }
          }
      });

      modalInstance.result.then(function () { // returned input on ok
          console.log('Config saved');
      }, function () {
          console.log('Save config modal dismissed at: ' + new Date());
      });
    };
    
    $scope.open = function ($event) {
      $event.stopPropagation();

      var modalInstance = $modal.open({
          animation: true,
          template: require('../modals/open-conf/open-conf.html'),
          controller: require('../modals/open-conf/open-conf.controller.js'),
      });

      modalInstance.result.then(function () { // returned input on ok
          console.log('Config opened');
      }, function () {
          console.log('Open config modal dismissed at: ' + new Date());
      });
    };
    
    $scope.switchConf = function(){
        console.log('switch');
        configuration.switchMode();
    };
    
    $scope.initNavSys = function(navSys,value){
        return navSys.value <= value;
    }
    
    $scope.decodeNavSysValue = function(navSys){
        
        $scope.navSysParameter = navSys;
        var value = navSys.value;
        
        var nbNavSys = $scope.listNavSys.length-1;
        for(var i=nbNavSys ; 0<= i && value !== 0; i--){
            var currentNavSys = $scope.listNavSys[i];
            if(value >= currentNavSys.value){
                value -= currentNavSys.value;
                currentNavSys.selected = true;
            }
        }
    }
    
    function computeNavSysValue(){
        var navSysValue = 0;
        var nbNavSys = $scope.listNavSys.length;
        for(var i=0 ; i<nbNavSys ; i++){
            var currentNavSys = $scope.listNavSys[i];
            if(currentNavSys.selected){
                navSysValue += currentNavSys.value;
            }
        }
        $scope.navSysParameter.value = navSysValue;
        
        return navSysValue;
    }
	
    /* Loading Process */
	configuration.getFile().then(function(){
        if(configuration.getMode() === 'BASE'){
            configuration.getBaseCmdFile();
        }
        configuration.getRunBase();
    });

};