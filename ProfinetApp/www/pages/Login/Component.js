sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("netIOT.pnDevice.Login.Component", {

		metadata : {
			rootView : "netIOT.pnDevice.Login.Login",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
      config : {
        sample : {
          stretch : true,
          files : [
            "Login.view.xml",
            "Login.controller.js"
          ]
        }
      }
		}
	});

	return Component;

});
