import serialport = require("serialport");

export async function list(): Promise<serialport.portConfig[]> {
	return new Promise<serialport.portConfig[]>((resolve, reject) => {
		serialport.list((err, ports) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(ports);
		});
	});
}
