const log_line_regex = /(\d*)\s*(?:([\d.]*):)?(?:\s*([a-zA-Z]*):)(.*)$/gm;

export interface ILogLine {
	level: number;
	timestamp: number;
	module: string;
	message: string;
}

export function parse(line: string): ILogLine {
	log_line_regex.lastIndex = 0;
	if (log_line_regex.test(line)) {
		log_line_regex.lastIndex = 0;
		const parsed = log_line_regex.exec(line);
		return {
			level: parseInt(parsed[1] || "0"),
			timestamp: parseInt(parsed[2] || "-1"),
			module: parsed[3],
			message: parsed[4]

		} as ILogLine;
	}
	return null;
}
