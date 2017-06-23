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
import _ = require("lodash");
import io_client = require("socket.io-client");

export interface IMessage {
	type: string;
}

export interface ICloseMessage {
	type: "close";
	code: number;
}

export interface IStdErrMessage {
	type: "stderr";
	data: string;
}

export interface IStatusMessage {
	type: "status";
	data: IParsedStatus;
}

export interface ILogLineMessage {
	type: "log_line";
	line: ILogLine;
}

export interface IParsedStatus {
	timestamp: Date;
	unknown: string;
	received: number;
	bps: number;
	unknown1: string;
	msg: string;
}

export interface ILogLine {
	level: number;
	timestamp: number;
	module: string;
	message: string;
}

export interface ILiveLogsService {

}

export default function() {
	return {
		$get: /*@ngInject*/  ($http: angular.IHttpService, $rootScope: angular.IRootScopeService) => {
			console.log("initalizing live-logs service");

			const socket = io_client("http://localhost:3001");

			socket.on("connect_error", (err: any) => {
				console.log("str2str:connect_error", err);
				$rootScope.$emit("str2str:error", err);
			});

			socket.on("connect_timeout", (err: any) => {
				console.log("str2str:connect_timeout", err);
				$rootScope.$emit("str2str:error", err);
			});

			socket.on("error", (err: any) => {
				console.log("str2str:error", err);
				$rootScope.$emit("str2str:error", err);
			});

			socket.on("reconnect_error", (err: any) => {
				console.log("str2str:reconnect_error", err);
				$rootScope.$emit("str2str:error", err);
			});

			socket.on("reconnect_failed", (err: any) => {
				console.log("str2str:reconnect_failed", err);
				$rootScope.$emit("str2str:error", err);
			});

			socket.on("connect", () => {
				console.log("str2str:connect");
				$rootScope.$emit("str2str:connect");
			});
			socket.on("disconnect", () => {
				console.log("str2str:disconnect");
				$rootScope.$emit("str2str:disconnect");
			});
			socket.on("message", (msg: IMessage) => {
				console.log("str2str:message", msg);
				switch (msg.type) {
					case "close":
						$rootScope.$emit("str2str:close", (msg as ICloseMessage));
						break;
					case "stderr":
						$rootScope.$emit("str2str:stderr", (msg as IStdErrMessage));
						break;
					case "status":
						$rootScope.$emit("str2str:status", (msg as IStatusMessage));
						break;
					case "log_line":
						$rootScope.$emit("str2str:log_line", (msg as ILogLineMessage));
						break;
					default:
						console.log("str2str:message type unrecognized", msg);
				}
			});

			const service: ILiveLogsService = {
			};

			return service;

		}
	};
}
