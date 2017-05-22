sap.ui.define([
	"sap/ui/core/format/DateFormat"
	], function (DateFormat) {
		"use strict";

		return {
			/**
			 * Rounds the currency value to 2 digits
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * @returns {string} formatted currency value with 2 digits
			 */
			dateValue : function (sValue) {
				
				var oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: sap.ui.core.CalendarType.Gregorian});
				
				var DateString = sValue;
				var DateInt = parseInt(DateString.substr(6));
				
	  			//var oDateFormat = DateFormat.getDateTimeInstance({pattern: "dd.MM.YYYY"});
                return oFormatYyyymmdd.format(new Date(DateInt));
			}
		};

	}
);