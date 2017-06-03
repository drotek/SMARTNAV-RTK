import * as logger from "../utilities/logger";
const log = logger.getLogger("execution_manager");

import child_process = require("child_process");
const spawn = child_process.spawn;

import events = require("events");

export class execution_manager extends events.EventEmitter {
	private _process: child_process.ChildProcess;

	private _stdout: string;
	private _stderr: string;

	private _active: boolean;

	constructor(private command: string, private args?: string[]) {
		super();
		this._active = false;
		log.debug("initializing ", command, args);
	}

	public start(): void {
		if (!this._process) {
			log.error("error starting, already active ", this.command, this.args);
			throw new Error("already active");
		}

		this._stderr = "";
		this._stdout = "";

		this._process = spawn(this.command, this.args, { shell: true });

		this._process.stdout.on("data", (data) => {
			log.debug("stdout", this.command, this.args, data);
			this.emit("stdout", data);
			this._stdout += data;
		});

		this._process.stderr.on("data", (data) => {
			log.debug("stderr", this.command, this.args, data);
			this.emit("stderr", data);
			this._stderr += data;
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
		}
	}

	public status(): boolean {
		return this._active;
	}

	public stdout(): string {
		return this._stdout;
	}

	public stderr(): string {
		return this._stderr;
	}

	public on(event: "stdout" | "stderr", listener: (data: string) => void): this;
	public on(event: "close", listener: (code: number) => void): this;
	public on(event: string | symbol, listener: () => void): this {
		return super.on(event, listener);
	}
}
