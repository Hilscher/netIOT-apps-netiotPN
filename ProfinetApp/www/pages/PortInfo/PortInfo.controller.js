sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/ui/core/routing/History',
    'sap/ui/model/resource/ResourceModel'
], function (jQuery, Controller, JSONModel, History, ResourceModel) {
	"use strict";

	var PageController = Controller.extend("netIOT.pnDevice.PortInfo.PortInfo", {
    
		onInit: function (oEvent) {		  
		  
      this.initRouter();        
      this.initViewModel();
    },
    
    /**
     * Initialize the router.
     *       
     * @public
     */
    initRouter : function() {
      
      this.router = sap.ui.core.UIComponent.getRouterFor(this);
      
      if(this.router){     
        var route = this.router.getRoute("portInfoPage"); 
        
        if(route) {         
          route.attachPatternMatched(this.onObjectMatched, this);
        }
      }
    },       
    
    /**
     * Initialize the view model.
     *       
     * @public
     */
    initViewModel : function() {		  
	    
      var oData = {
	        deviceUuid: "",
	        portUuid: "",
	        portId: "",
	        neighbourDeviceUuid: "",
	        neighbourPortUuid: "",
          basicInfos : [],
          neighbourInfoList: []
      };      
		  
		  var oDataModel = new JSONModel(oData);
		  this.getView().setModel(oDataModel);

      // set i18n model on view
		  var i18nModel = new ResourceModel({
		    bundleUrl: "i18n/i18n.properties"
		  });

		  if (i18nModel) {
		    this.getView().setModel(i18nModel, "i18n");
		  }
		},

    /**
     * Binds the view to the object path.
     * @function
     * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
     * @private
     */
    onObjectMatched: function(oEvent) {     
      
      var args = oEvent.getParameter("arguments");
      
      if(args && args.uuids) {       
        var spList = args.uuids.split("_");
        
        if(spList.length == 2) {
          this.updateViewModel(spList[0], spList[1]);
        }
        else {
          //console.log("Invalid uuids!");
        }
      }
    },
		
	  /**
     * update the view with specified parameters.
     * 
     * @param {object} params The possible parameters.
     *        
     * @public
     */
    updateView: function (params) {
      var result = false;
      if (params && params.deviceUuid && params.portUuid) {
        this.updateViewModel(params.deviceUuid, params.portUuid);
        result = true;
      }
      return result;
    },

    /**
     * Binds the view to the object path.
     * @function
     * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
     * @private
     */
    updateViewModel: function(deviceUuid, portUuid) {
      var device = oAppDataModel.getDevice();
      var oViewModel = this.getView().getModel();

      if (device && oViewModel) {
        var deviceListResp = oAppDataModel.getDeviceListResponse();
        var info = deviceListResp.getPortAndAncestorInDevice(device, portUuid);
      
        if (info && info.port) {
          oViewModel.setProperty("/deviceUuid", deviceUuid);
          oViewModel.setProperty("/portUuid", portUuid);

          this.updatePortInfo(info.port);
          this.updateNeighbourInfo(info.port);
        }
      }
    },
   
    /**
     * Update port information.
     * @function
     * @param {object} port The port object.
     * 
     * @private
     */
    updateNeighbourInfo: function(port) {
      
      var oViewModel = this.getView().getModel();

      if(!oViewModel || !port) {
        return;
      }
      
      var snmpNeighbour = null;
      var neighbourPortUuid = '';
      var neighbourDeviceUuid = '';
      var neighbourInfoList = [];
      var inactiveLinkType = 'Inactive';

      if(port.neighbourList) {
        var devListRep = oAppDataModel.getDeviceListResponse();

        for (var k = 0; k < port.neighbourList.length; k++) {
          var neighbourPort = port.neighbourList[k];
          
          if (!neighbourPort || !neighbourPort.uuid) {
            continue;
          }

          neighbourPortUuid = neighbourPort.uuid;
          var portAndAncestor = devListRep.getPortAndAncestor(neighbourPortUuid);

          if(portAndAncestor && portAndAncestor.device) {
            neighbourDeviceUuid = portAndAncestor.device.uuid;
          }
            
          this.createNeighbourInfo(portAndAncestor, neighbourInfoList);

          // TODO: Support more neighbour ports.
          break; 
        }
      }


      oViewModel.setProperty("/neighbourDeviceUuid", neighbourDeviceUuid);
      oViewModel.setProperty("/neighbourPortUuid", neighbourPortUuid);
      oViewModel.setProperty("/neighbourInfoList", neighbourInfoList);
    },

    
    /**
     * Update port information.
     * @function
     * @param {object} portAndAncestor The port and its ancestor objects.
     * @param {object} neighbourInfoList The neighbour info list object.
     * 
     * @private
     */
    createNeighbourInfo: function(portAndAncestor, neighbourInfoList) {
      if(!portAndAncestor || !neighbourInfoList) {
        return; 
      }

      var snmpGlobal = null;
      var inactiveLinkType = "Inactive";

      if(portAndAncestor.device && portAndAncestor.device.snmpGlobal) {
        snmpGlobal = portAndAncestor.device.snmpGlobal;
      }

      if(snmpGlobal) {
        
        // DeviceName
        if (snmpGlobal.hasOwnProperty("snmpDeviceName")) {
          neighbourInfoList.push({
            name: oBundle.getText("deviceName"),
            value: snmpGlobal.snmpDeviceName,
            listType: inactiveLinkType,
            linkType: "device"
          });
        }
      }

      var deviceIF = portAndAncestor.deviceInterface;

      if (deviceIF) {
        // IpAddress
        if (deviceIF.hasOwnProperty("ipAddress")) {
          neighbourInfoList.push({
            name: oBundle.getText("ipAddress"),
            value: deviceIF.ipAddress,
            listType: inactiveLinkType
          });
        }

        // StationName
        //if (deviceIF.snmpInterface && deviceIF.snmpInterface.snmpStationName) {
        //  neighbourInfoList.push({
        //    name: oBundle.getText("stationName"),
        //    value: deviceIF.snmpInterface.snmpStationName,
        //    listType: inactiveLinkType
        //  });
        //}
      }

      var port = portAndAncestor.port;

      if (port) {
        var snmpPort = port.snmpPort;

        if (snmpPort) {
          // Port index
          if (snmpPort.hasOwnProperty("snmpPortNumber")) {
            neighbourInfoList.push({
              name: oBundle.getText("portNumber"),
              value: snmpPort.snmpPortNumber,
              listType: inactiveLinkType
            });
          }

          // PortId
          if (snmpPort.hasOwnProperty("snmpPortId")) {
            // TODO: Allow navigation to neighbour port. 
            //var listType = neighbourPortUuid ? "Navigation" : inactiveLinkType
            var listType = inactiveLinkType;

            neighbourInfoList.push({
              name: oBundle.getText("portId"),
              value: snmpPort.snmpPortId,
              listType: listType,
              linkType: "port"
            });
          }

          // Port description
          if (snmpPort.hasOwnProperty("snmpPortDescription")) {
            // TODO: Allow navigation to neighbour port. 
            //var listType = neighbourPortUuid ? "Navigation" : inactiveLinkType
            var listType = inactiveLinkType;

            neighbourInfoList.push({
              name: oBundle.getText("portDescription"),
              value: snmpPort.snmpPortDescription,
              listType: listType,
              linkType: "port"
            });
          }
        }
      }
    },

    /**
     * Update port information.
     * @function
     * @param {object} port The port object.
     * 
     * @private
     */
    updatePortInfo: function(port) {
      
      var oViewModel = this.getView().getModel();

      if(!oViewModel || !port) {
        return;
      }

      var portId = "";
      var inactiveLinkType = "Inactive";
      var basicInfos = [];

      var snmpPort = port.snmpPort;

      if (snmpPort) {
        // PortNumber
        if (snmpPort.hasOwnProperty("snmpPortNumber")) {
          basicInfos.push({
            name: oBundle.getText("portNumber"),
            value: snmpPort.snmpPortNumber,
            listType: inactiveLinkType
          });
        }

        // PortId
        if (snmpPort.hasOwnProperty("snmpPortId")) {
          portId = snmpPort.snmpPortId;

          basicInfos.push({
            name: oBundle.getText("portId"),
            value: snmpPort.snmpPortId,
            listType: inactiveLinkType
          });
        }

        // LinkStatus
        if (snmpPort.hasOwnProperty("snmpLinkStatus")) {
          basicInfos.push({
            name: oBundle.getText("linkStatus"),
            value: snmpPort.snmpLinkStatus,
            listType: inactiveLinkType
          });
        }

        // PortDescription
        if (snmpPort.hasOwnProperty("snmpPortDescription")) {
          basicInfos.push({
            name: oBundle.getText("description"),
            value: snmpPort.snmpPortDescription,
            listType: inactiveLinkType
          });
        }

        // InOctets
        if (snmpPort.hasOwnProperty("snmpInOctets")) {
          basicInfos.push({
            name: oBundle.getText("inOctets"),
            value: snmpPort.snmpInOctets,
            listType: inactiveLinkType
          });
        }

        // OutOctets
        if (snmpPort.hasOwnProperty("snmpOutOctets")) {
          basicInfos.push({
            name: oBundle.getText("outOctets"),
            value: snmpPort.snmpOutOctets,
            listType: inactiveLinkType
          });
        }

        // inErrorFrames
        if (snmpPort.hasOwnProperty("snmpInErrorFrames")) {
          basicInfos.push({
            name: oBundle.getText("inErrorFrames"),
            value: snmpPort.snmpInErrorFrames,
            listType: inactiveLinkType
          });
        }

        // OutErrorFrames
        if (snmpPort.hasOwnProperty("snmpOutErrorFrames")) {
          basicInfos.push({
            name: oBundle.getText("outErrorFrames"),
            value: snmpPort.snmpOutErrorFrames,
            listType: inactiveLinkType
          });
        }

        // snmpInDiscardFrames
        if (snmpPort.hasOwnProperty("snmpInDiscardFrames")) {
          basicInfos.push({
            name: oBundle.getText("inDiscardFrames"),
            value: snmpPort.snmpInDiscardFrames,
            listType: inactiveLinkType
          });
        }

        // snmpOutDiscardFrames
        if (snmpPort.hasOwnProperty("snmpOutDiscardFrames")) {
          basicInfos.push({
            name: oBundle.getText("outDiscardFrames"),
            value: snmpPort.snmpOutDiscardFrames,
            listType: inactiveLinkType
          });
        }

        // snmpSpeedInBitsPerSec
        if (snmpPort.hasOwnProperty("snmpSpeedInBitsPerSec")) {
          var speedWithUnit = '';
          var speed = parseFloat(snmpPort.snmpSpeedInBitsPerSec);

          if (isNaN(speed)) {
            speedWithUnit = snmpPort.snmpSpeedInBitsPerSec;
          } else {
            var numberOfDecimals = 1;

            if (speed < 1000) {
              speedWithUnit = speed.toString() + oBundle.getText("bitPerSecond");
            } else if (speed < 1000000) {
              speed = speed / 1000;

              if (speed % 1000 > 0 ) {
                speed = speed.toFixed(numberOfDecimals);
              }

              speedWithUnit = speed.toString() + '  ' + oBundle.getText("KBitPerSecond");
            } else {
              speed = speed / 1000000;

              if (speed % 1000000 > 0) {
                speed = speed.toFixed(numberOfDecimals);
              }

              speedWithUnit = speed.toString() + '  ' + oBundle.getText("MBitPerSecond");
            }
          }

          basicInfos.push({
            name: oBundle.getText("portSpeed"),
            value: speedWithUnit,
            listType: inactiveLinkType
          });
        }
      }

      var iolPort = port.iolPort;

      if (iolPort) {
        // iolVendorId
        if (iolPort.hasOwnProperty("iolVendorId")) {
          basicInfos.push({
            name: oBundle.getText("vendorId"),
            value: iolPort.iolVendorId,
            listType: inactiveLinkType
          });
        }

        // iolDeviceId
        if (iolPort.hasOwnProperty("iolDeviceId")) {
          basicInfos.push({
            name: oBundle.getText("deviceId"),
            value: iolPort.iolDeviceId,
            listType: inactiveLinkType
          });
        }

        // iolSerialNumber
        if (iolPort.hasOwnProperty("iolSerialNumber")) {
          basicInfos.push({
            name: oBundle.getText("serialNumber"),
            value: iolPort.iolSerialNumber,
            listType: inactiveLinkType
          });
        }

        // iolDsConfig
        if (iolPort.hasOwnProperty("iolDsConfig")) {
          basicInfos.push({
            name: oBundle.getText("dsConfig"),
            value: iolPort.iolDsConfig,
            listType: inactiveLinkType
          });
        }

        // iolInspectorLevel
        if (iolPort.hasOwnProperty("iolInspectorLevel")) {
          basicInfos.push({
            name: oBundle.getText("inspectorLevel"),
            value: iolPort.iolInspectorLevel,
            listType: inactiveLinkType
          });
        }

        // iolPort
        if (iolPort.hasOwnProperty("iolPort")) {
          basicInfos.push({
            name: oBundle.getText("iolPort"),
            value: iolPort.iolPort,
            listType: inactiveLinkType
          });
        }

        // iolPortMode
        if (iolPort.hasOwnProperty("iolPortMode")) {
          basicInfos.push({
            name: oBundle.getText("iolPortMode"),
            value: iolPort.iolPortMode,
            listType: inactiveLinkType
          });
        }

        // iolPortModeDetails
        if (iolPort.hasOwnProperty("iolPortModeDetails")) {
          basicInfos.push({
            name: oBundle.getText("portModeDetails"),
            value: iolPort.iolPortModeDetails,
            listType: inactiveLinkType
          });
        }
      }

      oViewModel.setProperty("/portId", portId);
      oViewModel.setProperty("/basicInfos", basicInfos);
    },

    /**
     * Event handler  for navigating back.
     * It checks if there is a history entry. If yes, history.go(-1) will happen.
     * If not, it will replace the current entry of the browser history with the worklist route.
     * Furthermore, it removes the defined binding context of the view by calling unbindElement().
     * @public
     */
    onNavBack : function (evt) {
      
      navBack();
      //if (this.router) {
        
      //  var oViewModel = this.getView().getModel();
        
      //  this.router.navBack(MobileAppIds.ID_DEVICE_INFO_PAGE,
      //                      {uuid: oViewModel.getProperty("/deviceUuid")});  
      //}
    },
    
    /**
     * Go back to the home page.
     * 
     * @memberOf DeviceInfo
     */
    goToHomePage: function (evt) {
      navToHome();

      //if (this.router) {
      //  this.router.navBack(MobileAppIds.ID_HOME_PAGE);  
      //}
    },
    
    /**
     * Event handler when a table item gets pressed
     * 
     * @param {sap.ui.base.Event}
     *          oEvent the table selectionChange event
     * @public
     */
    goToNeighbour : function(oEvent) {
      
      var oContext = oEvent.getSource().getBindingContext();
      var oViewModel = this.getView().getModel();      
      
      if(oContext && oViewModel) {
        
        var oItem = oContext.getProperty(oContext.sPath); 
        
        if(oItem && oItem.linkType) {                
          var neighbourDeviceUuid = oViewModel.getProperty("/neighbourDeviceUuid");
          var neighbourPortUuid = oViewModel.getProperty("/neighbourPortUuid");
          
          if(neighbourDeviceUuid) {
            
            if (oItem.linkType == "device") {             

              updateView(MobileAppIds.DeviceInfoPageInfo.viewId, neighbourDeviceUuid);
              navTo(MobileAppIds.DeviceInfoPageInfo.pageId);

              //this.router.navTo(MobileAppIds.ID_DEVICE_INFO_PAGE, {
              //  uuid: neighbourDeviceUuid
              //});
            }
            else if(oItem.linkType == "port") {
              // TODO
            }   
          }
        }
      }    
    },
          
	});


	return PageController;

});
