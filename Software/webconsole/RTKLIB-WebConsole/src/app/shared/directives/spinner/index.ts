import angular = require("angular");

export default /*@ngInject*/ function() {
	return {
		restrict: "E",
		template: require("./spinner.html")
	};
}
