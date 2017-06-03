import fs = require("fs");

export const constants = fs.constants;

export async function exists(path: string | Buffer): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		fs.exists(path, (exists) => {
			resolve(exists);
		});
	});
}

export async function readdir(path: string | Buffer): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
		fs.readdir(path, (err, files) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(files);
		});
	});

}

export async function readFile(filename: string): Promise<Buffer>;
export async function readFile(filename: string, encoding: string): Promise<string>;
export async function readFile(filename: string, encoding?: string): Promise<string | Buffer> {
	return new Promise<string | Buffer>((resolve, reject) => {
		fs.readFile(filename, encoding, (err, data) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(data);
		});
	});

}

export async function open(path: string | Buffer, flags: string | number, mode?: number): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		fs.open(path, flags, mode, (err, fd) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(fd);
		});
	});
}

export async function read(fd: number, buffer: Buffer, offset: number, length: number, position: number | null): Promise<number> {
	return fs.readSync(fd, buffer, offset, length, position);
}

export async function write(fd: number, buffer: Buffer, offset: number, length: number, position?: number | null): Promise<number> {
	return fs.writeSync(fd, buffer, offset, length, position);
}

export async function close(fd: number): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		fs.close(fd, (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
}

export async function writeFile(filename: string, data: any, options?: { encoding?: string; mode?: string; flag?: string; }): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		fs.writeFile(filename, data, options, (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
}

export async function access(path: string | Buffer, mode?: number): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		fs.access(path, (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
}

export const createReadStream = fs.createReadStream;
