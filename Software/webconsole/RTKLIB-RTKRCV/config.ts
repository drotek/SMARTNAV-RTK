import path = require("path");

export const log_level = "debug";

const rootFilePath = path.resolve("../../");

export const rtkrcv_config = path.join(rootFilePath, "binary", "rtkrcv.json");
export const rtkrcv =  path.join(rootFilePath, "binary", "rtkrcv");