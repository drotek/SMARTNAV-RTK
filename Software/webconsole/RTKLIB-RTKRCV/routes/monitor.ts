import * as fs from "../utilities/fs_wrapper";

import express = require("express");

import * as logger from "../utilities/logger";
const log = logger.getLogger("admin");

import * as config from "../config";

import socketio = require("socket.io");

import { Application } from "../app";

import * as log_parser from "../models/log_parser";

export default function monitorModule(application: Application) {
	const app = application.app;
	const io = socketio();

	application.server.on("listening", () => {
		log.info("server listening, adding websocket");
		io.listen(application.server);
	});

	// tslint:disable-next-line:prefer-const
	let sockets: SocketIO.Socket[] = [];

	application.monitor_events.on("close", (code: number) => {
		log.debug("sending close", code);
		for (let i = 0; i < sockets.length; i++) {
			if (sockets[i] && !sockets[i].connected) {
				sockets[i] = null;
			}
			if (sockets[i]) {
				sockets[i].send({
					type: "close",
					code
				});
			}
		}
	});

	application.monitor_events.on("stderr", (data: string) => {
		log.debug("sending stderr", data);
		for (let i = 0; i < sockets.length; i++) {
			if (sockets[i] && !sockets[i].connected) {
				sockets[i] = null;
			}
			if (sockets[i]) {
				sockets[i].send({
					type: "stderr",
					data
				});
			}
		}
	});

	application.monitor_events.on("stdout", (data: string) => {
		log.debug("sending stdout", data);
		for (let i = 0; i < sockets.length; i++) {
			if (sockets[i] && !sockets[i].connected) {
				sockets[i] = null;
			}
			if (sockets[i]) {
				sockets[i].send({
					type: "stdout",
					data
				});
			}
		}
	});

	application.monitor_events.on("status", (data: string) => {
		log.debug("sending status", data);
		for (let i = 0; i < sockets.length; i++) {
			if (sockets[i] && !sockets[i].connected) {
				sockets[i] = null;
			}
			if (sockets[i]) {
				sockets[i].send({
					type: "status",
					data
				});
			}
		}
	});

	application.monitor_events.on("log_line", (line: log_parser.ILogLine) => {
		log.debug("sending log line", line);
		for (let i = 0; i < sockets.length; i++) {
			if (sockets[i] && !sockets[i].connected) {
				sockets[i] = null;
			}
			if (sockets[i]) {
				sockets[i].send({
					type: "log_line",
					line
				});
			}
		}
	});

	application.monitor_events.on("line", (line: string) => {
		log.debug("sending line", line);
		for (let i = 0; i < sockets.length; i++) {
			if (sockets[i] && !sockets[i].connected) {
				sockets[i] = null;
			}
			if (sockets[i]) {
				sockets[i].send({
					type: "line",
					line
				});
			}
		}
	});

	io.on("connection", (socket) => {
		sockets.push(socket);
		log.info("monitor connected");

		socket.on("disconnect", () => {
			log.info("monitor disconnected");
			const socketIndex = sockets.indexOf(socket);
			if (socketIndex !== -1) {
				log.debug("monitor removed from collection successfully");
				sockets.splice(socketIndex, 1);
			}
		});
		socket.on("messages", (data: any) => {
			console.log("monitor message", (data));
		});
	});
}
