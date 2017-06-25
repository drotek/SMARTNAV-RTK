import * as fs from "../utilities/fs_wrapper";

import express = require("express");

import * as logger from "../utilities/logger";
const log = logger.getLogger("admin");

import * as config from "../config";

import socketio = require("socket.io");

import { Application } from "../app";

import * as log_parser from "../models/log_parser";
import * as rtkrcv_config from "../models/rtkrcv_config";
import * as rtkrcv_accessor from "../utilities/rtkrcv_accessor";
import * as rtkrcv_monitor from "../utilities/rtkrcv_monitor";

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

	application.monitor_events.on("position", (position: rtkrcv_monitor.IPosition) => {
		log.debug("sending position", position);
		for (let i = 0; i < sockets.length; i++) {
			if (sockets[i] && !sockets[i].connected) {
				sockets[i] = null;
			}
			if (sockets[i]) {
				sockets[i].send({
					type: "position",
					position
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

	app.get("/lastPosition", async (req, res) => {
		log.info("GET /lastPosition");

		log.debug("GET /lastPosition result", application.last_position);
		res.json(application.last_position);
	});

	app.get("/getSolution", async (req, res) => {
		log.info("GET /getSolution");
		const config = await rtkrcv_config.get_configuration();
		const accessor = new rtkrcv_accessor.RTKRCV_Client("localhost", config.console_port, config.login_password);
		await accessor.start();

		const solution = await accessor.get_solution();

		accessor.stop();

		log.debug("GET /getSolution result", solution);
		res.json(solution);
	});
	app.get("/getStatus", async (req, res) => {
		log.info("GET /getStatus");
		const config = await rtkrcv_config.get_configuration();
		const accessor = new rtkrcv_accessor.RTKRCV_Client("localhost", config.console_port, config.login_password);
		await accessor.start();

		const status = await accessor.get_status();

		accessor.stop();

		log.debug("GET /getStatus result", status);
		res.json(status);
	});
	app.get("/getSatellite", async (req, res) => {
		log.info("GET /getSatellite");
		const config = await rtkrcv_config.get_configuration();
		const accessor = new rtkrcv_accessor.RTKRCV_Client("localhost", config.console_port, config.login_password);
		await accessor.start();

		const satellites = await accessor.get_satellite();

		accessor.stop();

		log.debug("GET /getSatellite result", satellites);
		res.json(satellites);

	});
	app.get("/getObserv", async (req, res) => {
		log.info("GET /getObserv");
		const config = await rtkrcv_config.get_configuration();
		const accessor = new rtkrcv_accessor.RTKRCV_Client("localhost", config.console_port, config.login_password);
		await accessor.start();

		const observ = await accessor.get_observ();

		accessor.stop();

		log.debug("GET /getObserv result", observ);
		res.json(observ);

	});
	app.get("/getNavidata", async (req, res) => {
		log.info("GET /getNavidata");
		const config = await rtkrcv_config.get_configuration();
		const accessor = new rtkrcv_accessor.RTKRCV_Client("localhost", config.console_port, config.login_password);
		await accessor.start();

		const navidata = await accessor.get_navidata();

		accessor.stop();

		log.debug("GET /getNavidata result", navidata);
		res.json(navidata);

	});
	app.get("/getStream", async (req, res) => {
		log.info("GET /getStream");
		const config = await rtkrcv_config.get_configuration();
		const accessor = new rtkrcv_accessor.RTKRCV_Client("localhost", config.console_port, config.login_password);
		await accessor.start();

		const streams = await accessor.get_stream();

		accessor.stop();

		log.debug("GET /getStream result", streams);
		res.json(streams);

	});
}
