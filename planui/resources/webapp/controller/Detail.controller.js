/*global location */
sap.ui.define([
	"plan/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"plan/model/formatter",
	"plan/model/dateFormatter"
], function(BaseController, JSONModel, formatter, dateFormatter) {
	"use strict";
	return BaseController.extend("plan.controller.Detail", {
		formatter: formatter,
		dateFormatter: dateFormatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0
			});
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "detailView");
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */
		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("Version", {
					id: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},
		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function(sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");
			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		_onBindingChange: function() {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();
			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}
			var sPath = decodeURI(oElementBinding.getPath()),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.id,
				sObjectName = oObject.description,
				oViewModel = this.getModel("detailView");
			this.getOwnerComponent().oListSelector.selectAListItem(sPath);
			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject", oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage", oResourceBundle.getText("shareSendEmailObjectMessage", [
				sObjectName,
				sObjectId,
				location.href
			]));
		},
		_onPlAttrSelected: function(oEvent) {
			var that = this;
			var object = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
			var oTable = this.getView().byId("__table1");
			var oTemplate = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text: "{period}"
					}),
					new sap.m.Input({
						value: "{effort}",
						submit: function(Event) {
							that._onEffortChange(Event);
						}
					})
				]
			});
			oTable.removeAllItems();
			//oTable.addItem(oTemplate);                     
			var sPath = "PlAttr(" + object.ID + ")/Effort";
			oTable.bindItems({
				path: sPath,
				template: oTemplate
			});
		},
		_onEffortChange: function(oEvent) {
			var oModel = this.getView().getModel();
			var newEffort = oEvent.getParameter("value");
			var updateModel = new sap.ui.model.odata.ODataModel("/plan.xsodata/", true);
			var oContext = oEvent.getSource().getParent().getBindingContext();
			var itemObject = oContext.getObject();
			itemObject.effort = newEffort;
			updateModel.update(oContext.sPath, itemObject, {
				async: false,
				success: function(oData, response) {
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.alert("Effort updated successfully");
					oModel.refresh();
				},
				error: function(oError) {
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.alert("Error during effort update");
				}
			});
		},
		_onCurrencyChange: function(oEvent) {
			var oModel = this.getView().getModel();
			var newCurrency = oEvent.getParameter("value");
			var updateModel = new sap.ui.model.odata.ODataModel("/plan.xsodata/", true);
			var oContext = oEvent.getSource().getParent().getBindingContext();
			var itemObject = oContext.getObject();
			var Version = {};
			Version.id = itemObject.id;
			Version.description = itemObject.description;
			Version.startDate = itemObject.startDate;
			Version.endDate = itemObject.endDate;
			Version.currency = newCurrency;
			updateModel.update(oContext.sPath, Version, {
				async: false,
				success: function(oData, response) {
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.alert("Currency updated successfully");
					oModel.refresh();
				},
				error: function(oError) {
					jQuery.sap.require("sap.m.MessageBox");
					sap.m.MessageBox.alert("Error during currency update");
				}
			});
		},
		_onMetadataLoaded: function() {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");
			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},
		/**
		 *@memberOf plan.controller.Detail
		 */
		onOpenDialog: function(oEvent) {
			var object = oEvent.getSource().getBindingContext().getObject();
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(object);
			var oView = this.getView();
			var oDialog = oView.byId("travelDetailsDialog");
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "plan.view.TravelDetailsDialog", this);
				oView.addDependent(oDialog);
				oDialog.setModel(oModel);
			}
			oDialog.setModel(oModel);
			oDialog.open(); //This code was generated by the layout editor.
		},
		onCloseDialog: function() {
			this.getView().byId("travelDetailsDialog").close();
		}

	});
});