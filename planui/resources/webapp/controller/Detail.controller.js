/*global location */
sap.ui.define([
		"plan/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"plan/model/formatter",
		"plan/model/dateFormatter"
	], function (BaseController, JSONModel, formatter,dateFormatter) {
		"use strict";

		return BaseController.extend("plan.controller.Detail", {

			formatter: formatter,
			dateFormatter: dateFormatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			onInit : function () {
				// Model used to manipulate control states. The chosen values make sure,
				// detail page is busy indication immediately so there is no break in
				// between the busy indication for loading the view's meta data
				var oViewModel = new JSONModel({
					busy : false,
					delay : 0
				});

				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				this.setModel(oViewModel, "detailView");

				this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Event handler when the share by E-Mail button has been clicked
			 * @public
			 */
			onShareEmailPress : function () {
				var oViewModel = this.getModel("detailView");

				sap.m.URLHelper.triggerEmail(
					null,
					oViewModel.getProperty("/shareSendEmailSubject"),
					oViewModel.getProperty("/shareSendEmailMessage")
				);
			},

			/**
			 * Event handler when the share in JAM button has been clicked
			 * @public
			 */
			onShareInJamPress : function () {
				var oViewModel = this.getModel("detailView"),
					oShareDialog = sap.ui.getCore().createComponent({
						name : "sap.collaboration.components.fiori.sharing.dialog",
						settings : {
							object :{
								id : location.href,
								share : oViewModel.getProperty("/shareOnJamTitle")
							}
						}
					});

				oShareDialog.open();
			},


			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			_onObjectMatched : function (oEvent) {
				var sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("Version", {
						id :  sObjectId
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
			_bindView : function (sObjectPath) {
				// Set busy indicator during view binding
				var oViewModel = this.getModel("detailView");

				// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
				oViewModel.setProperty("/busy", false);

				this.getView().bindElement({
					path : sObjectPath,
					events: {
						change : this._onBindingChange.bind(this),
						dataRequested : function () {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
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

				oViewModel.setProperty("/saveAsTileTitle",oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
				oViewModel.setProperty("/shareOnJamTitle", sObjectName);
				oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},
			
			_onPlAttrSelected : function(oEvent){
			    var that = this;
				var object = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
				var oTable =  this.getView().byId("__table1");
				
				var oTemplate = new sap.m.ColumnListItem({
				cells: [
			    new sap.m.Text({
			    	text: "{period}"
			    }),
				new sap.m.Input({
						value: "{effort}",
						submit: function(Event){
							that._onEffortChange(Event);                        
						}
					})
				]
			});
			
			oTable.removeAllItems();
			//oTable.addItem(oTemplate);                     
			    var sPath = "PlAttr("+object.ID+")/Effort";
				oTable.bindItems({
				path: sPath,
				template: oTemplate });
		
			},
			
			_onPlanDataSave : function( ){
			var batchChanges = [];
		    var batchModel = new sap.ui.model.odata.ODataModel("/plan.xsodata/", true);
		    
			var items = this.getView().byId('__table1').getItems();
			
    		//Loop through the items, updating each
        	var row;
        	var itemObject;
        	var context;
        	for(var i = 0; i < items.length; i++){
            	row = items[i];
            	context = row.getBindingContext();
            	itemObject = context.getObject();
            	itemObject.effort = 40;
                //Then execute the v2 model's Update function
                batchModel.update("/EffortPlanning(1)",itemObject,
                {
       async : false,
       success : function(oData, response) {
         jQuery.sap.require("sap.m.MessageBox");
         sap.m.MessageBox.alert("Updated successfully"); 
       },
       error : function(oError) {
          jQuery.sap.require("sap.m.MessageBox");
         sap.m.MessageBox.alert("Error during update");  
  
  }});                           
            batchChanges.push(batchModel.createBatchOperation("/EffortPlanning(1)", "MERGE", itemObject));
                
        		}
            batchModel.addBatchChangeOperations(batchChanges);
        	batchModel.submitChanges( function(data, response, errorResponse) {
            
            //Call the User Service (GET) and populate the table.
            
           sap.ui.commons.MessageBox.alert.alert("test1");
            
        }, function(data) {
        	
        	sap.ui.commons.MessageBox.alert.alert("test2");
            
        } );
				
			},
			
			_onEffortChange: function (oEvent) {
				var oModel = this.getView( ).getModel( );
				var newEffort = oEvent.getParameter("value");
				var updateModel = new sap.ui.model.odata.ODataModel("/plan.xsodata/", true);
				var oContext = oEvent.getSource().getParent().getBindingContext();
				var itemObject = oContext.getObject();
				itemObject.effort = newEffort;
				
                updateModel.update(oContext.sPath,itemObject,
                {
                async : false,
                success : function(oData, response) {
                jQuery.sap.require("sap.m.MessageBox");
                sap.m.MessageBox.alert("Updated successfully");
                oModel.refresh();
    			},
    			error : function(oError) {
        	    jQuery.sap.require("sap.m.MessageBox");
                sap.m.MessageBox.alert("Error during update");  
  
  }});                           
				
				
			},

			_onMetadataLoaded : function () {
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
			}

		});

	}
);