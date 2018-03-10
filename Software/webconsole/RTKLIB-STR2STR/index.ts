
import { Application } from "./app";

import config_route from "./routes/config";
import control_route from "./routes/control";
import monitor_route from "./routes/monitor";

process.on("unhandledRejection", (error) => {
	console.error("unhandledRejection", error);
});

const app = new Application();

config_route(app);
control_route(app);
monitor_route(app);

app.start();
