// connect to localhost 12000

import events = require("events");
import readline = require("readline");

import net = require("net");
import stream = require("stream");

import * as logger from "../utilities/logger";
const log = logger.getLogger("rtkrcv_client");

// solution

// status

// Parameter                   : Value
// rtklib version              : 2.4.3 b26
// rtk server thread           : 324
// rtk server state            : run
// processing cycle (ms)       : 100
// positioning mode            : single
// frequencies                 : L1
// accumulated time to run     : 00:00:12.5
// cpu time for a cycle (ms)   : 5
// missing obs data count      : 6
// bytes in input buffer       : 0,0
// # of input data rover       : obs(9),nav(0),gnav(0),ion(0),sbs(6),pos(0),dgps(0),ssr(0),err(0)
// # of input data base        : obs(0),nav(0),gnav(0),ion(0),sbs(0),pos(0),dgps(0),ssr(0),err(0)
// # of input data corr        : obs(0),nav(0),gnav(0),ion(0),sbs(0),pos(0),dgps(0),ssr(0),err(0)
// # of rtcm messages rover    :
// # of rtcm messages base     :
// # of rtcm messages corr     :
// solution status             : -
// time of receiver clock rover: 2016/10/30 20:13:14.000000000
// time sys offset (ns)        : 0.000,0.000,0.000,0.000
// solution interval (s)       : 0.000
// age of differential (s)     : 0.000
// ratio for ar validation     : 0.000
// # of satellites rover       : 12
// # of satellites base        : 0
// # of valid satellites       : 0
// GDOP/PDOP/HDOP/VDOP         : 0.0,0.0,0.0,0.0
// # of real estimated states  : 3
// # of all estimated states   : 3
// pos xyz single (m) rover    : 0.000,0.000,0.000
// pos llh single (deg,m) rover: 0.00000000,0.00000000,0.000
// vel enu (m/s) rover         : 0.000,0.000,0.000
// pos xyz float (m) rover     : 0.000,0.000,0.000
// pos xyz float std (m) rover : 0.000,0.000,0.000
// pos xyz fixed (m) rover     : 0.000,0.000,0.000
// pos xyz fixed std (m) rover : 0.000,0.000,0.000
// pos xyz (m) base            : 6378137.000,0.000,0.000
// pos llh (deg,m) base        : 0.00000000,0.00000000,0.000
// # of average single pos base: 0
// ant type rover              :
// ant delta rover             : 0.000 0.000 0.000
// ant type base               :
// ant delta base              : 0.000 0.000 0.000
// vel enu (m/s) base          : 0.000,0.000,0.000
// baseline length float (m)   : 0.000
// baseline length fixed (m)   : 0.000
// monitor port                : 12001

export interface IStatus {
	[name: string]: string;
}

// satellite

// SAT C1    Az   El L1 L2  Fix1  Fix2  P1Res  P2Res   L1Res   L2Res  Sl1  Sl2  Lock1  Lock2 Rj1 Rj2
// G04  -  35.2  3.0  -  -     -     -  0.000  0.000  0.0000  0.0000    0    0      0      0   0   0
// G10 OK 266.8 37.8  -  -     -     - -1.340  0.000  0.0000  0.0000    0    0      0      0   0   0
// G13 OK  42.5 20.4  -  -     -     -  0.463  0.000  0.0000  0.0000    0    0      0      0   0   0
// G15 OK  60.0 48.0  -  -     -     - -0.176  0.000  0.0000  0.0000    0    0      0      0   0   0
// G16  - 275.1  7.9  -  -     -     -  0.000  0.000  0.0000  0.0000    0    0      0      0   0   0
// G18 OK 300.0 70.4  -  -     -     -  0.584  0.000  0.0000  0.0000    0    0      0      0   0   0
// G20 OK  62.8 39.0  -  -     -     - -1.556  0.000  0.0000  0.0000    0    0      0      0   0   0
// G21 OK  65.2 82.1  -  -     -     -  0.750  0.000  0.0000  0.0000    0    0      0      0   0   0
// G24 OK 118.9 16.1  -  -     -     -  0.421  0.000  0.0000  0.0000    0    0      0      0   0   0
// G27 OK 312.4 26.3  -  -     -     -  0.707  0.000  0.0000  0.0000    0    0      0      0   0   0
// G29 OK 172.0 18.5  -  -     -     -  0.151  0.000  0.0000  0.0000    0    0      0      0   0   0
// G32  - 205.7  9.8  -  -     -     -  0.000  0.000  0.0000  0.0000    0    0      0      0   0   0

