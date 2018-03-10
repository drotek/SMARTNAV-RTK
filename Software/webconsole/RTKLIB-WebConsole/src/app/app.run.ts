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
export default /*@ngInject*/ function($window: angular.IWindowService, $q: angular.IQService, $rootScope: angular.IRootScopeService, $document: angular.IDocumentService) {

	console.log("app.run");

	$rootScope.host = "http://" + window.location.hostname;

	$window.Promise = $q;

	angular.element($document[0].body).addClass("platform-browser");

	if (navigator.userAgent.match(/Android/i)) {
		angular.element($document[0].body).addClass("platform-android");
	} else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
		angular.element($document[0].body).addClass("platform-iOS");
		$rootScope.isOnIOS = true;
	}

	if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|Tizen/i)) {
		angular.element($document[0].body).addClass("platform-mobile");
	} else {
		angular.element($document[0].body).addClass("platform-desktop");
		$rootScope.isDesktop = true;
	}

}
