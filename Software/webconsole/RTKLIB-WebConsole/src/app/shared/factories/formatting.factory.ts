/**
 * filesize
 *
 * @copyright 2017 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @version 3.5.10
 */

interface ISymbol {
	[standard: string]: { [type: string]: string[] };

}

const b = /^(b|B)$/;

const symbol: ISymbol = {
	iec: {
		bits: ["b", "Kib", "Mib", "Gib", "Tib", "Pib", "Eib", "Zib", "Yib"],
		bytes: ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
	},
	jedec: {
		bits: ["b", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"],
		bytes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
	}
};
const fullform = {
	iec: ["", "kibi", "mebi", "gibi", "tebi", "pebi", "exbi", "zebi", "yobi"],
	jedec: ["", "kilo", "mega", "giga", "tera", "peta", "exa", "zetta", "yotta"]
};

export interface IOptions {
	bits?: boolean;
	unix?: boolean;
	base?: number;
	round?: number;
	spacer?: string;
	symbols?: { [type: string]: string };
	suffixes?: { [id: string]: string };
	standard?: string;
	output?: string;
	fullform?: boolean;
	fullforms?: string[];
	exponent?: number;
}

/**
 * filesize
 *
 * @method filesize
 * @param  {Mixed}   arg        String, Int or Float to transform
 * @param  {Object}  descriptor [Optional] Flags
 * @return {String}             Readable file size String
 */
export function filesize(arg: string | number, descriptor?: IOptions) {
	if (!descriptor) {
		descriptor = {};
	}
	// const descriptor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	const result: string[] = [];
	let val = 0;
	// let e = void 0;
	// let base = void 0;
	// let bits = void 0;
	// let ceil = void 0;
	// let full = void 0;
	// let fullforms = void 0;
	// let neg = void 0;
	// let num = void 0;
	// let output = void 0;
	// let round = void 0;
	// let unix = void 0;
	// let spacer = void 0;
	// let standard = void 0;
	// let symbols = void 0;

	if (isNaN(arg as number)) {
		throw new Error("Invalid arguments");
	}

	const bits = descriptor.bits === true;
	const unix = descriptor.unix === true;
	const base = descriptor.base || 2;
	const round = descriptor.round !== undefined ? descriptor.round : unix ? 1 : 2;
	const spacer = descriptor.spacer !== undefined ? descriptor.spacer : unix ? "" : " ";
	const symbols = descriptor.symbols || descriptor.suffixes || {};
	const standard = base === 2 ? descriptor.standard || "jedec" : "jedec";
	const output = descriptor.output || "string";
	const full = descriptor.fullform === true;
	const fullforms = descriptor.fullforms instanceof Array ? descriptor.fullforms : [];
	let e = descriptor.exponent !== undefined ? descriptor.exponent : -1;
	let num = Number(arg);
	const neg = num < 0;
	const ceil = base > 2 ? 1000 : 1024;

	// Flipping a negative number to determine the size
	if (neg) {
		num = -num;
	}

	// Determining the exponent
	if (e === -1 || isNaN(e)) {
		e = Math.floor(Math.log(num) / Math.log(ceil));

		if (e < 0) {
			e = 0;
		}
	}

	// Exceeding supported length, time to reduce & multiply
	if (e > 8) {
		e = 8;
	}

	// Zero is now a special case because bytes divide by 1
	if (num === 0) {
		result[0] = "0";
		result[1] = unix ? "" : symbol[standard][bits ? "bits" : "bytes"][e];
	} else {
		val = num / (base === 2 ? Math.pow(2, e * 10) : Math.pow(1000, e));

		if (bits) {
			val = val * 8;

			if (val >= ceil && e < 8) {
				val = val / ceil;
				e++;
			}
		}

		result[0] = Number(val.toFixed(e > 0 ? round : 0)).toString();
		result[1] = base === 10 && e === 1 ? bits ? "kb" : "kB" : symbol[standard][bits ? "bits" : "bytes"][e];

		if (unix) {
			result[1] = standard === "jedec" ? result[1].charAt(0) : e > 0 ? result[1].replace(/B$/, "") : result[1];

			if (b.test(result[1])) {
				result[0] = Math.floor(parseFloat( result[0])).toString();
				result[1] = "";
			}
		}
	}

	// Decorating a 'diff'
	if (neg) {
		result[0] = (-parseFloat(result[0])).toString();
	}

	// Applying custom symbol
	result[1] = symbols[result[1]] || result[1];

	// Returning Array, Object, or String (default)
	if (output === "array") {
		return result;
	}

	if (output === "exponent") {
		return e;
	}

	if (output === "object") {
		return { value: result[0], suffix: result[1], symbol: result[1] };
	}

	if (full) {
		// result[1] = fullforms[e] ? fullforms[e] : fullforms[standard][e] + (bits ? "bit" : "byte") + (parseFloat(result[0]) === 1 ? "" : "s");
	}

	return result.join(spacer);
}

// Partial application for functional programming
// export function partial(opt) {
// 	return filesize(arg, opt);
// }



