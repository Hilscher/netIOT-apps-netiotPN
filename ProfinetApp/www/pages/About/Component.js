sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("netIOT.pnDevice.About.Component", {

		metadata : {
		  rootView: "netIOT.pnDevice.About.About",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
      config : {
        sample : {
          stretch : true,
          files : [
            "About.view.xml",
            "About.fragment.xml",
            "About.controller.js"
          ]
        }
      }
		}
	});

	return Component;

});
