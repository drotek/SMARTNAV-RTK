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


var configFileEditor = function(app) {
 
	var fs = require('fs');
 
    var configFilesPath = 'D:/OPENITEAM/configFiles/'; // '/usr/drotek/config/'
	var runBaseFilePath = 'D:/OPENITEAM/configFiles/'; // '/usr/drotek/rtklib/';
 
    var configFiles = {
		current_conf: 'active_config',
		user_extension: '.user',
		drotek_extension: '.drotek',
		base_cmd: 'base.cmd'
	};
	
	var runBaseName = 'run-base';
	
	var requireParams = {
		'pos1-posmode': ['single','dgps','kinematic','static','movingbase','fixed','ppp-kine','ppp-static'],
		'ant2-postype': ['llh','xyz','single','posfile','rinexhead','rtcm'],
		'ant2-pos1': [],
		'ant2-pos2': [],
		'ant2-pos3': [],
		'inpstr2-type': ['off','serial','file','tcpsvr','tcpcli','ntripcli','ftp','http'],
		'inpstr2-path': [],
		'inpstr2-format': ['rtcm2','rtcm3','oem4','oem3','ubx','ss2','hemis','skytraq','gw10','javad','sp3'],
		'outstr1-type': ['off','serial','file','tcpsvr','tcpcli','ntripcli'],
		'outstr2-type': ['off','serial','file','tcpsvr','tcpcli','ntripcli'],
		'outstr1-path': [],
		'outstr2-path': [],
		'outstr1-format': ['llh','xyz','enu','nmea','ubx','base'],
		'outstr2-format': ['llh','xyz','enu','nmea','ubx','base']
	};
	
	var advancedParams = {
		'pos1-elmask': [],
		'pos1-snrmask_r': ['off','on'],
		'pos1-snrmask_b': ['off','on'],
		'pos1-snrmask_L1': [],
		'pos1-dynamics': ['off','on'],
		'pos1-tidecorr': ['off','on'],
		'pos1-ionoopt': ['off','brdc','sbas','dual-freq','est-stec','ionex-tec','qzs-brdc','qzs-lex','vtec_sf','vtec_ef','gtec'],
		'pos1-tropopt': ['off','saas','sbas','est-ztd','est-ztdgrad'],
		'pos1-sateph': ['brdc','precise','brdc+sbas','brdc+ssrapc','brdc+ssrcom'],
		'pos1-exclsats': [],
		'pos1-navsys': [], //'gps','sbas','glo','gal','qzs','comp'
		'pos2-armode': ['off','continuous','instantaneous','fix-and-hold'],
		'pos2-gloarmode': ['off','on','autocal']
	};
	
	var otherParams = {
		'pos1-frequency': ['l1','l1+l2','l1+l2+l5'],
		'pos1-soltype': ['forward','backward','combined'],
		'pos1-snrmask_L2': [],
		'pos1-snrmask_L5': [],
		'pos1-posopt1': ['off','on'],
		'pos1-posopt2': ['off','on'],
		'pos1-posopt3': ['off','on'],
		'pos1-posopt4': ['off','on'],
		'pos1-posopt5': ['off','on'],
		'pos2-arthres': [],
		'pos2-arlockcnt': [],
		'pos2-arelmask': [],
		'pos2-arminfix': [],
		'pos2-elmaskhold': [],
		'pos2-aroutcnt': [],
		'pos2-maxage': [],
		'pos2-slipthres': [],
		'pos2-rejionno': [],
		'pos2-rejgdop': [],
		'pos2-niter': [],
		'pos2-baselen': [],
		'pos2-basesig': [],
		'out-solformat': ['llh','xyz','enu','nmea','ubx','base'],
		'out-outhead': ['off','on'],
		'out-outopt': ['off','on'],
		'out-timesys': ['gpst','utc','jst'],
		'out-timeform': ['tow','hms'],
		'out-timendec': [],
		'out-degform': ['deg','dms'],
		'out-fieldsep': [],
		'out-height': ['ellipsoidal','geodetic'],
		'out-geoid': ['internal','egm96','egm08_2.5','egm08_1','gsi2000'],
		'out-solstatic': ['all','single'],
		'out-nmeaintv1': [],
		'out-nmeaintv2': [],
		'out-outstat': ['off','state','residual'],
		'stats-eratio1': [],
		'stats-eratio2': [],
		'stats-errphase': [],
		'stats-errphaseel': [],
		'stats-errphasebl': [],
		'stats-errdoppler': [],
		'stats-stdbias': [],
		'stats-stdiono': [],
		'stats-stdtrop': [],
		'stats-prnaccelh': [],
		'stats-prnaccelv': [],
		'stats-prnbias': [],
		'stats-prniono': [],
		'stats-prntrop': [],
		'stats-clkstab': [],
		'ant1-postype': ['llh','xyz','single','posfile','rinexhead','rtcm'],
		'ant1-pos1': [],
		'ant1-pos2': [],
		'ant1-pos3': [],
		'ant1-anttype': [],
		'ant1-antdele': [],
		'ant1-antdeln': [],
		'ant1-antdelu': [],
		'ant2-anttype': [],
		'ant2-antdele': [],
		'ant2-antdeln': [],
		'ant2-antdelu': [],
		'misc-timeinterp': ['off','on'],
		'misc-sbasatsel': ['all'], // Warning '0' in initial config file
		'misc-rnxopt1': [],
		'misc-rnxopt2': [],
		'file-satantfile': [],
		'file-rcvantfile': [],
		'file-staposfile': [],
		'file-geoidfile': [],
		'file-ionofile': [],
		'file-dcbfile': [],
		'file-eopfile': [],
		'file-blqfile': [],
		'file-tempdir': [],
		'file-geexefile': [],
		'file-solstatfile': [],
		'file-tracefile': [],
		'inpstr1-type': ['off','serial','file','tcpsvr','tcpcli','ntripcli','ftp','http'],
		'inpstr3-type': ['off','serial','file','tcpsvr','tcpcli','ntripcli','ftp','http'],
		'inpstr1-path': [],
		'inpstr3-path': [],
		'inpstr1-format': ['rtcm2','rtcm3','oem4','oem3','ubx','ss2','hemis','skytraq','gw10','javad','sp3'],
		'inpstr3-format': ['rtcm2','rtcm3','oem4','oem3','ubx','ss2','hemis','skytraq','gw10','javad','sp3'],
		'inpstr2-nmeareq': ['off','latlon','single'],
		'inpstr2-nmealat': [],
		'inpstr2-nmealon': [],
		'logstr1-type': ['off','serial','file','tcpsvr','tcpcli','ntripsvr'],
		'logstr2-type': ['off','serial','file','tcpsvr','tcpcli','ntripsvr'],
		'logstr3-type': ['off','serial','file','tcpsvr','tcpcli','ntripsvr'],
		'logstr1-path': [],
		'logstr2-path': [],
		'logstr3-path': [],
		'misc-svrcycle': [],
		'misc-timeout': [],
		'misc-reconnect': [],
		'misc-nmeacycle': [],
		'misc-buffsize': [],
		'misc-navmsgsel': ['all','rover','base','corr'],
		'misc-proxyaddr': [],
		'misc-fswapmargin': [],
		'file-cmdfile1': []
	};
	
	var paramUnit = {
		'pos1-elmask': 'deg',
		'pos2-arelmask': 'deg',
		'pos2-elmaskhold': 'deg',
		'pos2-maxage': 's',
		'pos2-slipthres': 'm',
		'pos2-rejionno': 'm',
		'pos2-baselen': 'm',
		'pos2-basesig': 'm',
		'out-nmeaintv1': 's',
		'out-nmeaintv2': 's',
		'stats-errphase': 'm',
		'stats-errphaseel': 'm',
		'stats-errphasebl': 'm/10km',
		'stats-errdoppler': 'Hz',
		'stats-stdbias': 'm',
		'stats-stdiono': 'm',
		'stats-stdtrop': 'm',
		'stats-prnaccelh': 'm/s^2',
		'stats-prnaccelv': 'm/s^2',
		'stats-prnbias': 'm',
		'stats-prniono': 'm',
		'stats-prntrop': 'm',
		'stats-clkstab': 's/s',
		'ant1-pos1': 'deg|m',
		'ant1-pos2': 'deg|m',
		'ant1-pos3': 'm|m',
		'ant1-antdele': 'm',
		'ant1-antdeln': 'm',
		'ant1-antdelu': 'm',
		'ant2-pos1': 'deg|m',
		'ant2-pos2': 'deg|m',
		'ant2-pos3': 'm|m',
		'ant2-antdele': 'm',
		'ant2-antdeln': 'm',
		'ant2-antdelu': 'm',
		'inpstr2-nmealat': 'deg',
		'inpstr2-nmealon': 'deg',
		'misc-svrcycle': 'ms',
		'misc-timeout': 'ms',
		'misc-reconnect': 'ms',
		'misc-nmeacycle': 'ms',
		'misc-buffsize': 'bytes',
		'misc-fswapmargin': 's'
	}
	
	var paramComment = {
		'pos1-dynamics': 'on to estimate the vel and acc of vehicle using std-dev values, more fix values?',
		'pos1-tidecorr': 'on to consider solid earthtide corrections',
		'pos1-posopt1': 'satellite PCV variation file',
		'pos1-posopt2': 'Receiver PCV variation file',
		'pos1-posopt3': 'Phase windup PPP',
		'pos1-posopt4': 'PPP',
		'pos1-posopt5': 'Ublox M8T supports RAIM FDE',
		'pos1-exclsats': 'prn ...',
		'pos2-armode': 'continuous is good for kinematic',
		'pos2-arthres': 'value "2" has false positive rate of 3/600',
		'pos2-arlockcnt': 'carrier lock count changes quickly',
		'pos2-arminfix': 'for fix-and-hold',
		'pos2-elmaskhold': 'for fix-and-hold',
		'pos2-niter': 'useful when baseline < 1m',
		'pos2-baselen': 'for moving base mode',
		'pos2-basesig': 'for moving base mode',
		'out-solstatic': 'for rtkpost',
		'file-dcbfile': 'for dual frequency receivers',
		'inpstr1-path': 'rover',
		'inpstr2-path': 'base'
	}		
	
	function endsWith(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}
 
	app.get("/listConfigFile", function(req, res) {
		res.setHeader("Access-Control-Allow-Origin", "*");
		var fs = require('fs');
		
		var toReturn = {
			listConfigFiles : []
		}
		
		var files = fs.readdirSync(configFilesPath);
		var nbFile = files.length;
		
		for(var i = 0;i < nbFile;i++){
			var currentConfigFile = files[i];
			
			if(	currentConfigFile.indexOf(configFiles['current_conf']) > -1 || 
				endsWith(currentConfigFile,configFiles.user_extension) || 
				endsWith(currentConfigFile,configFiles.drotek_extension)){
					toReturn.listConfigFiles.push(currentConfigFile);
			}
		}
		
		res.send(toReturn);
		
	});
 
	app.get("/configFile", function(req, res) {
		
		res.setHeader("Access-Control-Allow-Origin", "*");
		var fs = require('fs');
		
		
		var fileName = configFiles['current_conf'];
		if(req.query.name){
			fileName = req.query.name;
		}
		
		fs.readFile(configFilesPath+fileName,'utf-8', function read(err, data) {
			if (err) {
				throw err;
			}
			
			var lines = data.split('\n');
			var nbLines = lines.length;
			
			var requiredParameters = [];
			var advancedParameters = [];
			var otherParameters = [];
			var cmdParameters = [];
			
			var pathCmd;
			
			for(var i = 0;i < nbLines;i++){
				var currentLine = lines[i];
				currentLine = currentLine.replace(/\s/g, '');
				
				if(currentLine !== '' && currentLine.indexOf('=') > -1){
					var lineComponents = currentLine.split('=');
					var key = lineComponents[0];
					var value = lineComponents[1];
					
					if(value.indexOf('#') > -1){
						value = value.split('#')[0];
					}
					
					if(key === 'file-cmdfile1'){
						pathCmd = value;
					}
					
					var currentParam = {
						'key': key,
						'value': value,
						'unit': paramUnit[key],
						'comment': paramComment[key]
					};
					
					if(requireParams[key]){
						currentParam.restriction = requireParams[key];
						requiredParameters.push(currentParam);
					}else if(advancedParams[key]){
						currentParam.restriction = advancedParams[key];
						advancedParameters.push(currentParam);
					}else{
						currentParam.restriction = otherParams[key];
						otherParameters.push(currentParam);
					}
				}
			}
			
			if(pathCmd){
				fs.readFile(pathCmd,'utf-8', function read(errCmd, dataCmd) {
					if (errCmd) {
						throw errCmd;
					}
					
					var linesCmd = dataCmd.split('\n');
					var nbLinesCmd = linesCmd.length;
					
					for(var j = 0;j < nbLinesCmd;j++){
						var currentCmdLine = linesCmd[j];
						
						if(currentCmdLine.substring(0, 1) !== '#'){
							var cmdLineComponents = currentCmdLine.split(' ');
							
							if(cmdLineComponents.length > 0){
								var currentCmdType = cmdLineComponents[1];
								
								var currentParam = {
									'key': currentCmdType,
									'value': value,
									'unit': paramUnit[key],
									'comment': paramComment[key]
								};
								
								if(currentCmdType === 'CFG-RATE'){
									currentParam.value = 1000/cmdLineComponents[2];
									currentParam.unit = 'Hz';
									currentParam.comment = 'Frequency';
									cmdParameters.push(currentParam);
								}else if(currentCmdType === 'CFG-PRT'){
									currentParam.value = cmdLineComponents[6];
									currentParam.unit = '';
									currentParam.comment = 'Baud Rate';
									cmdParameters.push(currentParam);
								}
							}
						}
					}
					
					res.send({
						'name': fileName,
						'requiredParameters': requiredParameters, 
						'advancedParameters': advancedParameters,
						'otherParameters': otherParameters,
						'cmdParameters': cmdParameters
					});
					
				});
			}else{
				res.send({
					'name': fileName,
					'requiredParameters': requiredParameters, 
					'advancedParameters': advancedParameters,
					'otherParameters': otherParameters,
					'cmdParameters': cmdParameters
				});
			}
			
			
		}); 
		
	});
	
	app.get("/baseCMD", function(req, res) {
		
		fs.readFile(configFilesPath+configFiles.base_cmd,'utf-8', function read(errCmd, dataCmd) {
			if (errCmd) {
				throw errCmd;
			}
			
			var linesCmd = dataCmd.split('\n');
			var nbLinesCmd = linesCmd.length;
			
			var cmdParameters = [];
			
			for(var j = 0;j < nbLinesCmd;j++){
				var currentCmdLine = linesCmd[j];
				
				if(currentCmdLine.substring(0, 1) !== '#'){
					var cmdLineComponents = currentCmdLine.split(' ');
					
					if(cmdLineComponents.length > 0){
						var currentCmdType = cmdLineComponents[1];
						
						var currentParam = {
							'key': currentCmdType
						};
						
						if(currentCmdType === 'CFG-RATE'){
							currentParam.value = 1000/cmdLineComponents[2];
							currentParam.unit = 'Hz';
							currentParam.comment = 'Frequency';
							cmdParameters.push(currentParam);
						}else if(currentCmdType === 'CFG-PRT'){
							currentParam.value = cmdLineComponents[6];
							currentParam.unit = '';
							currentParam.comment = 'Baud Rate';
							cmdParameters.push(currentParam);
						}
					}
				}
			}
			
			res.send({
				'name': configFiles.base_cmd,
				'requiredParameters': [], 
				'advancedParameters': [],
				'otherParameters': [],
				'cmdParameters': cmdParameters
			});
			
		});
	});
	
	app.get("/basePosition", function(req, res) {
		
		res.setHeader("Access-Control-Allow-Origin", "*");
		var fs = require('fs');
		fs.readFile(configFilesPath+configFiles['current_conf'],'utf-8', function read(err, data) {
			if (err) {
				throw err;
			}
			
			var pos1;
			var pos2;
			var pos3;
			var postype;
			
			var lines = data.split('\n');
			var nbLines = lines.length;
			
			var i = 0;
			while(i<nbLines && (!pos1 || !pos2 || !pos3 || !postype)){
				var currentLine = lines[i];
				
				currentLine = currentLine.replace(/\s/g, '');
				
				if(currentLine !== '' && currentLine.substring(0, 1) !== '#' && currentLine.indexOf('=') > -1){
					var lineComponents = currentLine.split('=');
					var key = lineComponents[0];
					
					switch(key){
						case 'ant2-pos1':
							pos1 = getValue(lineComponents[1]);
							break;
						case 'ant2-pos2':
							pos2 = getValue(lineComponents[1]);
							break;
						case 'ant2-pos3':
							pos3 = getValue(lineComponents[1]);
							break;
						case 'ant2-postype':
							postype = getValue(lineComponents[1]);
							break;
						default:
							break;
					}
					
				}
				
				i++;
			}
			
			res.send({
				'pos1': pos1, 
				'pos2': pos2,
				'pos3': pos3,
				'postype': postype
			});
		}); 
		
	});
	
	function getValue(value){
		var toReturn = value;
					
		if(toReturn.indexOf('#') > -1){
			toReturn = toReturn.split('#')[0];
		}
		
		return toReturn;
	}
	
	function formatDate(number){
		var toReturn = number;
		if(number < 10){
			toReturn = '0' + toReturn;
		}
		
		return toReturn;
	}
	
	function copyFileSync(srcFile, destFile){
		var BUF_LENGTH = 64*1024;
		buff = new Buffer(BUF_LENGTH);
		fdr = fs.openSync(srcFile, 'r');
		fdw = fs.openSync(destFile, 'w');
		bytesRead = 1;
		pos = 0;
		
		while (bytesRead > 0){
			bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
			fs.writeSync(fdw,buff,0,bytesRead);
			pos += bytesRead;
		}
		
		fs.closeSync(fdr);
		fs.closeSync(fdw);
	}
	
	app.post("/configFile", function(req, res) {
		
		res.setHeader("Access-Control-Allow-Origin", "*");
		
		var requiredParameters = req.body.requiredParameters;
		var advancedParameters = req.body.advancedParameters;
		var otherParameters = req.body.otherParameters;
		var cmdParameters = req.body.cmdParameters;
			
		var pathCmd;
		
		var configFileAsString = '# SMARTNAV-RTK options (2013/03/01 10:41:04, v.2.4.2)\n\n';
		configFileAsString = configFileAsString + '#Logs location /usr/drotek/logs/\n\n';
		
		configFileAsString = configFileAsString + '#Required parameters\n';
		var nbLines = requiredParameters.length;
		var currentParam;
		
		for(var i = 0;i < nbLines;i++){
			currentParam = requiredParameters[i];
			configFileAsString = configFileAsString + currentParam.key + ' =' + currentParam.value;

			if(currentParam.unit){
				configFileAsString = configFileAsString + ' # (' + currentParam.unit + ')';
			}
			
			if(currentParam.comment){
				configFileAsString = configFileAsString + ' # ' + currentParam.comment;
			}
							
			configFileAsString = configFileAsString + '\n';						
		}
		configFileAsString = configFileAsString + '\n';
		
		configFileAsString = configFileAsString + '#Advanced parameters\n';
		nbLines = advancedParameters.length;
		for(var i = 0;i < nbLines;i++){
			currentParam = advancedParameters[i];
			configFileAsString = configFileAsString + currentParam.key + ' =' + currentParam.value;
									
			if(currentParam.unit){
				configFileAsString = configFileAsString + ' # (' + currentParam.unit + ')';
			}
			
			if(currentParam.comment){
				configFileAsString = configFileAsString + ' # ' + currentParam.comment;
			}
							
			configFileAsString = configFileAsString + '\n';						
		}
		configFileAsString = configFileAsString + '\n';
		
		configFileAsString = configFileAsString + '#Other parameters\n';
		nbLines = otherParameters.length;
		for(var i = 0;i < nbLines;i++){
			currentParam = otherParameters[i];

			var currentParamKey = currentParam.key;
			
			configFileAsString = configFileAsString + currentParamKey + ' =' + currentParam.value;
									
			if(currentParam.unit){
				configFileAsString = configFileAsString + ' # (' + currentParam.unit + ')';
			}
			
			if(currentParam.comment){
				configFileAsString = configFileAsString + ' # ' + currentParam.comment;
			}
							
			configFileAsString = configFileAsString + '\n';	

			if(currentParamKey === 'file-cmdfile1'){
				pathCmd = currentParam.value;
			}

		}

		var fileName;
		if(req.body.name){
			fileName = 'Saved_Conf_' + req.body.name;
		}else{
			fileName = configFiles['current_conf'];
		}
		
		fs.writeFile(configFilesPath+fileName, configFileAsString, function (err) {
			if (err){
			  throw err;
			}
			console.log('Config file saved!');

			var nbCmdParam = cmdParameters.length;
			if(pathCmd && nbCmdParam > 0){
				
				return modifyCmdFile (pathCmd, cmdParameters, res, req);
				
			}else{
				return res.send(req.body);
			}
		});
	});
	
	app.post("/baseCMD", function(req, res) {
		
		res.setHeader("Access-Control-Allow-Origin", "*");
		
		var cmdParameters = req.body.cmdParameters;
			
		var pathCmd = configFilesPath+configFiles.base_cmd;
		
		var nbCmdParam = cmdParameters.length;
		if(nbCmdParam > 0){
			
			return modifyCmdFile (pathCmd, cmdParameters, res, req);
			
		}else{
			return res.send(req.body);
		}
	});
	
	function modifyCmdFile (pathCmd, cmdParameters, res, req) {
		var cmdFileAsString = '';
		
		fs.readFile(pathCmd,'utf-8', function read(errCmd, dataCmd) {
			if (errCmd) {
				throw errCmd;
			}
			
			var linesCmd = dataCmd.split('\n');
			var nbLinesCmd = linesCmd.length;
			
			for(var j = 0;j < nbLinesCmd;j++){
				var currentCmdLine = linesCmd[j];
				
				if(currentCmdLine.substring(0, 1) !== '#'){
					var cmdLineComponents = currentCmdLine.split(' ');
					
					if(cmdLineComponents.length > 0){
						var currentCmdType = cmdLineComponents[1];
						
						switch(currentCmdType){
							case 'CFG-RATE':
							case 'CFG-PRT':
								cmdFileAsString += getCmdLine(currentCmdType, cmdLineComponents, cmdParameters);
								break;
							default:
								cmdFileAsString += currentCmdLine + '\n';
								break;
						}
					}else{
						cmdFileAsString += currentCmdLine + '\n';
					}
				}else{
					cmdFileAsString += currentCmdLine + '\n';
				}
			}
			
			fs.writeFile(pathCmd, cmdFileAsString, function (err) {
				if (err){
				  throw err;
				}
				console.log('CMD file saved!');
			
				return res.send(req.body);
			});
		});
	}
 	
	function getCmdLine (cmdType, cmdLineComponents, params) {
		var commandToReturn = null;
		
		var nbCmdParam = params.length;
		for(var i = 0;i < nbCmdParam && commandToReturn === null;i++){
			currentParam = params[i];
			
			if(cmdType === currentParam.key){
				if(cmdType === 'CFG-RATE'){
					var period = 1000/currentParam.value;
					commandToReturn = '!UBX CFG-RATE ' + period + ' ' + 
										cmdLineComponents[3] + ' ' + 
										cmdLineComponents[4] + '\n';
				}else if(cmdType === 'CFG-PRT'){
					commandToReturn = '!UBX CFG-PRT ' + 
										cmdLineComponents[2] + ' ' + 
										cmdLineComponents[3] + ' ' + 
										cmdLineComponents[4] + ' ' + 
										cmdLineComponents[5] + ' ' + 
										+currentParam.value + ' ' +
										cmdLineComponents[7] + ' ' + 
										cmdLineComponents[8] + ' ' + 
										cmdLineComponents[9] + ' ' + 
										cmdLineComponents[10] +'\n';
				}
			}
		}
		
		return commandToReturn;
	}
	
	app.get("/runBase", function(req, res) {
		
		res.setHeader("Access-Control-Allow-Origin", "*");
		var fs = require('fs');
		fs.readFile(runBaseFilePath+runBaseName,'utf-8', function read(err, data) {
			if (err) {
				throw err;
			}
			
			var type;
			var value;
			
			var lines = data.split('\n');
			var nbLines = lines.length;
			
			var i = 0;
			while(i<nbLines && (!type || !value)){
				
				var currentLine = lines[i];
				currentLine = currentLine.replace(/\s/g, '');
				
				if(currentLine !== '' && currentLine.substring(0, 1) !== '#'){
					if(currentLine.indexOf('-outtcpsvr:') > -1){
						type = 'tcpsvr';
						value = currentLine.substring(currentLine.indexOf('tcpsvr://')+7,currentLine.length).split(':')[1];
					}else if(currentLine.indexOf('-outfile:') > -1){
						type = 'file';
						value = currentLine.substring(currentLine.indexOf('file://')+7,currentLine.length);
					}
				}
				
				i++;
				
			}
			
			res.send({
				'type': type,
				'value': value
			});
		});
	});
	
	app.post("/runBase", function(req, res) {
		
		res.setHeader("Access-Control-Allow-Origin", "*");
		
		var runBaseFileAsString = '#!/bin/bash\n';
		runBaseFileAsString = runBaseFileAsString + '# Drotek SMARTNAV-RTK\n\n';

		runBaseFileAsString = runBaseFileAsString + 'DIR=/usr/drotek\n';
		runBaseFileAsString = runBaseFileAsString + 'RTKLIBDIR=$DIR/rtklib\n';
		runBaseFileAsString = runBaseFileAsString + 'RTKLIBLOGDIR=$DIR/logs\n';
		runBaseFileAsString = runBaseFileAsString + 'RTKLIBCONFDIR=$DIR/config\n\n';

		//-out tcpsvr://:2424 or file:///$RTKLIBLOGDIR/bas_%Y%m%d%h%M.ubx   
		runBaseFileAsString = runBaseFileAsString + '$RTKLIBDIR/str2str -c $RTKLIBCONFDIR/base.cmd -in serial://ttyACM0 -out ' + req.body.out + '\n';
		
		fs.writeFile(runBaseFilePath+runBaseName, runBaseFileAsString, function (err) {
		  if (err){
			  throw err;
		  }
		  console.log('run-base saved');
		});
		
		return res.send(req.body);
	});
 
}
 
module.exports = configFileEditor;