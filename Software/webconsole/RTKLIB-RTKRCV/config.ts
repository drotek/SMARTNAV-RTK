import path = require("path");

export const log_level = "debug";

const rootFilePath = path.resolve("../../");

export const logs_path = path.join(rootFilePath, "logs");

export const rtkrcv_path = path.join(rootFilePath, "binary");
export const rtkrcv_config = path.join(rootFilePath, "binary", "rtkrcv.json");
export const rtkrcv = path.join(rootFilePath, "binary", "rtkrcv");

export const config_path = path.join(rootFilePath, "config");
