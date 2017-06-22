
import { Application } from "./app";

import control_route from "./routes/control";
import monitor_route from "./routes/monitor";

const app = new Application();

control_route(app);
monitor_route(app);

app.start();
