import path = require("path");
const rootFilePath = path.resolve("../../");

export const str2str = path.join(rootFilePath, "binary", "str2str");
export const str2str_path = path.join(rootFilePath, "binary");
export const str2str_config = path.join(rootFilePath, "binary", "str2str.json");
export const str2str_default_tracefile = path.join(rootFilePath, "binary", "str2str.trace");

export const log_level = "debug";
