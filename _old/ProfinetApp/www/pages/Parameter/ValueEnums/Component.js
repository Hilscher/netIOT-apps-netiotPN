sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("netIOT.pnDevice.Parameter.ValueEnums.Component", {

		metadata : {
			rootView : "netIOT.pnDevice.Parameter.ValueEnums.ValueEnums",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
      config : {
        sample : {
          stretch : true,
          files : [
            "ValueEnums.view.xml",
            "ValueEnums.controller.js"
          ]
        }
      },
      routing : {  
        config : {  
          viewType : "JS",  
          viewPath : "App.view",  
          targetControl : "NavContainer",  
          clearTarget : false,  
        },  
        routes : []  
      }
		}
	});

	return Component;

});
