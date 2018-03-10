import * as logger from "../utilities/logger";
const log = logger.getLogger("execution_manager");

import child_process = require("child_process");
const spawn = child_process.spawn;

import events = require("events");
import path = require("path");

import stream = require("stream");

export class execution_manager extends events.EventEmitter {
	public stdout: stream.Readable;
	public stderr: stream.Readable;

	protected _stdout: string;
	protected _stderr: string;

	private _process: child_process.ChildProcess = null;
	private _active: boolean;

	constructor(private command: string, private args?: string[]) {
		super();
		this._active = false;
		log.debug("initializing ", command, args);

		process.on("exit", () => {
			this.stop();
		});
	}

	public start(): void {
		if (this._process) {
			log.error("error starting, already active ", this.command, this.args);
			throw new Error("already active");
		}

		this._stderr = "";
		this._stdout = "";

		const start_options: child_process.SpawnOptions = { detached: true, cwd: path.dirname(this.command), stdio: ["pipe", "pipe", "pipe", "ipc"] };

		log.info("starting", this.command, this.args, start_options);

		this._process = spawn(this.command, this.args, start_options);
		this._process.stdout.setEncoding("utf8");
		this._process.stderr.setEncoding("utf8");

		this.stdout = this._process.stdout;
		this.stderr = this._process.stderr;

		this._process.stdout.on("data", (data) => {
			log.info("stdout", this.command, this.args, data);
			this.preprocess("stdout", data.toString());
		});

		this._process.stderr.on("data", (data) => {
			log.error("stderr",
				(this.command && this.command.toString) ? this.command.toString() : this.command,
				(this.args && this.args.toString) ? this.args.toString() : this.args,
				(data && data.toString) ? data.toString() : data);
			this.preprocess("stderr", data.toString());
		});

		this._process.on("close", (code) => {
			log.debug("close", this.command, this.args, code);
			this.emit("close", code);
			this._active = false;
			this._process = null;
		});
		this._active = true;

	}

	public stop(): void {
		if (this._process) {
			log.debug("killing", this.command, this.args);
			this._process.kill();
			this._process.kill("SIGINT");
			this._process.kill("SIGTERM");

			this._process = null;
		}
	}

	public status(): boolean {
		return this._active;
	}

	public getStdout(): string {
		return this._stdout;
	}

	public getStderr(): string {
		return this._stderr;
	}

	public on(event: "stdout" | "stderr", listener: (data: string) => void): this;
	public on(event: "close", listener: (code: number) => void): this;
	public on(event: string | symbol, listener: (() => void) | ((...p: any[]) => void)): this {
		return super.on(event, listener);
	}

	protected preprocess(output_type: "stdout" | "stderr", data: string) {
		switch (output_type) {
			case "stdout":
				this.emit("stdout", data);
				this._stdout += data;
				break;
			case "stderr":
				this.emit("stderr", data);
				this._stderr += data;
				break;
			default:
				log.error("unable to preprocess, output type does not exist", output_type, data, "discarding message");
		}
	}
}
