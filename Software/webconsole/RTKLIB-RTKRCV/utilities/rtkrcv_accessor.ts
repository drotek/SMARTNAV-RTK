// connect to localhost 12000

import events = require("events");
import readline = require("readline");

import net = require("net");
import stream = require("stream");

import * as logger from "../utilities/logger";
const log = logger.getLogger("rtkrcv_client");

export class RTKRCV_Client extends events.EventEmitter {
	protected _client: net.Socket;
	public is_connected: boolean;

	protected _passthrough_stream: stream.Readable;
	protected _readline: readline.ReadLine;

	constructor(public server_address: string, public server_port: number, public server_password: string) {
		super();

		this._passthrough_stream = new stream.PassThrough();

		this._readline = readline.createInterface({
			input: this._passthrough_stream
		});

		this._readline.on("line", (input) => {
			log.debug(`line: ${input}`);
			this.emit("line", input);
		});

		this.is_connected = false;

	}

	public start() {
		if (this._client) {
			log.error("client is already started");
			throw new Error("client is already started");
		}
		this._client = new net.Socket();

		this._client.on("connect", async () => {
			log.info("client connected", this.server_port, this.server_address);
			this.is_connected = true;

			// attempt login
			await this.send_command(this.server_password, 2000);
		});

		this._client.on("data", (data) => {
			log.debug("received: " + data);
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

		this.connect();
	}

	public stop() {
		this._client.end();
		this._client = null;
		// client.destroy(); // kill client after server's response
	}

	public async send_command(command: string, timeout: number): Promise<string[]> {
		// send command, collect all results until the next "rtkrcv>"
		return new Promise<string[]>((resolve, reject) => {
			this._client.write(command + "\r\n");

			const result: string[] = [];
			let timeout_instance: NodeJS.Timer = null;

			const line_handler = (line: string) => {
				if (line === undefined) {
					reject("timeout");
				}

				result.push(line);
				if (line === "rtkrcv>") {
					this.removeListener("line", line_handler);
					if (timeout_instance) {
						clearTimeout(timeout_instance);
					}
					resolve(result);
				}
			};

			this.on("line", line_handler);
			timeout_instance = setTimeout(line_handler, timeout);

		});
	}

	protected connect() {
		if (this._client) {
			this._client.connect(this.server_port, this.server_address);
		}
	}
}
