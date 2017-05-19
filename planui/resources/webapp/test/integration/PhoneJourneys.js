jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"plan/test/integration/NavigationJourneyPhone",
		"plan/test/integration/NotFoundJourneyPhone",
		"plan/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});