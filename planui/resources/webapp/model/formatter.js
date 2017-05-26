sap.ui.define([], function() {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function(sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},

		textFormat: function(sValue) {
			var sFormattedValue;
			switch (sValue) {
				case "P":
					sFormattedValue = "Percentage";
					break;
				case "A":
					sFormattedValue = "Absolute";
					break;
				case "NOREV":
					sFormattedValue = "No Travel Revenue";
					break;
				case "LSUMD":
					sFormattedValue = "Lump Sum a Day";
					break;
					case "REIMB":
					sFormattedValue = "Expense Reimbursement (%)";
					break;
					
									default:
				sFormattedValue =	 sValue;
			}
			return sFormattedValue;
		}

	};
});