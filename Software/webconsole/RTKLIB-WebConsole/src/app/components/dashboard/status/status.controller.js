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

module.exports = /*@ngInject*/ function ($scope, status, map, arrays, gps) {

    /* Déclaration du logger */
    console.log('dashboard.status');
    
    $scope.chartOptions = {
        segementStrokeWidth: 20,
		barStrokeColor: '#000'
    };
    
    /* Screen Functionnalities*/
    function getData(){
        status.getRoverSatellites().then(function(result){
            //console.log(result);

            var labels = [];

            var roverSat = [];
            var baseSat= [];

            var nbSat = result.length;
            
            result = arrays.sortByKey(result,'name');
            
            for(var i=0; i<nbSat; i++){
                var currentSat = result[i];
                //console.log(currentSat);
                labels.push(currentSat.name);
                roverSat.push(currentSat.snr);
                baseSat.push(0);
            }


            $scope.satRoverDatas = {
                labels: labels,
                datasets:[
                    {
                        label: 'rover',
                        fillColor: 'lightgreen', //DROTEK Color
                        data: roverSat
                    }
                ]

            };
        });
        
        status.getBaseSatellites().then(function(result){
            //console.log(result);

            var labels = [];

            var baseSat= [];

            result = arrays.sortByKey(result,'name');
            
            var nbSat = result.length;
            for(var i=0; i<nbSat; i++){
                var currentSat = result[i];
                //console.log(currentSat);
                labels.push(currentSat.name);
                baseSat.push(currentSat.cno);
            }


            $scope.satBaseDatas = {
                labels: labels,
                datasets:[
                    {
                        label: 'rover',
                        fillColor: 'lightgreen', //DROTEK Color
                        data: baseSat
                    }
                ]

            };
        });
        
        map.getLastPosition().then(function(result){
            if(result.length > 0){
                var lastPostion = result[0];
                if(lastPostion.status === '1'){
                    $scope.lastStatus = 'FIX';
                }else if(lastPostion.status === '2'){
                    $scope.lastStatus = 'FLOAT';
                }else if(lastPostion.status === '5'){
                    $scope.lastStatus = 'SINGLE';
                }
                
                var currentLla = gps.eceftolla(lastPostion);
                console.log(currentLla);
                $scope.lastLat = parseFloat(currentLla.lat).toFixed(9);
                $scope.lastLng = parseFloat(currentLla.lng).toFixed(9);
                $scope.lastAlt = parseFloat(currentLla.alt).toFixed(3);
            }       
        });
    }
    
    $scope.refresh = function($event){
		$event.stopPropagation();

        getData();
	};
    
    /* Loading Process*/
    getData();

};