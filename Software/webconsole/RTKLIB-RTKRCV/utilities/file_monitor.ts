import * as logger from "../utilities/logger";
const log = logger.getLogger("file_monitor");

import * as fs from "./fs_wrapper";
import events = require("events");

import readline = require("readline");
import stream = require("stream");

export class FileMonitor extends events.EventEmitter {
	private _last_location: number;
	private _fileid: number;

	private _passthrough_stream: stream.Readable;
	private _readline: readline.ReadLine;

	constructor(public filename: string) {
		super();
		log.info("Monitoring", filename);
		this._last_location = 0;

		this._passthrough_stream = new stream.PassThrough();

		this._readline = readline.createInterface({
			input: this._passthrough_stream
		});

		this._readline.on("line", (input) => {
			console.log(`line: ${input}`);
			this.emit("line", input);
		});

		setImmediate(async () => {
			await this.init();
		});
	}

	public async close(): Promise<void> {
		if (this._fileid === 0) {
			return;
		}
		await fs.close(this._fileid);
		this._fileid = 0;
	}

	private async init() {
		this._fileid = await fs.open(this.filename, fs.constants.O_RDONLY, fs.constants.S_IROTH);

		const read_interval = async () => {
			if (this._fileid === 0) {
				return;
			}

			await this.check_delta();
			setTimeout(async () => {
				await read_interval();
			}, 100);
		};

		fs.watchFile(this.filename, (curr, prev) => {
			read_interval();
		});

	}

	private async check_delta() {
		// console.log("FILEID!!!!!!!!!!!!!", this._fileid);
		if (this._fileid === 0) {

			return;
		}

		const buf = new Buffer(1024);
		const bytes_read = await fs.read(this._fileid, buf, 0, 1024, this._last_location);
		this._passthrough_stream.push(buf.slice(0, bytes_read));
		this._last_location += bytes_read;
	}

}
