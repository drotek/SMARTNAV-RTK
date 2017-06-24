// connect to localhost 12001
// parse lines:
// 2016/10/30 19:41:04.400   40.175361994 -105.032540844  1500.2004   5   7   6.7664   5.0473  13.7060  -3.7874   1.1799  -5.4925   0.00    0.0
// 2016/10/30 19:41:04.600   40.175362329 -105.032540835  1500.2729   5   7   6.7664   5.0473  13.7059  -3.7874   1.1813  -5.4925   0.00    0.0
// 2016/10/30 19:41:04.800   40.175361976 -105.032539972  1500.1671   5   7   6.7663   5.0474  13.7057  -3.7875   1.1828  -5.4926   0.00    0.0
// 2016/10/30 19:41:05.000   40.175361280 -105.032539610  1500.0288   5   7   6.7662   5.0474  13.7055  -3.7875   1.1842  -5.4926   0.00    0.0
// 2016/10/30 19:41:05.200   40.175360467 -105.032539551  1500.0942   5   7   6.7661   5.0474  13.7053  -3.7876   1.1856  -5.4926   0.00    0.0

// regex: ^(\d*\/\d*\/\d*\s\d*:\d*:\d*.\d*)\s*(-?\d*.\d*)\s*(-?\d*.\d*)\s*(-?\d*.\d*)\s*(\d*)\s*(\d*)\s*(-?\d*.\d*)\s*(-?\d*.\d*)\s*(-?\d*.\d*)\s*(-?\d*.\d*)\s*(-?\d*.\d*)\s*(-?\d*.\d*)\s*(-?\d*.\d*)\s*(-?\d*.\d*)$
// or... split by space

// Time
// The epoch time of the solution indicating the true receiver signal
// reception time (not indicates the time by receiver clock). The format
// is varied to the options.
//
// yyyy/mm/dd HH:MM:SS.SSS :
// Calendar time in GPST, UTC or  JST,  the time system is indicated in
// Field indicator
//
// WWWW SSSSSSS.SSS :
// GPS week and TOW (time of week) in  seconds.

// Receiver Position
// The rover receive antenna or marker position estimated varied
// according to the positioning options.
//
// +ddd.ddddddddd +ddd.dddddddd hhhh.hhhh :
// Latitude, longitude in degrees and height in m. Minus value means
// south latitude or west longitude. The height indicates ellipsoidal or
// geodetic according to the positioning options.
//
// +ddd mm ss.sss +ddd mm ss.sss hhhh.hhhh :
// Latitude, longitude in degree, minute and second and height in m.
//
// +xxxxxxxxx.xxxx +yyyyyyyyy.yyyy +zzzzzzzz.zzzz :
// X/Y/Z components of ECEF frame in m.
//
// +eeeeeeeee.eeee +nnnnnnnnn.nnnn +uuuuuuuuu.uuuu :
// E/N/U components of baseline vector in m. The local coordinate is
// referenced to the rover position

// Quality flag (Q)
// The flag which indicates the solution quality.
// 1 : Fixed, solution by carrier‐based relative positioning and the
// integer ambiguity is properly resolved.
// 2 : Float, solution by carrier‐based relative positioning but the
// integer ambiguity is not resolved.
// 3 : sbas
// 4 : DGPS, solution by code‐based DGPS solutions or single point
// positioning with SBAS corrections
// 5 : Single, solution by single point positioning
// 6 : ppp

// Standard deviations (sdn, sde, sdu,sdne, sdeu,sdun):
// The estimated standard deviations of the solution assuming a priori
// error model and error parameters by the positioning options.
// The sdn, sde or sdu means N (north), E (east) or U (up)
// component of the standard deviations in m. The absolute value of
// sdne, sdeu or sdun means square root of the absolute value of NE,
// EU or UN component of the estimated covariance matrix. The sign
// represents the sign of the covariance. With all of the values, user can
// reconstruct the full covariance matrix

// Age of differential (age):
// The time difference between the observation data epochs of the
// rover receiver and the base station in second.

// Ratio factor (ratio):
// The ratio factor of ʺratio‐testʺ for standard integer ambiguity
// validation strategy. The value means the ratio of the squared sum of
// the residuals with the second best integer vector to with the best
// integer vector.

interface IPosition {
	timestamp: Date;
	latitude: number; // (deg)
	longitude: number; // (deg)
	height: number; // (m)
	quality_flag: number; // 1:fix,2:float,3:sbas,4:dgps,5:single,6:ppp
	valid_satellites: number;
	sdn: number; // (m)
	sde: number; // (m)
	sdu: number; // (m)
	sdne: number; // (m)
	sdeu: number; // (m)
	sdun: number; // (m)
	age: number; // (s)
	ratio: number;
}

import events = require("events");
import readline = require("readline");

import net = require("net");
import stream = require("stream");

import * as logger from "../utilities/logger";
const log = logger.getLogger("rtkrcv_monitor");

export class RTKRCV_Monitor extends events.EventEmitter {
	public is_connected: boolean;

	protected _client: net.Socket;
	protected _passthrough_stream: stream.Readable;
	protected _readline: readline.ReadLine;

	constructor(public server_address: string, public server_port: number) {
		super();

		this._passthrough_stream = new stream.PassThrough();

		this._readline = readline.createInterface({
			input: this._passthrough_stream
		});

		this._readline.on("line", (input: string) => {
			if (!input || input.length === 0) {
				log.debug("empty line");
				return;
			}
			log.debug(`line: ${input}`);
			this.emit("line", input);

			const posdata = input.split(/\s+/);

			if (posdata.length >= 15) {

				const position: IPosition = {
					timestamp: new Date(posdata[0] + " " + posdata[1]),
					latitude: parseFloat(posdata[2]),
					longitude: parseFloat(posdata[3]),
					height: parseFloat(posdata[4]),
					quality_flag: parseInt(posdata[5]),
					valid_satellites: parseInt(posdata[6]),
					sdn: parseFloat(posdata[7]),
					sde: parseFloat(posdata[8]),
					sdu: parseFloat(posdata[9]),
					sdne: parseFloat(posdata[10]),
					sdeu: parseFloat(posdata[11]),
					sdun: parseFloat(posdata[12]),
					age: parseFloat(posdata[13]),
					ratio: parseFloat(posdata[14]),
				};

				log.info("position", position);
				this.emit("position", position);
			} else {
				log.debug("position should have 15 fields");
			}
		});

		this.is_connected = false;

	}

	public start() {
		if (this._client) {
			log.error("monitor is already started");
			throw new Error("monitor is already started");
		}
		this._client = new net.Socket();

		this._client.on("connect", () => {
			log.info("monitor connected", this.server_port, this.server_address);
			this.is_connected = true;
		});

		this._client.on("data", (data) => {
			if (data && data.length > 0) {
				log.debug("received: ", data, data.length);
				this._passthrough_stream.push(data);
			}
		});

		this._client.on("close", (had_error) => {
			log.info("closed with error", had_error);
			this.is_connected = false;

			// reconnect if error
			if (had_error) {
				setTimeout(() => {
					log.info("reconnecting");
					this.connect();
				}, 1000);
			}
		});

		this._client.on("error", (err) => {
			log.error("error", err);
			this.is_connected = false;
		});

		this.connect();
	}

	public stop() {
		this._client.end();
		this._client = null;
		// client.destroy(); // kill client after server's response
	}

	protected connect() {
		if (this._client) {
			this._client.connect(this.server_port, this.server_address);
		}
	}
}