export interface ISatellite {
	SAT: string;
	C1: string;
	Az: number;
	El: number;
	L1: number;
	L2: number;
	Fix1: string;
	Fix2: string;
	P1Res: number;
	P2Res: number;
	L1Res: number;
	L2Res: number;
	Sl1: number;
	Sl2: number;
	Lock1: number;
	Lock2: number;
	Rj1: number;
	Rj2: number;
}

// observ

//       TIME(GPST)       SAT R        P1(m)        P2(m)       L1(cyc)       L2(cyc)  D1(Hz)  D2(Hz) S1 S2 LLI
// 2016/10/30 20:14:52.20 G04 1 25827645.077        0.000   3999387.898         0.000 -1721.2     0.0 41  0 0 0
// 2016/10/30 20:14:52.20 G10 1 22391806.181        0.000  -5030082.989         0.000  1091.7     0.0 46  0 0 0
// 2016/10/30 20:14:52.20 G13 1 23723724.374        0.000   3280926.118         0.000 -1496.4     0.0 42  0 0 0
// 2016/10/30 20:14:52.20 G15 1 21543224.708        0.000   2101530.575         0.000  -974.5     0.0 48  0 0 0
// 2016/10/30 20:14:52.20 G16 1 25237323.140        0.000   2858198.404         0.000 -1051.4     0.0 38  0 0 0
// 2016/10/30 20:14:52.20 G18 1 20896474.337        0.000  -1681040.313         0.000   249.0     0.0 47  0 0 0
// 2016/10/30 20:14:52.20 G20 1 21985539.277        0.000   2732118.280         0.000 -1191.8     0.0 45  0 0 0
// 2016/10/30 20:14:52.20 G21 1 20980232.669        0.000  -1241649.853         0.000   111.3     0.0 47  0 0 0
// 2016/10/30 20:14:52.20 G24 1 24095054.119        0.000  -1989480.917         0.000  1308.3     0.0 29  0 0 0
// 2016/10/30 20:14:52.20 G27 1 23207697.865        0.000  -3045811.265         0.000  1123.5     0.0 41  0 0 0
// 2016/10/30 20:14:52.20 G29 1 23787412.778        0.000   7570691.829         0.000 -1882.3     0.0 37  0 0 0
// 2016/10/30 20:14:52.20 G32 1 24904036.668        0.000  -4581364.470         0.000  1895.9     0.0 40  0 0 0

export interface IObserv {
	timestamp: Date;
	SAT: string;
	R: number;
	P1: number;
	P2: number;
	L1: number;
	L2: number;
	D1: number;
	D2: number;
	S1: number;
	S2: number;
	LLI1: number;
	LLI2: number;
}

// navidata

