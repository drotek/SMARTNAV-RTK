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


var dataFilesReader = function(app) {
 
	var fs = require('fs');
 
    var dataFilesPath = 'D:/OPENITEAM/dataFiles/'; // '/usr/drotek/rtklib/'

	app.get("/roverSatellites", function(req, res) {
		
		res.setHeader("Access-Control-Allow-Origin", "*");
		var fs = require('fs');
		
		var files = fs.readdirSync(dataFilesPath).reverse();
		
		var currentDataFile = files[0];
		var nbFile = files.length;
		var i = 0;
		
		while(i<nbFile && currentDataFile.indexOf('.stat') < 0){
			i++;
			currentDataFile = files[i];
		}
		
		fs.readFile(dataFilesPath + currentDataFile,'utf-8', function read(err, data) {
			
			if (err) {
				throw err;
			}
			
			var lines = data.split('\n');
			var nbLines = lines.length;
			
			var listSatData = [];
			
			for(var i = nbLines-1 ; i >= 0 && listSatData.length < 100;i--){
				var currentLine = lines[i];
				
				if(currentLine.indexOf('$SAT') > -1){
					listSatData.push(currentLine);
				}
			}
			
			res.send({
				'fileName': currentDataFile,
				'nbLine': nbLines,
				'listSatData': listSatData
			})	
			
		});
		
		
	});
	
	function isInt(value) {
	  return !isNaN(value) && 
			 parseInt(Number(value)) == value && 
			 !isNaN(parseInt(value, 10));
	}
	
	app.get("/positions", function(req, res) {
		
		res.setHeader("Access-Control-Allow-Origin", "*");
		var fs = require('fs');
		
		var files = fs.readdirSync(dataFilesPath).reverse();
		
		var currentDataFile = files[0];
		var nbFile = files.length;
		var i = 0;
		
		while(i<nbFile && currentDataFile.indexOf('.stat') < 0){
			i++;
			currentDataFile = files[i];
		}
		
		fs.readFile(dataFilesPath + currentDataFile,'utf-8', function read(err, data) {
			
			if (err) {
				throw err;
			}
			
			var lines = data.split('\n');
			var nbLines = lines.length;
			
			var listSatData = [];
			
			var nbPos = 200;
			if(req.query.nbPos && isInt(req.query.nbPos)){
				nbPos = req.query.nbPos;
			}
			
			for(var i = nbLines-1 ; i >= 0 && listSatData.length < nbPos;i--){
				var currentLine = lines[i];
				
				if(currentLine.indexOf('$POS') > -1){
					
					var status = currentLine.split(',')[3];
					
					if(status === "1"){ // is Fix
						listSatData.push(currentLine);
					}else if (status === "2"){ // is Float
						listSatData.push(currentLine);
					}else if (status === "5"){ // is Single
						listSatData.push(currentLine);
					}
				}
					
			}
			
			res.send({
				'fileName': currentDataFile,
				'nbLine': nbLines,
				'listPosData': listSatData
			})	
			
		});
		
		
	});
 
}
 
module.exports = dataFilesReader;