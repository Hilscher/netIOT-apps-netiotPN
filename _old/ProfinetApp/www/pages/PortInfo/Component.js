sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("netIOT.pnDevice.PortInfo.Component", {

		metadata : {
			rootView : "netIOT.pnDevice.PortInfo.PortInfo",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
      config : {
        sample : {
          stretch : true,
          files : [
            "PortInfo.view.xml",
            "PortInfo.controller.js"
          ]
        }
      }
		}
	});

	return Component;

});
