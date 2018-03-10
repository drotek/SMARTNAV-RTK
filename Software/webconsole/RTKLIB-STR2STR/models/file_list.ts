import * as fs from "../utilities/fs_wrapper";
import path = require("path");
import * as config from "../config";

export interface IFileInfo {
	name: string;
	filename: string;
	full_path: string;
}

function cleanup_filename(filename: string): string {
	if (filename.endsWith(".cmd")) {
		filename = filename.substr(0, filename.length - 4);
	}
	return filename.replace(/_/g, " ");
}

export async function get_config_files(): Promise<IFileInfo[]> {
	return (await fs.readdir(config.config_path)).map((v) => {
		return {
			name: cleanup_filename(v),
			filename: v,
			full_path: path.join(config.config_path, v)
		} as IFileInfo;
	});
}
