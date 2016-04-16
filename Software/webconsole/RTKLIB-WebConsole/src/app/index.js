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

'use strict';

console.log('index.js');

var angular = require('angular');
require('angular-bootstrap');
require('angular-animate');
require('angular-sanitize');
require('angular-ui-router');
require('angular-touch');
require('angular-chartjs');

var dependencies = [
    'ui.router',
    'ngAnimate',
    'ngSanitize',
    'ui.bootstrap',
    'ngTouch',
    'chartjs',
    require('./components/dashboard'),
];

angular.module('rtklib-web-console', dependencies)
    .config(require('./app.routes'))

    .run(require('./app.run'))
    
    .directive('stopEvent', require('./shared/directives/stop-event'))
    .directive('spinner', require('./shared/directives/spinner'))

    .factory('gps', require('./shared/factories/gps.factory'))
    .factory('arrays', require('./shared/factories/arrays.factory'))

    .provider('admin', require('./shared/services/admin.service'))
    .provider('configuration', require('./shared/services/configuration.service'))
    .provider('log', require('./shared/services/log.service'))
    .provider('map', require('./shared/services/map.service'))
    .provider('status', require('./shared/services/status.service'));
