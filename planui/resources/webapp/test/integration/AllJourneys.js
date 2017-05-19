jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Version in the list

sap.ui.require([
	"sap/ui/test/Opa5",
	"plan/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"plan/test/integration/pages/App",
	"plan/test/integration/pages/Browser",
	"plan/test/integration/pages/Master",
	"plan/test/integration/pages/Detail",
	"plan/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "plan.view."
	});

	sap.ui.require([
		"plan/test/integration/MasterJourney",
		"plan/test/integration/NavigationJourney",
		"plan/test/integration/NotFoundJourney",
		"plan/test/integration/BusyJourney",
		"plan/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});