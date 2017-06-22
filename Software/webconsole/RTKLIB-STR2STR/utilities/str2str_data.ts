const StatusRegEx = /^\s*(\d*)\/(\d*)\/(\d*)\s(\d*):(\d*):(\d*)\s(\[\S*\])\s*(\d*)\s*B\s*(\d*)\s*bps\s*\((\d*)\)\s*(.*)$/gm;
// 2017/06/22 18:25:26 [CC---]      56922 B    7265 bps (0) COM8

export interface IParsedStatus {
	timestamp: Date;
	unknown: string;
	received: number;
	bps: number;
	unknown1: string;
	msg: string;
}

export function parse_status(value: string): IParsedStatus {
	StatusRegEx.lastIndex = 0;
	if (!StatusRegEx.test(value)) {
		return null;
	}
	StatusRegEx.lastIndex = 0;
	const parsed = StatusRegEx.exec(value);
	return {
		timestamp: new Date(parseInt(parsed[1]), parseInt(parsed[2]), parseInt(parsed[3]), parseInt(parsed[4]), parseInt(parsed[5]), parseInt(parsed[6])),
		unknown: parsed[7],
		received: parseInt(parsed[8]),
		bps: parseInt(parsed[9]),
		unknown1: parsed[10],
		msg: parsed[11]
	} as IParsedStatus;
}
