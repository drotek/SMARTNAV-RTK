import path = require("path");

const rootFilePath = path.resolve("../../");

const scriptsFilePath = path.join(rootFilePath, "scripts");

export const serviceController = "/bin/systemctl";
export const serviceRoverName = "drotek-rtklib-rover.service";
export const serviceBaseName = "drotek-rtklib-base.service";

export const updateCommandLine = path.join(scriptsFilePath, "smartnav-update");
export const timeSyncCommandLine = path.join(scriptsFilePath, "smartnav-time-sync");

export const configFilesPath =  path.join(rootFilePath, "config");
export const runBaseFilePath = path.join(rootFilePath, "binary"); // '/usr/drotek/rtklib/';

export const configFiles = {
	current_conf: "active_config",
	user_extension: ".user",
	drotek_extension: ".drotek",
	base_cmd: "base.cmd"
};

export const logFilesPath = path.join(rootFilePath, "logs"); // '/usr/drotek/logs/'
export const dataFilesPath = path.join(rootFilePath, "data"); // '/usr/drotek/rtklib/'

export const runBaseName = "run-base";
