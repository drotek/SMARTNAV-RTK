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
module.exports = function () {
  return {
    $get: /*@ngInject*/ function ($http, $rootScope) {

		/* Déclaration des variables utilisées dans le service */
		var _ = require('lodash'),
        mode = '',
		requiredParams = [],
		advancedParams = [],
		otherParams = [],
        cmdParams = [],
        outputType = '',
        outputValue = '';

		/**
		* Opérations disponibles pour le service configuration.
		*/
		var service = {
          getMode: getMode,
		  getRequiredParams: getRequiredParams,
		  getAdvancedParams: getAdvancedParams,
		  getOtherParams: getOtherParams,
          getCmdParams: getCmdParams,
          getOutputType: getOutputType,
          getOutputValue: getOutputValue,
		  getFile: getFile,
          getBaseCmdFile: getBaseCmdFile,
          getRunBase: getRunBase,
		  saveFile: saveFile,
          saveBaseCmdFile: saveBaseCmdFile,    
          saveRunBase: saveRunBase,
          getListConfigFile: getListConfigFile,
          switchMode: switchMode,
          setMode: setMode    
		};

		return service;

		/* Définition des fonctions du service de configuration */

        function setMode (modeToSet){
            mode = modeToSet;
        }
        
        function switchMode () {
            if(mode === 'ROVER'){
                getBaseCmdFile().then(function(){
                    mode = 'BASE';
                });
            }else{
                getFile().then(function(){
                    mode = 'ROVER';
                });
            }
        }
        
        function getMode () {
		  return mode;
		}
        
		function getRequiredParams () {
		  return requiredParams;
		}

		function getAdvancedParams () {
			return advancedParams;
		}

		function getOtherParams () {
			return otherParams;
		}
        
        function getCmdParams () {
            return cmdParams;
        }
        
        function getOutputType () {
            return outputType;
        }
        
        function getOutputValue () {
            return outputValue;
        }
        
        function getListConfigFile () {
            return $http({
				method: 'GET',
				url: $rootScope.host+':3000/listConfigFile'
			}).then(function (response) {
				return response.data;
			}).then(function (result) {
                return result.listConfigFiles;
			});
        }

		function getFile (fileName) {
            
            var url = $rootScope.host+':3000/configFile';
            if(fileName){
                url += '?name='+fileName;
            }
            
		    return $http({
				method: 'GET',
				url: url
			}).then(function (response) {
				return response.data;
			}).then(function (params) {
                requiredParams = params.requiredParameters;
				advancedParams = params.advancedParameters;
				otherParams = params.otherParameters;
                cmdParams = params.cmdParameters;
                return true;
			});
		  
		}
        
        function getBaseCmdFile () {
            
            var url = $rootScope.host+':3000/baseCMD';
            
		    return $http({
				method: 'GET',
				url: url
			}).then(function (response) {
				return response.data;
			}).then(function (params) {
				requiredParams = params.requiredParameters;
				advancedParams = params.advancedParameters;
				otherParams = params.otherParameters;
                cmdParams = params.cmdParameters;
                return true;
			});
		  
		}
        
        function getRunBase () {
            var url = $rootScope.host+':3000/runBase';
            
		    return $http({
				method: 'GET',
				url: url
			}).then(function (response) {
				return response.data;
			}).then(function (output) {
                outputType = output.type;
                outputValue = output.value;
			});
        }
		
		function saveFile (fileContent) {
		    return $http({
				method: 'POST',
				url: $rootScope.host+':3000/configFile',
				data: fileContent
			}).then(function (response) {
				return response.data;
			});
		  
		}
        
        function saveBaseCmdFile (fileContent) {
		    return $http({
				method: 'POST',
				url: $rootScope.host+':3000/baseCMD',
				data: fileContent
			}).then(function (response) {
				return response.data;
			});
		}
        
        function saveRunBase(params){
            return $http({
				method: 'POST',
				url: $rootScope.host+':3000/runBase',
				data: params
			}).then(function (response) {
				return response.data;
			});
        }

      // fin - Définition des fonctions du service


    }
  };
};