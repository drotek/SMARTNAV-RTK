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

import angular = require("angular");

console.log("index");

const angular_bootstrap = require("angular-bootstrap");
import angular_animate = require("angular-animate");
import angular_sanitize = require("angular-sanitize");
import angular_ui_router = require("angular-ui-router");
const angular_touch = require("angular-touch");
const angular_chartjs = require("angular-chart.js");
import angular_toastr = require("angular-toastr");

const force_load_typescript_quirk = {
	angular_bootstrap,
	angular_animate,
	angular_sanitize,
	angular_ui_router,
	angular_touch,
	angular_chartjs,
	angular_toastr
};

import dashboard from "./components/dashboard";

const dependencies = [
	"ui.router",
	"ngAnimate",
	"ngSanitize",
	"ui.bootstrap",
	"ngTouch",
	"chart.js",
	"toastr",
	dashboard
];

import app_routes from "./app.routes";
import app_run from "./app.run";
import spinner from "./shared/directives/spinner";
import stop_event from "./shared/directives/stop-event";
import arrays_factory from "./shared/factories/arrays.factory";
import gps_factory from "./shared/factories/gps.factory";
import admin_service from "./shared/services/admin.service";
import configuration_service from "./shared/services/configuration.service";
import livedata_service from "./shared/services/live-data.service";
import livelog_service from "./shared/services/live-logs.service";
import log_service from "./shared/services/log.service";
import status_service from "./shared/services/status.service";

angular.module("rtklib-web-console", dependencies)
	.config(app_routes)

	.run(app_run)

	.directive("stopEvent", stop_event)
	.directive("spinner", spinner)

	.factory("gps", gps_factory)
	.factory("arrays", arrays_factory)

	.provider("admin", admin_service)
	.provider("configuration", configuration_service)
	.provider("log", log_service)
	.provider("livelog", livelog_service)
	.provider("livedata", livedata_service)
	.provider("status", status_service)

	.factory("$exceptionHandler", ["$injector", ($injector: angular.auto.IInjectorService) => {
		return function myExceptionHandler(exception: Error, cause: string) {
			console.warn(exception, cause);
			$injector.get("$rootScope").$broadcast("unhandledException", exception, cause);
		};
	}]);
