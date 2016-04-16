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


var adminModule = function(app) {
 
	var fs = require('fs');
	var exec = require('child_process').exec;
 
	var serviceController = '/bin/systemctl'
    var serviceRoverName = 'drotek-rtklib-rover.service';
	var serviceBaseName = 'drotek-rtklib-base.service';
	
	var updateCommandLine = '/usr/drotek/admin/smartnav-update';
	var timeSyncCommandLine = '/usr/drotek/admin/smartnav-time-sync';
	
	
	var serviceCommands = {
		'start': serviceController + ' start ',
		'stop': serviceController + ' stop ',
		'status': serviceController + ' status ',
		'enable': serviceController + ' enable ',
		'disable': serviceController + ' disable '
	};

	app.post("/service", function(req, res) {
		
		res.setHeader("Access-Control-Allow-Origin", "*");
		
		var commandType = req.body.commandType;
		var configType = req.body.configType;
		var commandToExecute = serviceCommands[commandType];
		
		if(commandToExecute){
			
			if(configType === 'ROVER'){
				 commandToExecute = commandToExecute + serviceRoverName;
			}else if(configType === 'BASE'){
				 commandToExecute = commandToExecute + serviceBaseName;
			}
			
			console.log(commandToExecute);
			exec(commandToExecute, function(error, stdout, stderr) {
			
				var response = {};
			
				if(error){
					response.error = error;
				}
				
				if(stdout){
					response.stdout = stdout;
				}
				
				if(stderr){
					response.stderr = stderr;
				}
			
				if(commandType === 'status'){
					response.isActive = stdout.indexOf('active (running)') > -1;
					response.isEnabled = stdout.indexOf('enabled') > -1;
				}
				
				
				if((commandType === 'enable' || commandType === 'disable')){

					console.log(serviceController + ' daemon-reload ');
					exec(serviceController + ' daemon-reload ', function(error2, stdout2, stderr2) {
					
						var response = {};
					
						if(error2){
							response.error2 = error2;
						}
						
						if(stdout2){
							response.stdout2 = stdout2;
						}
						
						if(stderr2){
							response.stderr2 = stderr2;
						}

						return res.send(response);
					
					});
				
				}else{
					return res.send(response);
				}
			
			});
		}else{
			return res.send({
				'error': 'Command not found'
			});
		}
	});
	
	app.get("/updatePlatform", function(req, res) {
		
		res.setHeader("Access-Control-Allow-Origin", "*");
		execComandLine(res, updateCommandLine);
		
	});
	
	app.get("/syncTime", function(req, res) {
		
		res.setHeader("Access-Control-Allow-Origin", "*");
		execComandLine(res, timeSyncCommandLine);
		
	});
	
	function execComandLine(res, commandLine){
		exec(commandLine, function(error, stdout, stderr) {
		
			var response = {};
		
			if(error){
				response.error = error;
			}
			
			if(stdout){
				response.stdout = stdout;
			}
			
			if(stderr){
				response.stderr = stderr;
			}
			
			return res.send(response);
		
		});
	}
 
}
 
module.exports = adminModule;