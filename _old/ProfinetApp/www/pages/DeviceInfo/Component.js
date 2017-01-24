sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("netIOT.pnDevice.DeviceInfo.Component", {

		metadata : {
			rootView : "netIOT.pnDevice.DeviceInfo.DeviceInfo",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
      config : {
        sample : {
          stretch : true,
          files : [
            "DeviceInfo.view.xml",
            "DeviceInfo.controller.js",
            "DeviceInfo.fragment.xml",
          ]
        }
      }
		}
	});

	return Component;

});
