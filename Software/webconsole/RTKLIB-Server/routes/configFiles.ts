/*
 * RTKLIB WEB CONSOLE code is placed under the GPL license.
 * Written by Frederic BECQUIER (frederic.becquier@openiteam.fr)
 * Copyright (c) 2016, DROTEK SAS
 * All rights reserved.

 * If you are interested in using RTKLIB WEB CONSOLE code as a part of a
 * closed source project, please contact DROTEK SAS (contact@drotek.com).

 * This file is part of RTKLIB WEB CONSOLE.

 * RTKLIB WEB CONSOLE is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * RTKLIB WEB CONSOLE is distributed in the hope that it will be
 * useful, but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with RTKLIB WEB CONSOLE. If not, see <http://www.gnu.org/licenses/>.
 */
// import fs = require("fs");
import * as fs from "../utilities/fs_wrapper";
import express = require("express");
import * as config from "../config";
import path = require("path");

import * as logger from "../utilities/logger";
const log = logger.getLogger("config_files");

import * as rtkrcv_service from "../services/rtkrcv_service";
import * as str2str_service from "../services/str2str_service";

interface IParams {
	[id: string]: string[];
}

interface IParamUnit {
	[id: string]: string;
}

interface IParamComment {
	[id: string]: string;
}

interface IParameter {
	key: string;
	value?: string | number;
	unit?: string;
	comment?: string;
	restriction?: string[];
}
interface IParamResponse {
	name: string;
	requiredParameters: IParameter[];
	advancedParameters: IParameter[];
	otherParameters: IParameter[];
	cmdParameters: IParameter[];
}

