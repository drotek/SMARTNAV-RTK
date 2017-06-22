
//  -in  stream[#format] input  stream path and format
//  -out stream[#format] output stream path and format

//   stream path
//     serial       : serial://port[:brate[:bsize[:parity[:stopb[:fctr]]]]]
//     tcp server   : tcpsvr://:port
//     tcp client   : tcpcli://addr[:port]
//     ntrip client : ntrip://[user[:passwd]@]addr[:port][/mntpnt]
//     ntrip server : ntrips://[:passwd@]addr[:port]/mntpnt[:str] (only out)
//     ntrip caster server: ntripc_s://[:passwd@][:port] (only in)
//     ntrip caster client: ntripc_c://[user:passwd@][:port]/mntpnt (only out)
//     file         : [file://]path[::T][::+start][::xseppd][::S=swap]

//   format
//     rtcm2        : RTCM 2 (only in)
//     rtcm3        : RTCM 3
//     nov          : NovAtel OEMV/4/6,OEMStar (only in)
//     oem3         : NovAtel OEM3 (only in)
//     ubx          : ublox LEA-4T/5T/6T (only in)
//     ss2          : NovAtel Superstar II (only in)
//     hemis        : Hemisphere Eclipse/Crescent (only in)
//     stq          : SkyTraq S1315F (only in)
//     gw10         : Furuno GW10 (only in)
//     javad        : Javad (only in )
//     nvs          : NVS BINR (only in )
//     binex        : BINEX (only in)
//     rt17         : Trimble RT17 (only in)
//     sbf          : Septentrio SBF (only in)
//     cmr          : CMR/CMR+ (only in)
const STREAM_FORMATS = [
	"rtcm2",
	"rtcm3",
	"nov",
	"oem3",
	"ubx",
	"ss2",
	"hemis",
	"stq",
	"gw10",
	"javad",
	"nvs",
	"binex",
	"rt17",
	"sbf",
	"cmr"
];

//  -msg "type[(tint)][,type[(tint)]...]"
//                    rtcm message types and output intervals (s)
//  -sta sta          station id
//  -opt opt          receiver dependent options
//  -s  msec          timeout time (ms) [10000]
//  -r  msec          reconnect interval (ms) [10000]
//  -n  msec          nmea request cycle (m) [0]
//  -f  sec           file swap margin (s) [30]
//  -c  file          input commands file [no]
//  -c1 file          output 1 commands file [no]
//  -c2 file          output 2 commands file [no]
//  -c3 file          output 3 commands file [no]
//  -c4 file          output 4 commands file [no]
//  -p  lat lon hgt   station position (latitude/longitude/height) (deg,m)
//  -px x y z         station position (x/y/z-ecef) (m)
//  -a  antinfo       antenna info (separated by ,)
//  -i  rcvinfo       receiver info (separated by ,)
//  -o  e n u         antenna offset (e,n,u) (m)
//  -l  local_dir     ftp/http local directory []
//  -x  proxy_addr    http/ntrip proxy address [no]
//  -b  str_no        relay back messages from output str to input str [no]
//  -t  level         trace level [0]
//  -ft file          ntrip souce table file []
//  -fl file          log file [str2str.trace]
//  -h                print help

export interface IStreamInfo {
	streamType: "serial" | "file" | "tcpsvr" | "tcpcli" | "udp" | "ntrips" | "ntripc" | "ftp" | "http";
	streamFormat: null | "" | "rtcm2" | "rtcm3" | "nov" | "oem3" | "ubx" | "ss2" | "hemis" | "stq" | "gw10" | "javad" | "nvs" | "binex" | "rt17" | "sbf" | "cmr";
	streamPath: string;
}

export interface IStationPositionDegrees {
	lat: number;
	lon: number;
	height: number;
}

export interface IStationPositionMeters {
	x: number;
	y: number;
	z: number;
}

export interface IAntennaOffset {
	e: number;
	n: number;
	u: number;
}

export interface ISTR2STRConfig {
	in_streams: IStreamInfo[];
	out_streams: IStreamInfo[];
	input_command_file: string;
	output_command_files: string[];

	station_id: number;
	relay_messages_back: boolean;

	timeout: number;
	reconnect_interval: number;
	nmea_request_cycle: number;
	file_swap_margin: number;
	station_position: IStationPositionDegrees | IStationPositionMeters;
	antenna_info: string[];
	receiver_info: string[];
	antenna_offset: IAntennaOffset;

	ftp_http_local_directory: string;
	http_ntrip_proxy_address: string;
	ntrip_souce_table_file: string;

	trace_level: number; // 0-5
	log_file: string;

	enabled: boolean;
}
