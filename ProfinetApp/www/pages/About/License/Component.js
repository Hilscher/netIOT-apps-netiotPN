sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("netIOT.pnDevice.About.License.Component", {

		metadata : {
		  rootView: "netIOT.pnDevice.About.License.License",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
      config : {
        sample : {
          stretch : true,
          files : [
            "License.view.xml",
            "License.controller.js"
          ]
        }
      }
		}
	});

	return Component;

});
