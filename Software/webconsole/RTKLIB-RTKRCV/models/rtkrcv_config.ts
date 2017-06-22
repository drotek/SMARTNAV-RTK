
// usage: rtkrcv [-s][-p port][-d dev][-o file][-w pwd][-r level][-t level][-sta sta]
// options
//   -s         start RTK server on program startup
//   -p port    port number for telnet console
//   -m port    port number for monitor stream
//   -d dev     terminal device for console
//   -o file    processing options file
//   -w pwd     login password for remote console ("": no password)
//   -r level   output solution status file (0:off,1:states,2:residuals)
//   -t level   debug trace level (0:off,1-5:on)
//   -fl file   log file [rtkrcv_%Y%m%d%h%M.trace]",
//   -fs file   stat file [rtkrcv_%Y%m%d%h%M.stat]",
//   -sta sta   station name for receiver dcb

export const DEFAULT_CONSOLE_PORT = 12000;

export interface IRTKRCVConfig {
	options_file: string;

	trace_level: number; //0-5
	log_file: string;
	stat_file: string;

	output_solution_status_file_level: number;
	console_port: number;
	monitor_port: number;
	login_password: string;
	station_name: string;
	enabled: boolean;
}