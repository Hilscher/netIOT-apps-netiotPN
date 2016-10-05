sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("netIOT.pnDevice.Parameter.ParameterValue.Component", {

		metadata : {
			rootView : "netIOT.pnDevice.Parameter.ParameterValue.ParameterValue",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
      config : {
        sample : {
          stretch : true,
          files : [          
            "ParameterValue.view.xml",
            "ParameterValue.controller.js"
          ]
        }
      }
		}
	});

	return Component;

});