// SAT   S IOD IOC FRQ A/A SVH                 Toe                 Toc             Ttr/Tof L2C L2P
// G04   -  61  61   0   2 03F 2016/10/30 22:00:00 2016/10/30 22:00:00 2016/10/30 20:13:36   1   0
// G10  OK  95  95   0   0 000 2016/10/30 22:00:00 2016/10/30 22:00:00 2016/10/30 20:13:36   1   0
// G13  OK  84  84   0   0 000 2016/10/30 22:00:00 2016/10/30 22:00:00 2016/10/30 20:13:36   1   0
// G15  OK  61  61   0   0 000 2016/10/30 22:00:00 2016/10/30 22:00:00 2016/10/30 20:13:36   1   0
// G16  OK  38  38   0   0 000 2016/10/30 22:00:00 2016/10/30 22:00:00 2016/10/30 20:13:36   1   0
// G18  OK  31  31   0   0 000 2016/10/30 22:00:00 2016/10/30 22:00:00 2016/10/30 20:13:36   1   0
// G20  OK 104 104   0   0 000 2016/10/30 22:00:00 2016/10/30 22:00:00 2016/10/30 20:13:36   1   0
// G21  OK  68  68   0   0 000 2016/10/30 22:00:00 2016/10/30 22:00:00 2016/10/30 20:13:36   1   0
// G24  OK 100 100   0   0 000 2016/10/30 22:00:00 2016/10/30 22:00:00 2016/10/30 20:13:36   1   0
// G27  OK   9   9   0   0 000 2016/10/30 22:00:00 2016/10/30 22:00:00 2016/10/30 20:13:36   1   0
// G29  OK  27  27   0   0 000 2016/10/30 22:00:00 2016/10/30 22:00:00 2016/10/30 20:13:36   1   0
// G32  OK  22  22   0   0 000 2016/10/30 22:00:00 2016/10/30 22:00:00 2016/10/30 20:13:36   1   0
// R01  OK  93   0   1   0  00 2016/10/30 20:15:17                   - 2016/10/30 20:13:47   0   0
// R02  OK  93   0  -4   0  00 2016/10/30 20:15:17                   - 2016/10/30 20:13:47   0   0
// R03  OK  93   0   5   0  00 2016/10/30 20:15:17                   - 2016/10/30 20:13:47   0   0
// R10  OK  93   0  -7   0  00 2016/10/30 20:15:17                   - 2016/10/30 20:13:47   0   0
// R11  OK  93   0   0   0  00 2016/10/30 20:15:17                   - 2016/10/30 20:13:47   0   0
// R17  OK  93   0   4   0  00 2016/10/30 20:15:17                   - 2016/10/30 20:13:47   0   0
// R18  OK  93   0  -3   0  00 2016/10/30 20:15:17                   - 2016/10/30 20:13:47   0   0
// R24  OK  93   0   2   0  00 2016/10/30 20:15:17                   - 2016/10/30 20:13:47   0   0
// ION:  0.00E+00  0.00E+00  0.00E+00  0.00E+00  0.00E+00  0.00E+00  0.00E+00  0.00E+00
// UTC:  0.00E+00  0.00E+00  0.00E+00  2.05E+03  LEAPS: 0

export interface ISATData {
	SAT: string;
	S: string;
	IOD: number;
	IOC: number;
	FRQ: number;
	AA: number;
	SVH: string;
	Toe: Date;
	Toc: Date;
	TtrTof: Date;
	L2C: number;
	L2P: number;
}

export interface INaviData {
	SAT: ISATData[];
	ION: number[];
	UTC: number[];
	LEAPS: number;
}

// stream

// Stream       Type     Fmt   S    In-byte  In-bps   Out-byte Out-bps Path                     Message
// input rover  serial   ubx   C    1009170    9667          0       0 COM8:9600                COM8
// input base   -        rtcm3 -          0       0          0       0
// input corr   -        sp3   -          0       0          0       0
// output sol1  -        llh   -          0       0          0       0
// output sol2  -        nmea  -          0       0          0       0
// log rover    file     -     C          0       0    1009170    9942 ../data/rov_%Y%m%d%h%M.u
// log base     file     -     C          0       0          0       0 ../data/bas_%Y%m%d%h%M.u
// log corr     -        -     -          0       0          0       0
// monitor      tcpsvr   llh   C          0       0      48727       7 :12001                   127.0.0.1

export interface IStream {
	stream: string;
	type: string;
	fmt: string;
	S: string;
	in_byte: number;
	in_bps: number;
	out_byte: number;
	out_bps: number;
	path: string;
	message: string;
}

export class RTKRCV_Client extends events.EventEmitter {
	public is_connected: boolean;

