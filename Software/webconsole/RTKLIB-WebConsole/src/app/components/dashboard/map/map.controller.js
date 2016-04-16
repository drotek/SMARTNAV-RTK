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

module.exports = /*@ngInject*/ function ($scope, map, $rootScope, gps, $window) {

    /* Déclaration du logger */
    console.log('dashboard.map');

    $scope = angular.extend($scope, {
		scale: {
            '1 meter': 37,
            '2 meters': 37/2,
            '3 meters': 37/3,
            '4 meters': 37/4,
            '5 meters': 37/5,
            '10 meters': 37/10,
            '25 meters': 37/25,
            '50 meters': 37/50,
            '100 meters': 37/100,
            '1000 meters': 37/1000,
        },
        selectedScale: undefined,
        basePosition: undefined
    });
    
    /* Watch Expressions */
    $scope.$watch(function () {
		return $scope.selectedScale;
    }, function (newVal) {
		if (typeof newVal !== 'undefined') {
            getData();
		}
    });

    /* Target Rendering */
    var radar = document.getElementById('radar');
    var canvas = document.getElementById('chart');
    var ctx = canvas.getContext('2d');
    
    var scaleInitialized = false;
    
    var zoom = 1;
    var diameter = 300;
    if($rootScope.isDesktop){
        zoom = ($window.innerHeight-250)/diameter;
    }
    
    canvas.width = zoom*diameter;
    canvas.height = zoom*diameter;
    
    var radius = diameter / 2,
    padding = 14,
    rings = 4,
    saturation = 50,
    lightness = 400,
    lineWidth = 2/zoom;

    radar.style.marginLeft = radar.style.marginTop = ( -zoom*diameter / 2 ) - padding + 'px';
    radar.style.minWidth = (zoom*diameter) + 'px';
    radar.style.minHeight = (zoom*diameter) + 'px';

    var renderRings = function(){
      var i;
      for( i = 0; i < rings; i++ ){
        ctx.beginPath();
        ctx.arc( radius, radius, ( ( radius - ( lineWidth / 2) ) / rings) * ( i + 1 ), 0, 2*Math.PI, false );
        ctx.strokeStyle = 'green';
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      };
    };

    var renderGrid = function(){
      ctx.beginPath();
      ctx.moveTo( radius - lineWidth / 2, lineWidth );
      ctx.lineTo( radius - lineWidth / 2, diameter - lineWidth );
      ctx.moveTo( lineWidth, radius - lineWidth / 2 );
      ctx.lineTo( diameter - lineWidth, radius - lineWidth / 2 );
      ctx.strokeStyle = 'green';
      ctx.stroke();
    };


    var renderScanLines = function(){
      var i;
      var j;
      ctx.beginPath();
      for( i = 0; i < diameter; i += 2 ){    
        ctx.moveTo( 0, i + .5 );
        ctx.lineTo( diameter, i + .5);
      };
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'hsla( 0, 0%, 0%, .02 )';
      ctx.globalCompositeOperation = 'source-over';
      ctx.stroke();
    };

    var renderPoints = function(){
        
        map.getPositions().then(function(result){
            
            if($scope.basePosition.postype === 'llh'){
            
                var llaBase = {
                    'lat': parseFloat($scope.basePosition.pos1),
                    'lng': parseFloat($scope.basePosition.pos2),
                    'alt': parseFloat($scope.basePosition.pos3)
                }
                
 
                
                var baseEcef = gps.llatoecef(llaBase);

                var listPointsToRender = [];
                var nbPoints = 0;
                var xTotal = 0;
                var yTotal = 0;

                var nbPosition = result.length;
                for(var i=0; i<nbPosition; i++){
                    var currentPosition = result[i];

                    var currentLla = gps.eceftolla(currentPosition);
                    var currentEnu = gps.eceftoenu(baseEcef,currentPosition,currentLla);

                    var mapCoordX = 148 + currentEnu.north * $scope.selectedScale; //1m = 37 , 2m = 18.5, 4m = 9.25
                    var mapCoordY = 148 + currentEnu.east * $scope.selectedScale;

                    listPointsToRender.push({
                        status: currentPosition.status,
                        x: currentEnu.north,
                        y: currentEnu.east
                    });
                    
                    nbPoints++;
                    
                    xTotal += currentEnu.north;
                    yTotal += currentEnu.east;
                    

                }
                
                var translationCoordinates = {
                    x: xTotal/nbPoints,
                    y: yTotal/nbPoints
                }
                
                listPointsToRender.forEach(function(currentPoint){
                    if(currentPoint.status === '1'){
                        ctx.fillStyle = '#00FF00';
                    }else if(currentPoint.status === '2'){
                        ctx.fillStyle = 'yellow';
                    }else if(currentPoint.status === '5'){
                        ctx.fillStyle = 'red';
                    }
                    var mapCoordX = 148 + 
                        (currentPoint.x-translationCoordinates.x) * $scope.selectedScale; //1m = 37 , 2m = 18.5, 4m = 9.25
                    var mapCoordY = 148 + 
                        (currentPoint.y-translationCoordinates.y) * $scope.selectedScale;

                    ctx.fillRect(mapCoordX, 
                                 mapCoordY, 
                                 3/zoom, 
                                 3/zoom );
                });
                
            }
            
        });
        
        
    };
    
    ctx.clear = function(){
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'hsla( 0, 0%, 0%, 0.1 )';
      ctx.fillRect( 0, 0, diameter, diameter );
    };

    ctx.draw = function(){
      ctx.globalCompositeOperation = 'lighter';
      renderRings();
      renderGrid();
      renderPoints();
    };
    
    /* Screen Functionnalities */
    $scope.refresh = function($event){
        if($event){
		  $event.stopPropagation();
        }
        getData();
	};
    
    function getData(){
        if(!scaleInitialized){
            ctx.scale(zoom,zoom);
            scaleInitialized = true;
        }
        ctx.clearRect(0, 0, zoom*300, zoom*300);
		ctx.draw();
    }
    
    /* Loading Process */
    map.getBasePosition().then(function(position){
        $scope.basePosition = position;
        $scope.selectedScale = $scope.scale['2 meters'];
    });
    
};