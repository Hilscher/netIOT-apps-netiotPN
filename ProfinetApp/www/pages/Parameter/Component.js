sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("netIOT.pnDevice.Parameter.Component", {

		metadata : {
			rootView : "netIOT.pnDevice.Parameter.Parameter",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
      config : {
        sample : {
          stretch : true,
          files : [
            "Parameter.view.xml",
            "Parameter.controller.js"
          ]
        }
      }
		}
	});

	return Component;

});