export default function configFileEditor(app: express.Express) {

	const requireParams: IParams = {
		"pos1-posmode": ["single", "dgps", "kinematic", "static", "movingbase", "fixed", "ppp-kine", "ppp-static"],
		"ant2-postype": ["llh", "xyz", "single", "posfile", "rinexhead", "rtcm"],
		"ant2-pos1": [],
		"ant2-pos2": [],
		"ant2-pos3": []
	};

	const advancedParams: IParams = {
		"pos1-elmask": [],
		"pos1-snrmask_r": ["off", "on"],
		"pos1-snrmask_b": ["off", "on"],
		"pos1-snrmask_L1": [],
		"pos1-dynamics": ["off", "on"],
		"pos1-tidecorr": ["off", "on"],
		"pos1-ionoopt": ["off", "brdc", "sbas", "dual-freq", "est-stec", "ionex-tec", "qzs-brdc", "qzs-lex", "vtec_sf", "vtec_ef", "gtec"],
		"pos1-tropopt": ["off", "saas", "sbas", "est-ztd", "est-ztdgrad"],
		"pos1-sateph": ["brdc", "precise", "brdc+sbas", "brdc+ssrapc", "brdc+ssrcom"],
		"pos1-exclsats": [],
		"pos1-navsys": [], // 'gps','sbas','glo','gal','qzs','comp'
		"pos2-armode": ["off", "continuous", "instantaneous", "fix-and-hold"],
		"pos2-gloarmode": ["off", "on", "autocal"]
	};

	const otherParams: IParams = {
		"pos1-frequency": ["l1", "l1+l2", "l1+l2+l5"],
		"pos1-soltype": ["forward", "backward", "combined"],
		"pos1-snrmask_L2": [],
		"pos1-snrmask_L5": [],
		"pos1-posopt1": ["off", "on"],
		"pos1-posopt2": ["off", "on"],
		"pos1-posopt3": ["off", "on"],
		"pos1-posopt4": ["off", "on"],
		"pos1-posopt5": ["off", "on"],
		"pos2-arthres": [],
		"pos2-arlockcnt": [],
		"pos2-arelmask": [],
		"pos2-arminfix": [],
		"pos2-elmaskhold": [],
		"pos2-aroutcnt": [],
		"pos2-maxage": [],
		"pos2-slipthres": [],
		"pos2-rejionno": [],
		"pos2-rejgdop": [],
		"pos2-niter": [],
		"pos2-baselen": [],
		"pos2-basesig": [],
		"out-solformat": ["llh", "xyz", "enu", "nmea", "ubx", "base"],
		"out-outhead": ["off", "on"],
		"out-outopt": ["off", "on"],
		"out-timesys": ["gpst", "utc", "jst"],
		"out-timeform": ["tow", "hms"],
		"out-timendec": [],
		"out-degform": ["deg", "dms"],
		"out-fieldsep": [],
		"out-height": ["ellipsoidal", "geodetic"],
		"out-geoid": ["internal", "egm96", "egm08_2.5", "egm08_1", "gsi2000"],
		"out-solstatic": ["all", "single"],
		"out-nmeaintv1": [],
		"out-nmeaintv2": [],
		"out-outstat": ["off", "state", "residual"],
		"stats-eratio1": [],
		"stats-eratio2": [],
		"stats-errphase": [],
		"stats-errphaseel": [],
		"stats-errphasebl": [],
		"stats-errdoppler": [],
		"stats-stdbias": [],
		"stats-stdiono": [],
		"stats-stdtrop": [],
		"stats-prnaccelh": [],
		"stats-prnaccelv": [],
		"stats-prnbias": [],
		"stats-prniono": [],
		"stats-prntrop": [],
		"stats-clkstab": [],
		"ant1-postype": ["llh", "xyz", "single", "posfile", "rinexhead", "rtcm"],
		"ant1-pos1": [],
		"ant1-pos2": [],
		"ant1-pos3": [],
		"ant1-anttype": [],
		"ant1-antdele": [],
		"ant1-antdeln": [],
		"ant1-antdelu": [],
		"ant2-anttype": [],
		"ant2-antdele": [],
		"ant2-antdeln": [],
		"ant2-antdelu": [],
		"misc-timeinterp": ["off", "on"],
		"misc-sbasatsel": ["all"], // Warning '0' in initial config file
		"misc-rnxopt1": [],
		"misc-rnxopt2": [],
		"file-satantfile": [],
		"file-rcvantfile": [],
		"file-staposfile": [],
		"file-geoidfile": [],
		"file-ionofile": [],
		"file-dcbfile": [],
		"file-eopfile": [],
		"file-blqfile": [],
		"file-tempdir": [],
		"file-geexefile": [],
		"file-solstatfile": [],
		"file-tracefile": [],

		"inpstr1-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripcli", "ftp", "http"],
		"inpstr1-path": [],
		"inpstr1-format": ["rtcm2", "rtcm3", "oem4", "oem3", "ubx", "ss2", "hemis", "skytraq", "gw10", "javad", "sp3"],

		"inpstr2-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripcli", "ftp", "http"],
		"inpstr2-path": [],
		"inpstr2-format": ["rtcm2", "rtcm3", "oem4", "oem3", "ubx", "ss2", "hemis", "skytraq", "gw10", "javad", "sp3"],

		"inpstr3-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripcli", "ftp", "http"],
		"inpstr3-path": [],
		"inpstr3-format": ["rtcm2", "rtcm3", "oem4", "oem3", "ubx", "ss2", "hemis", "skytraq", "gw10", "javad", "sp3"],

		"outstr1-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripcli"],
		"outstr1-format": ["llh", "xyz", "enu", "nmea", "ubx", "base"],
		"outstr1-path": [],

		"outstr2-path": [],
		"outstr2-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripcli"],
		"outstr2-format": ["llh", "xyz", "enu", "nmea", "ubx", "base"],

		"inpstr2-nmeareq": ["off", "latlon", "single"],
		"inpstr2-nmealat": [],
		"inpstr2-nmealon": [],
		"logstr1-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripsvr"],
		"logstr2-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripsvr"],
		"logstr3-type": ["off", "serial", "file", "tcpsvr", "tcpcli", "ntripsvr"],
		"logstr1-path": [],
		"logstr2-path": [],
		"logstr3-path": [],
		"misc-svrcycle": [],
		"misc-timeout": [],
		"misc-reconnect": [],
		"misc-nmeacycle": [],
		"misc-buffsize": [],
		"misc-navmsgsel": ["all", "rover", "base", "corr"],
		"misc-proxyaddr": [],
		"misc-fswapmargin": [],
		"file-cmdfile1": []
	};

	const paramUnit: IParamUnit = {
		"pos1-elmask": "deg",
		"pos2-arelmask": "deg",
		"pos2-elmaskhold": "deg",
		"pos2-maxage": "s",
		"pos2-slipthres": "m",
		"pos2-rejionno": "m",
		"pos2-baselen": "m",
		"pos2-basesig": "m",
		"out-nmeaintv1": "s",
		"out-nmeaintv2": "s",
		"stats-errphase": "m",
		"stats-errphaseel": "m",
		"stats-errphasebl": "m/10km",
		"stats-errdoppler": "Hz",
		"stats-stdbias": "m",
		"stats-stdiono": "m",
		"stats-stdtrop": "m",
		"stats-prnaccelh": "m/s^2",
		"stats-prnaccelv": "m/s^2",
		"stats-prnbias": "m",
		"stats-prniono": "m",
		"stats-prntrop": "m",
		"stats-clkstab": "s/s",
		"ant1-pos1": "deg|m",
		"ant1-pos2": "deg|m",
		"ant1-pos3": "m|m",
		"ant1-antdele": "m",
		"ant1-antdeln": "m",
		"ant1-antdelu": "m",
		"ant2-pos1": "deg|m",
		"ant2-pos2": "deg|m",
		"ant2-pos3": "m|m",
		"ant2-antdele": "m",
		"ant2-antdeln": "m",
		"ant2-antdelu": "m",
		"inpstr2-nmealat": "deg",
		"inpstr2-nmealon": "deg",
		"misc-svrcycle": "ms",
		"misc-timeout": "ms",
		"misc-reconnect": "ms",
		"misc-nmeacycle": "ms",
		"misc-buffsize": "bytes",
		"misc-fswapmargin": "s"
	};

	const paramComment: IParamComment = {
		"pos1-posmode": "If the rover is stationary, use “static”. If it is moving, “kinematic” or “static-start”. I always require the rover to be stationary long enough to get first fix, in which case “static-start” usually works better because it take advantage of the knowledge that the rover is not moving initially. Use “movingbase” if the base is moving as well as the rover. In this case be sure to set “pos2-baselen” and “pos2-basesig” as well. Use “fixed” if you know the rover’s exact location and are only interested in analyzing the residuals.",
		"pos1-frequency": "L1 for single frequency receivers,  L1+L2 if the rover is dual frequency",
		"pos1-soltype": "This is the direction in time that the kalman filter is run. For real-time processing, “forward” is your only choice. For post-processing, “combined” first runs the filter forward, then backwards and combines the results. For each epoch, if both directions have a fix, then the combined result is the average of the two with a fixed status unless the difference between the two is too large in which case the status will be float. If only one direction has a fix, that value will be used and the status will be fixed. If both directions are float then the average will be used and the status will be float. Results are not always better with combined because a false fix when running in either direction will usually cause the combined result to be float and incorrect. The primary advantage of combined is that it will usually give you fixed status right to the beginning of the data while the forward only solution will take some time to converge. The 2.4.3 code resets the bias states before starting the backwards run to insure independent solutions. The demo5 code doesn’t reset the bias states to avoid having to lock back up when the rover is moving.  I only use the “backward” setting for debug when I am having trouble getting an initial fix and want to know what the correct satellite phase-biases are.",
		"pos1-elmask": "Minimum satellite elevation for use in calculating position. I usually set this to 15 degrees to reduce the chance of bringing multipath into the solution but this setting will be dependent on the rover environment. The more open the sky view, the lower this value can be set to.",
		"pos1-snrmask-r": "Minimum satellite SNR for rover (_r) and base(_b) for use in calculating position. Can be a more effective criteria for eliminating poor satellites than elevation because it is a more direct measure of signal quality but the optimal value will vary with receiver type and antenna type so I leave it off most of the time to avoid the need to tune it for each application.",
		"pos1-snrmask-b": "Minimum satellite SNR for rover (_r) and base(_b) for use in calculating position. Can be a more effective criteria for eliminating poor satellites than elevation because it is a more direct measure of signal quality but the optimal value will vary with receiver type and antenna type so I leave it off most of the time to avoid the need to tune it for each application.",
		"pos1-snrmask_L1": "Set SNR thresholds for each five degrees of elevation. I usually leave all values the same and pick something between 35 and 38 db depending on what the nominal SNR is. These values are only used if pos1-snrmask_x is set to on",
		"pos1-dynamics": "Enabling rover dynamics adds velocity and acceleration states to the kalman filter for the rover. It will improve “kinematic” and “static-start” results, but will have little or no effect on “static” mode. The release code will run noticeably slower with dynamics enabled but the demo5 code should be OK. Be sure to set “prnaccelh” and “prnaccelv” appropriately for your rover acceleration characteristics.",
		"pos1-posopt1": "Set whether the satellite antenna phase center variation is used or not. Leave it off for RTK but you may want to set it for PPP. If set to on, you need to specify the satellite antenna PCV file in the files parameters.",
		"pos1-posopt2": "Set whether the receiver antenna phase center variations are used or not. If set to on, you need to specify the receiver antenna PCV file in the files parameters and the type of receiver antenna for base and rover in the antenna section. Only survey grade antennas are included in the antenna file available from IGS so only use this if your antenna is in the file. It primarily affects accuracy in the z-axis so it can be important if you care about height. You can leave this off if both antennas are the same since they will cancel.",
		"pos1-posopt5": "If the residuals for any satellite exceed a threshold, that satellite is excluded. This will only exclude satellites with very large errors but requires a fair bit of computation so I usually leave this disabled.",
		"pos1-exclsats": "If you know a satellite is bad you can exclude it from the solution by listing it here. I only use this in rare cases for debugging if I suspect a satellite is bad.",
		"pos1-navsys": "I always include GLONASS and SBAS sats, as more information is generally better.  If using the newer 3.0 u-blox firmware with the M8T I also enable Galileo",
		"pos2-armode": "Integer ambiguity resolution method. I like to think of continuous mode as an acquisition mode and fix-and-hold as a tracking mode. I normally use continuous mode for static solutions and fix-and-hold for moving rovers but if the raw measurement quality is good enough to maintain ambiguity resolution when the rover is moving then it is probably better to use continuous mode for moving rovers as well. This will avoid the risk of locking on to a false fix. If in continuous mode, a false fix will usually drop out fairly quickly but fix-and-hold will track a false fix for much longer. If “armode” is not set to “fix-and-hold” then any of the options below that refer to holds don’t apply, including pos2-gloarmode.",
		"pos2-varholdamb": "Starting with the demo5 b26b code, the tracking gain for fix-and-hold can be adjusted with this parameter. It is actually a variance rather than a gain, so larger values will give lower gain. 0.001 is the default value, anything over 100 will have very little effect. This value is used as the variance for the pseudo-measurements generated during a hold which provide feedback to drive the bias states in the kalman filter towards integer values.  I find that a value of 1.0 provides enough gain to assist with tracking while still avoiding tracking of false fixes in most cases.",
		"pos2-gloarmode": "Integer ambiguity resolution for the GLONASS sats.  If your receivers are identical, you can usually set this to “on” which is the preferred setting since it will allow the GLONASS sats to be used for integer ambiguity resolution during the initial acquire. If your receivers are different or you are using two u-blox M8N receivers you will need to null out the inter-channel biases with this parameter set to “fix-and-hold” if you want to include the GLONASS satellites in the AR solution. In this case the GLONASS sats will not be used for inter-channel ambiguity resolution until after the inter-channel biases have been calibrated which begins after the first hold. There is an “autocal” option as well, but I have never been able to make this work.",
		"pos2-gainholdamb": "Starting with the demo5 b26b code, the gain of the inter-channel bias calibration for the GLONASS satellites can be adjusted with this parameter. Although not fully tested, the hope is that in addition, this parameter in conjunction with pos2-varholdamb will enable the possibility to null out the inter-channel biases for the GLONASS satellites when the tracking effect of fix-and-hold on the GPS satellites is not desired (i.e.. effectively continuous mode). This would be done by setting pos2-gainholdamb to a nominal value and setting pos2-varholdamb to a very large variance to push it’s tracking gain to near zero.",
		"pos2-arthres": "This is the threshold used to determine if there is enough confidence in the ambiguity resolution solution to declare a fix. It is the ratio of the squared residuals of the second-best solution to the best solution. I generally always leave this at the default value of 3.0 and adjust all the other parameters to work around this one. Although a larger AR ratio indicates higher confidence than a low AR ratio, there is not a fixed relationship between the two. The larger the errors in the kalman filter states, the lower the confidence in that solution will be for a given AR ratio. Generally the errors in the kalman filter will be largest when it is first converging so this is the most likely time to get a false fix. Reducing pos2-arthers1 can help avoid this.  A larger number of satellites used for AR will increase the confidence level for a given threshold, so in theory at least, it makes sense to increase this if you are typically working with a larger number of satellites than normal.",
		"pos2-arfilter": "Setting this to on will qualify new sats or sats recovering from a cycle-slip. If a sat significantly degrades the AR ratio when it is first added, its use for ambiguity resolution will be delayed. Turning this on should allow you to reduce “arlockcnt” which serves a similar purpose but with a blind delay count.",
		"pos2-arthres1": "Integer ambiguity resolution is delayed until the variance of the position state has reached this threshold. It is intended to avoid false fixes before the bias states in the kalman filter have had time to converge. It is particularly important to set this to a relatively low value if you have set eratio1 to values larger than 100. If you see AR ratios of zero extending too far into your solution, you may need to increase this value since it means ambiguity resolution has been disabled because the threshold has not been met yet. I find 0.004 usually works well for me but if your measurements are lower quality you may need to increase this to avoid overly delaying first fix or losing fix after multiple cycle slips have occurred.",
		"pos2-arthres2": "Defined but not used anywhere in the code, best to remove these from your config file",
		"pos2-arthres3": "Defined but not used anywhere in the code, best to remove these from your config file",
		"pos2-arthres4": "Defined but not used anywhere in the code, best to remove these from your config file",
		"pos2-arlockcnt": "Number of samples to delay a new sat or sat recovering from a cycle-slip before using it for integer ambiguity resolution. Avoids corruption of the AR ratio from including a sat that hasn’t had time to converge yet. Use in conjunction with “arfilter”. Note that the units are in samples, not units of time, so it must be adjusted if you change the rover measurement sample rate.",
		"pos2-minfixsats": "Minimum number of sats necessary to get a fix. Used to avoid false fixes from a very small number of satellites, especially during periods of frequent cycle-slips.",
		"pos2-minholdsats": "Minimum number of sats necessary to hold an integer ambiguity result. Used to avoid false holds from a very small number of satellites, especially during periods of frequent cycle-slips.",
		"pos2-mindropsats": "Minimum number of sats necessary to enable exclusion of a single satellite from ambiguity resolution each epoch.  In each epoch a different satellite is excluded.  If excluding the satellite results in a significant improvement in the AR ratio, then that satellite is removed from the list of satellites used for AR.",
		"pos2-rcvstds": "Enabling this feature causes the the measurement variances for the raw pseudorange and phase measurement observations to be adjusted based on the standard deviation of the measurements as reported by the receiver. This feature is currently only supported for u-blox receivers. The adjustment in variance is in addition to adjustments made for satellite elevation based on the stats-errphaseel parameter.",
		"pos2-arelmask": "Functionally no different from the default of zero, since elevations less than “elmask” will not be used for ambiguity resolution but I changed it to avoid confusion.",
		"pos2-arminfix": "Number of consecutive fix samples needed to hold the ambiguities. Increasing this is probably the most effective way to reduce false holds, but will also increase time to first hold. Note that this value also needs to be adjusted if the rover measurement sample rate changes.",
		"pos2-elmaskhold": "Functionally no different from the default of zero, since elevations less than “elmask” will not be used for holding ambiguity resolution results but I changed it to avoid confusion.",
		"pos2-aroutcnt": "Number of consecutive missing samples that will cause the ambiguities to be reset. Again, this value needs to be adjusted if the rover measurement sample rate changes.",
		"pos2-maxage": "Maximum delay between rover measurement and base measurement (age of differential) in seconds. This usually occurs because of missing measurements from a misbehaving radio link. I’ve increased it from the default because I found I was often still getting good results even when this value got fairly large, assuming the dropout occurred after first fix-and-hold.",
		"pos2-rejionno": "Reject a measurement if its pre-fit residual is greater than this value in meters. I have found that RTKLIB does not handle outlier measurements well, so I set this large enough to effectively disable it. There was a recent bug fix in the release code related to outliers but even with this fix I found that I got better results with a larger value.",
		"out-solformat": "I am usually interested in relative distances between rover and base, so set this to “enu”. If you are interested in absolute locations, set this to “llh” but make sure you set the exact base location in the “ant2” settings. Be careful with this setting if you need accurate z-axis measurements. Only the llh format will give you a constant z-height if the rover is at constant altitude. “Enu” and “xyz” are cartesian coordinates and so the z-axis follows a flat plane, not the curvature of the earth. This can lead to particularly large errors if the base station is located farther from the rover since the curvature will increase with distance.",
		"out-outhead": "No functional difference to the solution, just output more info to the result file.",
		"out-outopt": "No functional difference to the solution, just output more info to the result file.",
		"out-outstat": "No functional difference to the solution, just output residuals to a file. The residuals can be very useful for debugging problems with a solution.",
		"stats-eratio1": "Ratio of the standard deviations of the pseudorange measurements to the carrier-phase measurements. I have found a larger value works better for low-cost receivers, but that the default value of 100 may sometimes may work better for more expensive receivers. Larger values tend to cause the kalman filter to converge faster and leads to faster first fixes but it also increases the chance of a false fix. If you increase this value, you should set pos2-arthres1 low enough to prevent finding fixes before the kalman filter has had time to converge. I believe increasing this value has a similar effect to increasing the time constant on a pseudorange smoothing algorithm in that it filters out more of the higher frequencies in the pseudorange measurements while maintaining the low frequency components.",
		"stats-prnaccelh": "If receiver dynamics are enabled, use this value to set the standard deviation of the rover receiver acceleration in the horizontal components. This value should include accelerations at all frequencies, not just low frequencies. It should characterize any movements of the rover antenna, not just movements of the complete rover so it may be larger than you think. It will include accelerations from vibration, bumps in the road, etc as well as the more obvious rigid-body accelerations of the whole rover.",
		"stats-prnaccelv": "The comments about horizontal accelerations apply even more to the vertical acceleration component since in many applications the intentional accelerations will all be in the horizontal components. It is best to derive this value from actual GPS measurement data rather than expectations of the rigid-body rover. It is better to over-estimate these values than to under-estimate them.",
		"ant2-postype": "This is the location of the base station antenna. If you are only interested in relative distance between base and rover this value does not need to be particularly accurate. For post-processing I usually use the approximate base station location from the RINEX file header. If you want absolute position in your solution, then the base station location must be much more accurate since any error in that will add to your rover position error. If I want absolute position, I first process the base station data against a nearby reference station to get the exact location, then use the ”llh” or “xyz”option to specify that location. For real-time processing, I use the “single” option which uses the single solution from the data to get a rough estimate of base station location.",
		"ant2-maxaveep": "Specifies the number of samples averaged to determine base station location if “postype” is set to “single”. I set this to one to prevent the base station position from varying after the kalman filter has started to converge since that seems to cause long times to first fix. In most cases for post-processing, the base station location will come from the RINEX file header and so you will not use this setting. However if you are working with RTCM files you may need this even for post-processing.",

		"pos1-tidecorr": "on to consider solid earthtide corrections",
		// "pos1-posopt1": "satellite PCV variation file",
		// "pos1-posopt2": "Receiver PCV variation file",
		"pos1-posopt3": "Phase windup PPP",
		"pos1-posopt4": "PPP",
		// "pos1-posopt5": "Ublox M8T supports RAIM FDE",
		// "pos1-exclsats": "prn ...",
		// "pos2-armode": "continuous is good for kinematic",
		// "pos2-arthres": 'value "2" has false positive rate of 3/600',
		// "pos2-arlockcnt": "carrier lock count changes quickly",
		// "pos2-arminfix": "for fix-and-hold",
		// "pos2-elmaskhold": "for fix-and-hold",
		"pos2-niter": "useful when baseline < 1m",
		"pos2-baselen": "for moving base mode",
		"pos2-basesig": "for moving base mode",
		"out-solstatic": "for rtkpost",
		"file-dcbfile": "for dual frequency receivers",
		"inpstr1-path": "rover",
		"inpstr2-path": "base"
	};

	function endsWith(str: string, suffix: string) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

	app.get("/listConfigFile", async (req, res) => {
		log.info("GET /listConfigFile");
		try {

			const toReturn = {
				listConfigFiles: [] as string[]
			};

			const files = await fs.readdir(config.configFilesPath);
			const nbFile = files.length;

			for (let i = 0; i < nbFile; i++) {
				const currentConfigFile = files[i];

				if (currentConfigFile.indexOf(config.configFiles["current_conf"]) > -1 ||
					endsWith(currentConfigFile, config.configFiles.user_extension) ||
					endsWith(currentConfigFile, config.configFiles.drotek_extension)) {
					toReturn.listConfigFiles.push(currentConfigFile);
				}
			}

			res.send(toReturn);
		} catch (e) {
			log.error("error executing GET /listConfigFile", e);
			res.status(500).send("error executing GET /listConfigFile");
		}
	});

	app.get("/configFile", async (req, res) => {
		log.info("GET /configFile");
		try {

			let fileName = config.configFiles["current_conf"];
			if (req.query.name) {
				fileName = req.query.name;
			}

			const current_configuration_filename = path.join(config.configFilesPath, fileName);
			log.debug("reading current configuration from", current_configuration_filename);
			const data = await fs.readFile(current_configuration_filename, "utf-8");

			const lines = data.split("\n");
			const nbLines = lines.length;

			const requiredParameters: IParameter[] = [];
			const advancedParameters: IParameter[] = [];
			const otherParameters: IParameter[] = [];
			const cmdParameters: IParameter[] = [];

			let pathCmd: string;
			let pathCmdKey: string;
			let pathCmdValue: string;

			for (let i = 0; i < nbLines; i++) {
				let currentLine = lines[i];
				currentLine = currentLine.replace(/\s/g, "");

				if (currentLine !== "" && currentLine.indexOf("=") > -1) {
					const lineComponents = currentLine.split("=");
					const key = lineComponents[0];
					let value = lineComponents[1];

					if (value.indexOf("#") > -1) {
						value = value.split("#")[0];
					}

					if (key === "file-cmdfile1") {
						pathCmd = value;
					}

					pathCmdKey = key;
					pathCmdValue = value;

					const currentParam: IParameter = {
						key,
						value,
						unit: paramUnit[key],
						comment: paramComment[key]
					};

					if (requireParams[key]) {
						currentParam.restriction = requireParams[key];
						requiredParameters.push(currentParam);
					} else if (advancedParams[key]) {
						currentParam.restriction = advancedParams[key];
						advancedParameters.push(currentParam);
					} else {
						currentParam.restriction = otherParams[key];
						otherParameters.push(currentParam);
					}
				}
			}

			if (pathCmd) {
				pathCmd = path.resolve(path.join(config.configFilesPath, pathCmd));
				log.debug("file-cmdfile1 found, reading", pathCmd);
				const dataCmd = await fs.readFile(pathCmd, "utf-8");

				const linesCmd = dataCmd.split("\n");
				const nbLinesCmd = linesCmd.length;

				for (let j = 0; j < nbLinesCmd; j++) {
					const currentCmdLine = linesCmd[j];

					if (currentCmdLine.substring(0, 1) !== "#") {
						const cmdLineComponents = currentCmdLine.split(" ");

						if (cmdLineComponents.length > 0) {
							const currentCmdType = cmdLineComponents[1];

							const currentParam: IParameter = {
								key: currentCmdType,
								value: pathCmdValue,
								unit: paramUnit[pathCmdKey],
								comment: paramComment[pathCmdKey]
							};

							if (currentCmdType === "CFG-RATE") {
								currentParam.value = 1000 / parseInt(cmdLineComponents[2]);
								currentParam.unit = "Hz";
								currentParam.comment = "Frequency";
								cmdParameters.push(currentParam);
							} else if (currentCmdType === "CFG-PRT") {
								currentParam.value = cmdLineComponents[6];
								currentParam.unit = "";
								currentParam.comment = "Baud Rate";
								cmdParameters.push(currentParam);
							}
						}
					}
				}

				const response: IParamResponse = {
					name: fileName,
					requiredParameters,
					advancedParameters,
					otherParameters,
					cmdParameters
				};

				res.send(response);

			} else {
				res.send({
					name: fileName,
					requiredParameters,
					advancedParameters,
					otherParameters,
					cmdParameters
				});
			}
		} catch (e) {
			log.error("error executing GET /configFile", e);
			res.status(500).send("error executing GET /configFile");
		}

	});

	app.get("/baseCMD", async (req, res) => {
		log.info("GET /baseCMD");
		try {
			const dataCmd = await fs.readFile(path.join(config.configFilesPath, config.configFiles.base_cmd), "utf-8");

			const linesCmd = dataCmd.split("\n");
			const nbLinesCmd = linesCmd.length;

			const cmdParameters = [];

			for (let j = 0; j < nbLinesCmd; j++) {
				const currentCmdLine = linesCmd[j];

				if (currentCmdLine.substring(0, 1) !== "#") {
					const cmdLineComponents = currentCmdLine.split(" ");

					if (cmdLineComponents.length > 0) {
						const currentCmdType = cmdLineComponents[1];

						const currentParam: IParameter = {
							key: currentCmdType
						};

						if (currentCmdType === "CFG-RATE") {
							currentParam.value = 1000 / parseInt(cmdLineComponents[2]);
							currentParam.unit = "Hz";
							currentParam.comment = "Frequency";
							cmdParameters.push(currentParam);
						} else if (currentCmdType === "CFG-PRT") {
							currentParam.value = cmdLineComponents[6];
							currentParam.unit = "";
							currentParam.comment = "Baud Rate";
							cmdParameters.push(currentParam);
						}
					}
				}
			}

			res.send({
				name: config.configFiles.base_cmd,
				requiredParameters: [],
				advancedParameters: [],
				otherParameters: [],
				cmdParameters
			});
		} catch (e) {
			log.error("error executing GET /baseCMD", e);
			res.status(500).send("error executing GET /baseCMD");
		}
	});

	app.get("/basePosition", async (req, res) => {
		log.info("GET /basePosition");
		try {

			const data = await fs.readFile(path.join(config.configFilesPath, config.configFiles["current_conf"]), "utf-8");

			let pos1;
			let pos2;
			let pos3;
			let postype;

			const lines = data.split("\n");
			const nbLines = lines.length;

			let i = 0;
			while (i < nbLines && (!pos1 || !pos2 || !pos3 || !postype)) {
				let currentLine = lines[i];

				currentLine = currentLine.replace(/\s/g, "");

				if (currentLine !== "" && currentLine.substring(0, 1) !== "#" && currentLine.indexOf("=") > -1) {
					const lineComponents = currentLine.split("=");
					const key = lineComponents[0];

					switch (key) {
						case "ant2-pos1":
							pos1 = getValue(lineComponents[1]);
							break;
						case "ant2-pos2":
							pos2 = getValue(lineComponents[1]);
							break;
						case "ant2-pos3":
							pos3 = getValue(lineComponents[1]);
							break;
						case "ant2-postype":
							postype = getValue(lineComponents[1]);
							break;
						default:
							break;
					}

				}

				i++;
			}

			res.send({
				pos1,
				pos2,
				pos3,
				postype
			});

		} catch (e) {
			log.error("error executing GET /basePosition", e);
			res.status(500).send("error executing GET /basePosition");
		}

	});

	function getValue(value: string) {
		let toReturn = value;

		if (toReturn.indexOf("#") > -1) {
			toReturn = toReturn.split("#")[0];
		}

		return toReturn;
	}

	function formatDate(number: number) {
		if (number < 10) {
			return "0" + number;
		}

		return number;
	}

	async function copyFile(srcFile: string, destFile: string) {
		const BUF_LENGTH = 64 * 1024;
		const buff = new Buffer(BUF_LENGTH);
		const fdr = await fs.open(srcFile, "r");
		const fdw = await fs.open(destFile, "w");
		let bytesRead = 1;
		let pos = 0;

		while (bytesRead > 0) {
			bytesRead = await fs.read(fdr, buff, 0, BUF_LENGTH, pos);
			await fs.write(fdw, buff, 0, bytesRead);
			pos += bytesRead;
		}

		await fs.close(fdr);
		await fs.close(fdw);
	}

	app.post("/configFile", async (req, res) => {
		log.info("POST /configFile", req.body);
		try {

			const requiredParameters = req.body.requiredParameters || [];
			const advancedParameters = req.body.advancedParameters || [];
			const otherParameters = req.body.otherParameters || [];
			const cmdParameters = req.body.cmdParameters || [];

			let pathCmd: string;

			let configFileAsString = `# SMARTNAV-RTK options (${new Date()})\n\n`;
			configFileAsString = configFileAsString + "#Logs location /usr/drotek/logs/\n\n";

			configFileAsString = configFileAsString + "#Required parameters\n";
			let nbLines = requiredParameters.length;
			let currentParam;

			for (let i = 0; i < nbLines; i++) {
				currentParam = requiredParameters[i];
				configFileAsString = configFileAsString + currentParam.key + " =" + currentParam.value;

				if (currentParam.unit) {
					configFileAsString = configFileAsString + " # (" + currentParam.unit + ")";
				}

				if (currentParam.comment) {
					configFileAsString = configFileAsString + " # " + currentParam.comment;
				}

				configFileAsString = configFileAsString + "\n";
			}
			configFileAsString = configFileAsString + "\n";

			configFileAsString = configFileAsString + "#Advanced parameters\n";
			nbLines = advancedParameters.length;
			for (let i = 0; i < nbLines; i++) {
				currentParam = advancedParameters[i];
				configFileAsString = configFileAsString + currentParam.key + " =" + currentParam.value;

				if (currentParam.unit) {
					configFileAsString = configFileAsString + " # (" + currentParam.unit + ")";
				}

				if (currentParam.comment) {
					configFileAsString = configFileAsString + " # " + currentParam.comment;
				}

				configFileAsString = configFileAsString + "\n";
			}
			configFileAsString = configFileAsString + "\n";

			configFileAsString = configFileAsString + "#Other parameters\n";
			nbLines = otherParameters.length;
			for (let i = 0; i < nbLines; i++) {
				currentParam = otherParameters[i];

				const currentParamKey = currentParam.key;

				configFileAsString = configFileAsString + currentParamKey + " =" + currentParam.value;

				if (currentParam.unit) {
					configFileAsString = configFileAsString + " # (" + currentParam.unit + ")";
				}

				if (currentParam.comment) {
					configFileAsString = configFileAsString + " # " + currentParam.comment;
				}

				configFileAsString = configFileAsString + "\n";

				if (currentParamKey === "file-cmdfile1") {
					pathCmd = currentParam.value;
				}

			}

			let fileName;
			if (req.body.name) {
				fileName = "Saved_Conf_" + req.body.name;
			} else {
				fileName = config.configFiles["current_conf"];
			}

			await fs.writeFile(path.join(config.configFilesPath, fileName), configFileAsString);

			console.log("Config file saved!");

			const nbCmdParam = cmdParameters.length;
			// if (pathCmd && nbCmdParam > 0) {

			// 	return await modifyCmdFile(pathCmd, cmdParameters, res, req);

			// } else {
			return res.send(req.body);
			// }

		} catch (e) {
			log.error("error executing POST /configFile", e);
			res.status(500).send("error executing POST /configFile");
		}
	});

	// app.post("/baseCMD", async (req, res) => {
	// 	log.info("POST /baseCMD", req.body);
	// 	try {
	//

	// 		const cmdParameters = req.body.cmdParameters;

	// 		const pathCmd = path.join(config.configFilesPath, config.configFiles.base_cmd);

	// 		const nbCmdParam = cmdParameters.length;
	// 		if (nbCmdParam > 0) {

	// 			return await modifyCmdFile(pathCmd, cmdParameters, res, req);

	// 		} else {
	// 			return res.send(req.body);
	// 		}
	// 	} catch (e) {
	// 		log.error("error executing POST /baseCMD", e);
	// 		res.status(500).send( "error executing POST /baseCMD");
	// 	}
	// });

	// async function modifyCmdFile(pathCmd: string, cmdParameters: IParameter[], res: express.Response, req: express.Request) {
	// 	let cmdFileAsString = "";

	// 	const dataCmd = await fs.readFile(pathCmd, "utf-8");

	// 	const linesCmd = dataCmd.split("\n");
	// 	const nbLinesCmd = linesCmd.length;

	// 	for (let j = 0; j < nbLinesCmd; j++) {
	// 		const currentCmdLine = linesCmd[j];

	// 		if (currentCmdLine.substring(0, 1) !== "#") {
	// 			const cmdLineComponents = currentCmdLine.split(" ");

	// 			if (cmdLineComponents.length > 0) {
	// 				const currentCmdType = cmdLineComponents[1];

	// 				switch (currentCmdType) {
	// 					case "CFG-RATE":
	// 					case "CFG-PRT":
	// 						cmdFileAsString += getCmdLine(currentCmdType, cmdLineComponents, cmdParameters);
	// 						break;
	// 					default:
	// 						cmdFileAsString += currentCmdLine + "\n";
	// 						break;
	// 				}
	// 			} else {
	// 				cmdFileAsString += currentCmdLine + "\n";
	// 			}
	// 		} else {
	// 			cmdFileAsString += currentCmdLine + "\n";
	// 		}
	// 	}

	// 	await fs.writeFile(pathCmd, cmdFileAsString);
	// 	console.log("CMD file saved!");

	// 	return res.send(req.body);
	// }

	// function getCmdLine(cmdType: string, cmdLineComponents: string[], params: IParameter[]) {
	// 	let commandToReturn = null;

	// 	const nbCmdParam = params.length;
	// 	for (let i = 0; i < nbCmdParam && commandToReturn === null; i++) {
	// 		const currentParam = params[i];

	// 		if (cmdType === currentParam.key) {
	// 			if (cmdType === "CFG-RATE") {
	// 				const period = 1000 / parseInt(currentParam.value as string);
	// 				commandToReturn = "!UBX CFG-RATE " + period + " " +
	// 					cmdLineComponents[3] + " " +
	// 					cmdLineComponents[4] + "\n";
	// 			} else if (cmdType === "CFG-PRT") {
	// 				commandToReturn = "!UBX CFG-PRT " +
	// 					cmdLineComponents[2] + " " +
	// 					cmdLineComponents[3] + " " +
	// 					cmdLineComponents[4] + " " +
	// 					cmdLineComponents[5] + " " +
	// 					+currentParam.value + " " +
	// 					cmdLineComponents[7] + " " +
	// 					cmdLineComponents[8] + " " +
	// 					cmdLineComponents[9] + " " +
	// 					cmdLineComponents[10] + "\n";
	// 			}
	// 		}
	// 	}

	// 	return commandToReturn;
	// }

	// app.get("/runBase", async (req, res) => {
	// 	log.info("GET /runBase");
	// 	try {
	//

	// 		const data = await fs.readFile(config.str2str_config, "utf-8");

	// 		let type;
	// 		let value;

	// 		const lines = data.split("\n");
	// 		const nbLines = lines.length;

	// 		let i = 0;
	// 		while (i < nbLines && (!type || !value)) {

	// 			let currentLine = lines[i];
	// 			currentLine = currentLine.replace(/\s/g, "");

	// 			if (currentLine !== "" && currentLine.substring(0, 1) !== "#") {
	// 				if (currentLine.indexOf("-outtcpsvr:") > -1) {
	// 					type = "tcpsvr";
	// 					value = currentLine.substring(currentLine.indexOf("tcpsvr://") + 7, currentLine.length).split(":")[1];
	// 				} else if (currentLine.indexOf("-outfile:") > -1) {
	// 					type = "file";
	// 					value = currentLine.substring(currentLine.indexOf("file://") + 7, currentLine.length);
	// 				}
	// 			}

	// 			i++;

	// 		}

	// 		res.send({
	// 			type,
	// 			value
	// 		});
	// 	} catch (e) {
	// 		log.error("error executing GET /runBase", e);
	// 		res.status(500).send( "error executing GET /runBase");
	// 	}
	// });

	// app.post("/runBase", async (req, res) => {
	// 	log.info("POST /runBase", req.body);
	// 	try {
	//

	// 		let runBaseFileAsString = "#!/bin/bash\n";
	// 		runBaseFileAsString = runBaseFileAsString + "# Drotek SMARTNAV-RTK\n\n";

	// 		runBaseFileAsString = runBaseFileAsString + "DIR=/usr/drotek\n";
	// 		runBaseFileAsString = runBaseFileAsString + "RTKLIBDIR=$DIR/rtklib\n";
	// 		runBaseFileAsString = runBaseFileAsString + "RTKLIBLOGDIR=$DIR/logs\n";
	// 		runBaseFileAsString = runBaseFileAsString + "RTKLIBCONFDIR=$DIR/config\n\n";

	// 		// -out tcpsvr://:2424 or file:///$RTKLIBLOGDIR/bas_%Y%m%d%h%M.ubx
	// 		runBaseFileAsString = runBaseFileAsString + "$RTKLIBDIR/str2str -c $RTKLIBCONFDIR/base.cmd -in serial://ttyACM0 -out " + req.body.out + "\n";

	// 		await fs.writeFile(path.join(config.str2str_config), runBaseFileAsString);

	// 		console.log("run-base saved");

	// 		return res.send(req.body);
	// 	} catch (e) {
	// 		log.error("error executing POST /runBase", e);
	// 		res.status(500).send( "error executing POST /runBase");
	// 	}
	// });

	app.get("/listSTR2STRCommands", async (req, res) => {
		log.info("GET /listSTR2STRCommands");
		try {
			const str2str_command_files = await str2str_service.listCommandFiles();
			return res.send(str2str_command_files);
		} catch (e) {
			log.error("error executing GET /listSTR2STRCommands", e);
			res.status(500).send("error executing GET /listSTR2STRCommands");
		}
	});

	app.get("/getSTR2STRConfig", async (req, res) => {
		log.info("GET /getSTR2STRConfig");
		try {
			const str2str_configuration = await str2str_service.getConfiguration();
			return res.send(str2str_configuration);
		} catch (e) {
			log.error("error executing GET /getSTR2STRConfig", e);
			res.status(500).send("error executing GET /getSTR2STRConfig");
		}
	});

	app.get("/getRTKRCVConfig", async (req, res) => {
		log.info("GET /getRTKRCVConfig", req.body);
		try {
			const rtkrcv_configuration = await rtkrcv_service.getConfiguration();

			return res.send(rtkrcv_configuration);
		} catch (e) {
			log.error("error executing GET /getRTKRCVConfig", e);
			res.status(500).send("error executing GET /getRTKRCVConfig");
		}
	});

	app.post("/saveSTR2STRConfig", async (req, res) => {
		log.info("POST /saveSTR2STRConfig", req.body);
		try {
			await str2str_service.setConfiguration(req.body);

			const str2str_configuration = await str2str_service.getConfiguration();
			return res.send(str2str_configuration);
		} catch (e) {
			log.error("error executing POST /saveSTR2STRConfig", e);
			res.status(500).send("error executing POST /saveSTR2STRConfig");
		}
	});

	app.post("/saveRTKRCVConfig", async (req, res) => {
		log.info("POST /saveRTKRCVConfig", req.body);
		try {
			await rtkrcv_service.setConfiguration(req.body);

			const rtkrcv_configuration = await rtkrcv_service.getConfiguration();
			return res.send(rtkrcv_configuration);
		} catch (e) {
			log.error("error executing POST /saveRTKRCVConfig", e);
			res.status(500).send("error executing POST /saveRTKRCVConfig");
		}
	});

}
