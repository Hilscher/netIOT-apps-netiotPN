sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("netIOT.pnDevice.ProcessData.Component", {

		metadata : {
			rootView : "netIOT.pnDevice.ProcessData.ProcessData",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
      config : {
        sample : {
          stretch : true,
          files : [
            "ProcessData.view.xml",
            "ProcessData.controller.js"
          ]
        }
      }
		}
	});

	return Component;

});
