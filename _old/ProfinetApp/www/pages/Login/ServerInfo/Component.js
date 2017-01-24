sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("netIOT.pnDevice.Login.ServerInfo.Component", {

		metadata : {
		  rootView: "netIOT.pnDevice.Login.ServerInfo.ServerInfo",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
      config : {
        sample : {
          stretch : true,
          files : [          
            "ServerInfo.view.xml",
            "ServerInfo.controller.js"
          ]
        }
      }
		}
	});

	return Component;

});