	protected _client: net.Socket;
	protected _passthrough_stream: stream.Readable;
	protected _readline: readline.ReadLine;

	constructor(public server_address: string, public server_port: number, public server_password: string) {
		super();

		this._passthrough_stream = new stream.PassThrough();

		this._readline = readline.createInterface({
			input: this._passthrough_stream
		});

		this._readline.on("line", (input) => {
			log.silly(`line: ${input}`);
			this.emit("line", input);
		});

		this.is_connected = false;

	}

	public async start() {
		if (this._client) {
			log.error("client is already started");
			throw new Error("client is already started");
		}
		this._client = new net.Socket();
		this._client.setNoDelay(true);

		return new Promise<boolean>(async (resolve, reject) => {

			this._client.on("connect", async () => {
				log.info("client connected", this.server_port, this.server_address);
				this.is_connected = true;

				// attempt login
				await this.send_command(this.server_password, 2000);
				resolve(true);
			});

			this._client.on("data", (data) => {
				log.silly("received: " + data);
				this._passthrough_stream.push(data);
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

			await this.connect();
		});
	}

	public stop() {
		if (this._client) {
			log.debug("closing client");
			this._client.destroy();
			this._client = null;
		}
	}

	public async send_command(command: string, timeout: number = 5000): Promise<string[]> {
		// send command, collect all results until the next "rtkrcv>"
		return new Promise<string[]>((resolve, reject) => {
			this._client.write(command + "\r\n\r\n");

			const result: string[] = [];
			let timeout_instance: NodeJS.Timer = null;

			const line_handler = (line: string) => {
				if (line === undefined || line == null) {
					reject("timeout");
					return;
				}

				result.push(line);

				if ((result.length === 1) && line.startsWith("rtkrcv>")) {
					return;
				}

				if (line.startsWith("rtkrcv>")) {
					this.removeListener("line", line_handler);
					if (timeout_instance) {
						clearTimeout(timeout_instance);
					}
					resolve(result.filter((fl) => !fl.startsWith("rtkrcv>") && fl !== ""));
				}
			};

			this.on("line", line_handler);
			timeout_instance = setTimeout(line_handler, timeout);

		});
	}

	public async get_solution() {
		const status = await this.send_command("solution");
		log.debug("got solution", status);

		throw new Error("not implemented");
	}

	public async get_status(): Promise<IStatus> {
		let status = await this.send_command("status");
		log.debug("got status", status);

		if (status && status.length > 0 && status[0].startsWith("Parameter")) {
			status = status.slice(1);
		}

		const pv: IStatus = {};
		status.forEach((v) => {
			const fields = [v.substr(0, v.indexOf(":")), v.substr(v.indexOf(":") + 1)].map((fv) => fv.trim());
			pv[fields[0]] = fields[1];
		});

		return pv;
	}

	public async get_satellite(): Promise<ISatellite[]> {
		let sats = await this.send_command("satellite");
		log.debug("got satellites", sats);

		if (sats && sats.length > 0 && sats[0].startsWith("SAT")) {
			sats = sats.slice(1);
		}

		const satellites = sats.map((v) => {
			const row = v.split(/\s+/);

			if (row.length < 18) {
				log.debug("too little fields for satellite fields", row);
				return null;
			}

			const sat: ISatellite = {
				SAT: row[0],
				C1: row[1],
				Az: parseFloat(row[2]),
				El: parseFloat(row[3]),
				L1: parseFloat(row[4]),
				L2: parseFloat(row[5]),
				Fix1: row[6],
				Fix2: row[7],
				P1Res: parseFloat(row[8]),
				P2Res: parseFloat(row[9]),
				L1Res: parseFloat(row[10]),
				L2Res: parseFloat(row[11]),
				Sl1: parseFloat(row[12]),
				Sl2: parseFloat(row[13]),
				Lock1: parseFloat(row[14]),
				Lock2: parseFloat(row[15]),
				Rj1: parseFloat(row[16]),
				Rj2: parseFloat(row[17])
			};
			return sat;
		});

		return satellites;
	}

	public async get_observ(): Promise<IObserv[]> {
		let observations = await this.send_command("observ");
		log.debug("got observations", observations);

		if (observations && observations.length > 0 && observations[0].trim().startsWith("TIME(GPST)")) {
			observations = observations.slice(1);
		}

		const parsed_observations = observations.map((v) => {
			const row = v.split(/\s+/);

			if (row.length < 14) {
				log.debug("too little fields for observation fields", row);
				return null;
			}

			const obs: IObserv = {
				timestamp: new Date(row[0] + " " + row[1]),
				SAT: row[2],
				R: parseInt(row[3]),
				P1: parseFloat(row[4]),
				P2: parseFloat(row[5]),
				L1: parseFloat(row[6]),
				L2: parseFloat(row[7]),
				D1: parseFloat(row[8]),
				D2: parseFloat(row[9]),
				S1: parseInt(row[10]),
				S2: parseInt(row[11]),
				LLI1: parseInt(row[12]),
				LLI2: parseInt(row[13])
			};
			return obs;
		});

		return parsed_observations;
	}

	public async get_navidata(): Promise<INaviData> {
		let navidata = await this.send_command("navidata");
		log.debug("got navidata", navidata);

		if (navidata && navidata.length > 0 && navidata[0].trim().startsWith("SAT")) {
			navidata = navidata.slice(1);
		}

		const parsed_navidata: INaviData = {
			ION: [],
			LEAPS: 0,
			SAT: [],
			UTC: []
		};

		navidata.forEach((element) => {
			const row = element.split(/\s+/);

			if (row[0] === "ION:") {
				for (let i = 1; i < row.length; i++) {
					parsed_navidata.ION.push(parseFloat(row[i]));
				}
			}

			if (row[0] === "UTC:") {
				for (let i = 1; i < row.length; i++) {
					if (row[i] === "LEAPS:") {
						parsed_navidata.LEAPS = parseInt(row[i + 1]);
						break;
					}
					parsed_navidata.UTC.push(parseFloat(row[i]));
				}
			}

			if (row.length < 14) {
				log.debug("too little fields for navigation data fields", row);
				return null;
			}

			const satdata: ISATData = {
				SAT: row[0],
				S: row[1],
				IOD: parseFloat(row[2]),
				IOC: parseFloat(row[3]),
				FRQ: parseFloat(row[4]),
				AA: parseFloat(row[5]),
				SVH: row[6],
				Toe: new Date(row[7] + " " + row[8]),
				Toc: new Date(row[9] + " " + row[10]),
				TtrTof: new Date(row[11] + " " + row[12]),
				L2C: parseInt(row[13]),
				L2P: parseInt(row[14])
			};
			parsed_navidata.SAT.push(satdata);
		});

		return parsed_navidata;
	}

	public async get_stream(): Promise<IStream[]> {
		let streams = await this.send_command("stream");
		log.debug("got streams", streams);

		if (streams && streams.length > 0 && streams[0].trim().startsWith("Stream")) {
			streams = streams.slice(1);
		}

		const colsRegex = new RegExp(/^(.{0,13})(.{0,9})(.{0,6})(.{0,1})(.{0,11})(.{0,8})(.{0,11})(.{0,8})(.{0,26})(.{0,99})$/gm);

		const results: IStream[] = [];
		streams.forEach((v) => {
			colsRegex.lastIndex = 0;
			const parsed = colsRegex.exec(v);
			results.push({
				stream: parsed[1].trim(),
				type: parsed[2].trim(),
				fmt: parsed[3].trim(),
				S: parsed[4].trim(),
				in_byte: parseInt(parsed[5]),
				in_bps: parseInt(parsed[6]),
				out_byte: parseInt(parsed[7]),
				out_bps: parseInt(parsed[8]),
				path: parsed[9].trim(),
				message: parsed[10].trim()
			}as IStream);
		});

		return results;
	}

	protected async connect() {
		if (this._client) {
			this._client.connect(this.server_port, this.server_address);
		}
	}

}
