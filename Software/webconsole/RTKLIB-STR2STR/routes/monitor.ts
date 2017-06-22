import * as fs from "../utilities/fs_wrapper";

import express = require("express");

import * as logger from "../utilities/logger";
const log = logger.getLogger("admin");

import * as str2str from "../utilities/str2str";

import * as config from "../config";

import socketio = require("socket.io");

import { Application } from "../app";

export default function monitorModule(application: Application) {
	const app = application.app;
	const io = socketio();

	application.server.on("listening", () => {
		log.info("server listening, adding websocket");
		io.listen(application.server);
	});

	io.on("connection", (socket) => {
		log.info("monitor connected");

		application.monitor_events.on("close", (code: number) => {
			socket.send({
				type: "close",
				code
			});
		});

		application.monitor_events.on("stderr", (data: string) => {
			socket.send({
				type: "stderr",
				data
			});
		});

		application.monitor_events.on("stdout", (data: string) => {
			socket.send({
				type: "stdout",
				data
			});
		});

		application.monitor_events.on("line", (line: string) => {
			socket.send({
				type: "line",
				line
			});
		});

		socket.on("messages", (data: any) => {
			console.log("monitor message", (data));
		});
	});
}
