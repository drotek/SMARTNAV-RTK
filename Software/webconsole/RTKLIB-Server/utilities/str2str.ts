import { execution_manager } from "./execution_manager";

import * as logger from "../utilities/logger";
const log = logger.getLogger("admin");

import * as config from "../config";

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

export interface ISTR2STRConfig {
	in_streams : IStreamInfo[];
	out_streams : IStreamInfo[];
	command: string;
	station_id: string;
	relay_messages_back : boolean;
	enabled:boolean;
}

export class str2str extends execution_manager {
	private static parse_config(str2str_config: ISTR2STRConfig): string[] {
		log.debug("str2str parsing config",str2str_config);
		let ret: string[]; ret = [];
		if (str2str_config.command) {
			ret.push("-c");
			ret.push(str2str_config.command);

		}
		if (str2str_config.in_streams && str2str_config.in_streams.length) {
			for (let in_stream of str2str_config.in_streams){
				// if (in_stream.streamFormat && STREAM_FORMATS.indexOf(in_stream.streamFormat) === -1) {
				// 	throw new Error("in stream format is invalid:" + in_stream.streamFormat);
				// }

				if (in_stream.streamPath){
					ret.push("-in");
					ret.push(((in_stream.streamType) ? in_stream.streamType + "://" : "") + in_stream.streamPath);// + ((in_stream.streamFormat) ? "#" + in_stream.streamFormat : ""));
				}
			}
		}

		if (str2str_config.out_streams && str2str_config.out_streams.length) {
			for (let out_stream of str2str_config.out_streams){
				// if (out_stream.streamFormat && STREAM_FORMATS.indexOf(out_stream.streamFormat) === -1) {
				// 	throw new Error("out stream format is invalid:" + out_stream.streamFormat);
				// }

				if (out_stream.streamPath){
					ret.push("-out");
					ret.push(((out_stream.streamType)?  out_stream.streamType + "://" : "") + out_stream.streamPath);// + ((out_stream.streamFormat) ? "#" + out_stream.streamFormat : ""));
				}
			}
		}

		if (str2str_config.station_id) {
			ret.push("-sta");
			ret.push(str2str_config.station_id);
		}

		if (str2str_config.relay_messages_back != undefined ){
			if (str2str_config.relay_messages_back){
				ret.push("-b");
				ret.push("yes");
			}
		}

		ret.push("-t");
		ret.push("5");

		return ret;
	}
	constructor(public str2str_config: ISTR2STRConfig) {
		super(config.str2str, str2str.parse_config(str2str_config));
	}

}
