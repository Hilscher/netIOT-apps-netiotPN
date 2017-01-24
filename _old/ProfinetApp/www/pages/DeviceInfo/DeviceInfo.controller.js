/**
 * Copyright (c) 2016 Hilscher Gesellschaft fuer Systemautomation mbH
 *
 * Licensed under the MIT License, - see MITLicense.txt.
 *
 * The controller for page Device Info.
 */

sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"sap/ui/core/routing/History",
		'sap/m/MessageBox',
    'sap/ui/model/resource/ResourceModel'
], function (jQuery, Controller, JSONModel, History, MessageBox, ResourceModel) {
	"use strict";

	var PageController = Controller.extend("netIOT.pnDevice.DeviceInfo.DeviceInfo", {
    
	  onInit: function (oEvent) {
      this.ioLink = 'IO-Link';
      this.profinet = 'PROFINET';

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
        var route = this.router.getRoute("deviceInfoPage"); 
        
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

      this.resetViewModel();

      // set i18n model on view
      var i18nModel = new ResourceModel({
        bundleUrl: "i18n/i18n.properties"
      });

      if (i18nModel) {
        this.getView().setModel(i18nModel, "i18n");
      }
    },

	  /**
     * Reset the view model.
     *       
     * @public
     */
    resetViewModel: function () {

      var oData = {
        deviceUuid: "",
        deviceName: "",
        basicInfos: [],
        parameterList: [],
        rawParameterPackageList: null,
        processDataList: [],
        rawProcessDataPackageList: null,
        visibleForDevIFPanel: true,
        visibleForParamPanel: false
      };

      var oViewModel = new JSONModel(oData);
      this.getView().setModel(oViewModel);

      var oLayout = this.getView().byId('idInterfacesVLayout');

      if (oLayout) {
        oLayout.removeAllContent();
      }
    },

	  /**
     * Set property to view model.
     * 
     * @param {string} path The property path.
     * @param {object} data The property data.
     * @param {string} modelName The model name.
     * 
     * @public
     */
    setProperty: function (path, data, modelName) {
      var oViewModel = null;

      if (modelName) {
        oViewModel = this.getView().getModel(modelName);
      }
      else {
        oViewModel = this.getView().getModel();
      }

      if (oViewModel) {
        oViewModel.setProperty(path, data);
      }
    },

	  /**
     * Get property from view model.
     * @param {string} path The property path.
     * @param {string} modelName The model name.
     * 
     * @public
     */
    getProperty: function (path, modelName) {
      var oViewModel = null;

      if (modelName) {
        oViewModel = this.getView().getModel(modelName);
      }
      else {
        oViewModel = this.getView().getModel();
      }

      if (oViewModel) {
        return oViewModel.getProperty(path);
      }

      return null;
    },


	  /**
     * update the view model by device UUID.
     * 
     * @param {object} deviceUuid the device UUID.
     *        
     * @public
     */
    updateViewModelByUuid: function (deviceUuid) {
      this.resetViewModel();

      var that = this;

      if (deviceUuid) {
        var OnSuccess = function (data) {
          
          oAppDataModel.setDeviceListResponse(data);
          var result = that.setDeviceInfo(deviceUuid);

          if (!result) {
            that.showMessage(null, 'failedToGetInfo');
          }
        }

        this.queryDeviceList(OnSuccess);
      }
    },

    /**
     * update the view data model.
     * 
     * @param {object} device the device object.
     *        
     * @public
     */
    updateViewModel : function(device) {

      var oViewModel = this.getView().getModel();
      
      if(!device || !oViewModel) {
        return;
      }
      
      oViewModel.setProperty("/deviceUuid", device.uuid);

      var snmpGlobal = device.snmpGlobal;

      if (snmpGlobal) {
        this.setProperty('/deviceName', snmpGlobal.snmpDeviceName);
      }

      this.updateInterfaceList(oViewModel, device); 
    },
    
    /**
     * Update port information.
     * @function
     * @param {object} oViewModel The view model.
     * @param {object} port The port object.
     * 
     * @private
     */
    updateBasicInfo: function(oViewModel, device, ipAddressList) {
      
      if(!oViewModel || !device) {
        return;
      }

      var deviceName = "";
      var basicInfos = [];

      if (device.hasOwnProperty('snmpGlobal')) {
        var snmpGlobal = device.snmpGlobal;

        // deviceName
        deviceName = snmpGlobal.snmpDeviceName;
        basicInfos.push({
          name: oBundle.getText("deviceName"),
          value: deviceName
        });

        // device description
        if (snmpGlobal.snmpSystemDescription) {
          basicInfos.push({
            name: oBundle.getText("description"),
            value: snmpGlobal.snmpSystemDescription
          });
        }

        // device system up time
        if (snmpGlobal.snmpSystemUpTime) {
          var upTime = parseInt(snmpGlobal.snmpSystemUpTime);

          if (!isNaN(upTime)) {

            var upTimeText = '';

            // The unit of startup time is 10 ms.
            var twoDigitals = upTime % 100;

            var totalSeconds = Math.floor(upTime / 100);
            var seconds = totalSeconds % 60;

            var totalMinutes = Math.floor(totalSeconds / 60);
            var minutes = totalMinutes % 60;

            var totalHours = Math.floor(totalMinutes / 60);
            var hour = totalHours % 24;

            var totalDays = Math.floor(totalHours / 24);

            if (totalDays > 0) {
              upTimeText += totalDays.toString();
              upTimeText += oBundle.getText("dayShortName") ;
            }

            if (hour > 0 || upTimeText.length > 0) {
              upTimeText += ' ' + hour.toString() + oBundle.getText("hourShortName");
            }

            if (minutes > 0 || upTimeText.length > 0) {
              upTimeText += ' ' + minutes.toString() + oBundle.getText("minuteShortName");
            }

            if (seconds > 0 || upTimeText.length > 0) {
              upTimeText += ' ' + seconds.toString() + oBundle.getText("secondShortName");
            }

            if (twoDigitals > 0 || upTimeText.length > 0) {
              var ms = twoDigitals * 10;
              upTimeText += ' ' + ms.toString() + oBundle.getText("msShortName");
            }

            basicInfos.push({
              name: oBundle.getText("systemUpTime"),
              value: upTimeText
            });
          }
        }
      }

      // ipAddress of all interfaces
      //basicInfos.push({
      //  name: oBundle.getText("ipAddress"),
      //  value: ipAddressList
      //});
     
      oViewModel.setProperty("/deviceName", deviceName);
      oViewModel.setProperty("/basicInfos", basicInfos);
    },

    /**
     * create panel according to the interface type.
     * 
     * @param {number} ifIndex the interface index in device.
     * @param {string} ifType the interface type.
     * @param {object} ifItem the interface object.
     *        
     * @public
     */
    createInterfacePanel(ifIndex, ifType, ifItem) {
      var panel = null;
      var model = null;

      if (ifType == this.ioLink) {
        panel = sap.ui.xmlfragment(
          'netIOT.pnDevice.DeviceInfo.IOLinkPanel', this);
        model = this.createIoLinkModel(ifIndex, ifType, ifItem);
      } else {
        panel = sap.ui.xmlfragment(
          'netIOT.pnDevice.DeviceInfo.ProfinetPanel', this);

        model = this.createProfinetModel(ifIndex, ifType, ifItem);
      }
      
      if (panel && model) {
        panel.setModel(model);
        this.getView().addDependent(panel);
      }

      return panel;
    },

	  /**
     * create IO-Link data model.
     * 
     * @param {number} ifIndex the interface index in device.
     * @param {string} ifType the interface type.
     * @param {object} ioLinkIF the IO-Link interface object.
     *        
     * @public
     */
    createIoLinkModel(index, ifType, ioLinkIF) {
      var panelName = 'Interface ' + index.toString();
      var portList = this.getIoLinkPortList(ioLinkIF);
      var basicInfos = [];

      var inactiveLinkType = "Inactive";

      if (ioLinkIF.hasOwnProperty("ipAddress")) {
        basicInfos.push({
          name: oBundle.getText("ipAddress"),
          value: ioLinkIF.ipAddress,
          listType: inactiveLinkType
        });
      }

      var arpIf = ioLinkIF.arpInterface;

      if (arpIf && arpIf.arpMacAddress) {
        basicInfos.push({
          name: oBundle.getText("macAddress"),
          value: arpIf.arpMacAddress,
          listType: inactiveLinkType
        });
      }

      var oData = {
        panelName: panelName,
        panelType: ifType,
        basicInfos: basicInfos,
        portList: portList
      };

      var oViewModel = new JSONModel(oData);
      return oViewModel;
    },

	  /**
     * update the interface list.
     * 
     * @param {object} interfaceItem the interface object.
     *        
     * @public
     */
    getIoLinkPortList: function (interfaceItem) {
      var list = [];

      if (interfaceItem && interfaceItem.portList) {

        var portList = interfaceItem.portList;
        var item, iolPort, portNumber, iolDeviceId, iolVendorId;
        var columnType, iconSrc, iconColor;

        for (var i = 0; i < portList.length; i++) {

          item = portList[i];
          iolPort = item.iolPort;

          //columnType = 'Inactive';
          columnType = 'Navigation';
          iconSrc = 'sap-icon://disconnected';
          iconColor = "Negative";
          portNumber = 0;
          iolDeviceId = '';
          iolVendorId = '';

          if (iolPort) {
            if (item.neighbourList && item.neighbourList.length > 0) {
              columnType = "Navigation";
              iconSrc = "sap-icon://connected";
              iconColor = "Positive";
            }

            if (iolPort.hasOwnProperty('iolPort')) {
              portNumber = iolPort.iolPort;
            }

            if (iolPort.hasOwnProperty('iolDeviceId')) {
              iolDeviceId = iolPort.iolDeviceId;
            }

            if (iolPort.hasOwnProperty('iolVendorId')) {
              iolVendorId = iolPort.iolVendorId;
            }
          }

          list.push({
            uuid: item.uuid,
            portNumber: portNumber,
            iolDeviceId: iolDeviceId,
            iolVendorId: iolVendorId,
            columnType: columnType,
            iconSrc: iconSrc,
            iconColor: iconColor
          });
        }
      }

      return list;
    },

    /**
     * create Profinet data model.
     * 
     * @param {number} ifIndex the interface index in device.
     * @param {string} ifType the interface type.
     * @param {object} profinetIF the PROFINET interface object.
     *        
     * @public
     */
    createProfinetModel(index, ifType, profinetIF) {
      var panelName = 'Interface ' + index.toString();
      var portList = this.getProfinetPortList(profinetIF);
      var basicInfos = [];

      var inactiveLinkType = "Inactive";
            
      if (profinetIF.hasOwnProperty("ipAddress")) {
        basicInfos.push({
          name: oBundle.getText("ipAddress"),
          value: profinetIF.ipAddress,
          listType: inactiveLinkType
        });
      }

      var arpIf = profinetIF.arpInterface;

      if (arpIf && arpIf.arpMacAddress) {
        basicInfos.push({
          name: oBundle.getText("macAddress"),
          value: arpIf.arpMacAddress,
          listType: inactiveLinkType
        });
      }

      var oData = {
        panelName: panelName,
        panelType: ifType,
        basicInfos: basicInfos,
        portList: portList
      };

      var oViewModel = new JSONModel(oData);
      return oViewModel;
    },

	  /**
     * update the interface list.
     * 
     * @param {object} interfaceItem the interface object.
     *        
     * @public
     */
    getProfinetPortList: function (interfaceItem) {
      var list = [];

      if (interfaceItem && interfaceItem.portList) {

        var portList = interfaceItem.portList;
        var item, snmpPort, portNumber, inOctets, outOctets, inErrorFrames, outErrorFrames;
        var columnType, iconSrc, iconColor;

        for (var i = 0; i < portList.length; i++) {

          item = portList[i];
          snmpPort = item.snmpPort;

          //columnType = 'Inactive';
          columnType = 'Navigation';
          iconSrc = 'sap-icon://disconnected';
          iconColor = "Negative";
          portNumber = 0;
          inOctets = '';
          outOctets = '';
          inErrorFrames = '';
          outErrorFrames = '';

          if (snmpPort) {
            if (snmpPort.snmpLinkStatus == "up") {
              columnType = "Navigation";
              iconSrc = "sap-icon://connected";
              iconColor = "Positive";
            }

            if (snmpPort.hasOwnProperty('snmpPortNumber')) {
              portNumber = snmpPort.snmpPortNumber;
            }

            if (snmpPort.hasOwnProperty('snmpInOctets')) {
              inOctets = snmpPort.snmpInOctets;
            }

            if (snmpPort.hasOwnProperty('snmpOutOctets')) {
              outOctets = snmpPort.snmpOutOctets;
            }

            if (snmpPort.hasOwnProperty('snmpInErrorFrames')) {
              inErrorFrames = snmpPort.snmpInErrorFrames;
            }

            if (snmpPort.hasOwnProperty('snmpOutErrorFrames')) {
              outErrorFrames = snmpPort.snmpOutErrorFrames;
            }
          }

          list.push({
            uuid: item.uuid,
            portNumber: portNumber,
            neighborDeviceName: "",
            inOctets: inOctets,
            outOctets: outOctets,
            inErrorFrames: inErrorFrames,
            outErrorFrames: outErrorFrames,
            columnType: columnType,
            iconSrc: iconSrc,
            iconColor: iconColor
          });
        }
      }

      return list;
    },

    /**
     * update the interface list.
     * 
     * @param {object} interfaceList the interface list object.
     *        
     * @public
     */
    updateInterfaceList : function(oViewModel, device) {

      if(!oViewModel || !device || !device.interfaceList) {
        return;
      }
        
      var interfaceList = device.interfaceList;
        
      var ipAddress, macAddress;
      var ipAddressList = "";
      var list = [];
      var item;
      var ifType = '';
      var description = '';
      var oFragment;
      var oIfDataModel;
      var oLayout = this.getView().byId('idInterfacesVLayout');
      
      if (oLayout) {
        oLayout.removeAllContent();
      }

      for (var i = 0; i < interfaceList.length; i++) {
        ipAddress = '';
        macAddress = '';
        description = '';
        item = interfaceList[i];

        if (item.hasOwnProperty("iolInterface")) {
          ifType = this.ioLink;
        } else {
          ifType = this.profinet;
        }

        if (oLayout) {
          var panel = this.createInterfacePanel(i, ifType, item);

          if (panel) {
            oLayout.addContent(panel);
          }
        }

        if (item.hasOwnProperty("ipAddress")) {
          ipAddress = item.ipAddress;
          description = ipAddress;
         
          if(i > 0) {
            ipAddressList = ipAddressList + ', ';
          }
          
          ipAddressList = ipAddressList + ipAddress;
        } 
        
        var arpIf = item.arpInterface;

        if (arpIf && arpIf.arpMacAddress) {
          macAddress = arpIf.arpMacAddress;
        }

      }

      this.updateBasicInfo(oViewModel, device, ipAddressList);
    },

    /**
     * Update the parameter list.
     * 
     * @param {object} packageList The package list for parameters.
     *        
     * @public
     */
    updateParameterList: function (packageList) {

      var oViewModel = this.getView().getModel();
      
      if (!packageList || !oViewModel) {
        return;
      }

      var paramList = [];
      var item, paramName;
      var paramValue = '';
      var paramUnit = '';
      
      for (var i = 0; i < packageList.length; i++) {

        var parameters = packageList[i].parameterList;
        var packageId = packageList[i].packageId;

        for (var j = 0; j < parameters.length; j++) {

          item = parameters[j];

          if (!item || !item.semanticInfo || !item.name) {
            continue;
          }

          paramName = item.name.join(".");

          // Do not show value
          //paramValue = "";
          //if (item.hasOwnProperty("value")) {
          //  paramValue = this.convertValueToString(item.value);

          //  if (item.hasOwnProperty("unit") &&
          //     paramValue.length > 0 && paramValue != "...") {
          //    paramUnit = item.unit;
          //  }
          //}

          paramList.push({
            packageId: packageId,
            parameter: item,
            name: paramName,
            //value: paramValue,
            //unit: paramUnit,
            index: i
          });
        }
      }
      if (paramList.length > 0) {
        oViewModel.setProperty("/visibleForParamPanel", true);
      }      

      oViewModel.setProperty("/rawParameterPackageList", packageList);
      oViewModel.setProperty("/parameterList", paramList);
    },

	  /**
     * Query parameter list from server.
     * @function
     * @param {object} device device object.
     * @private
     */
    queryProcessDataList: function (device) {
      var that = this;
      var uuid = device.uuid;
      var url = oAppDataModel.getRequestUrl("/device/processData/list") + '?deviceUuid=' + encodeURIComponent(uuid);
      var sessionToken = oAppDataModel.getSessionToken();

      jQuery.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        beforeSend: function (request) {
          request.setRequestHeader('sessionToken', sessionToken);
        },
        contentType: "application/json; charset=utf-8",
        success: function (data) {
          if (data && data.packageList) {
            that.updateProcessDataList(data.packageList);
          }
          else {
            that.showMessage(null, 'failed to parse the response of process data list!');
          }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          that.showMessage(XMLHttpRequest, 'failedToGetProcessDataList');
        }
      });
    },

    /**
     * Update the process data list.
     * 
     * @param {object} packageList The package list for process data 
     *        
     * @public
     */
    updateProcessDataList: function (packageList) {  

      var oViewModel = this.getView().getModel();

      if (!packageList || !oViewModel) {
        return;
      }

      var list = [];
      var item, itemName, itemValue;

      for (var i = 0; i < packageList.length; i++) {
        var dataList = packageList[i].processDataList;
        var packageId = packageList[i].packageId;

        for (var j = 0; j < dataList.length; j++) {
          item = dataList[j];
          list.push({
            packageId: packageId,
            processData: item,
            name: item.name.join('.'),
            dir: item.direction
            //value: item.value
          });
        }
      }

      oViewModel.setProperty("/processDataList", list);
      oViewModel.setProperty("/rawProcessDataPackageList", packageList);
    },

    /**
     * Convert parameter value to string, which is shown in list.
     * 
     * @param {object} value The parameter value. 
     *        
     * @public
     */
    convertValueToString : function(value) {
      var result = ""; 
      
      if(typeof value == 'string' || value instanceof String) {  
        
        if(value.length < 20) 
          result = value;
        else 
          result = "..."; // Show "..." in the list if the string has more than 20 characters.
      }
      else if(typeof value == 'number' || typeof value == 'boolean' ||
              value instanceof Number  || value instanceof Boolean ) {
        paramValue = value.toString();
      }
      else {
        result = "..."; // Text for array or complicate variant. 
      }   
      
      return result; 
    },
    
  
    /**
     * Binds the view to the object path.
     * @function
     * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
     * @private
     */
    onObjectMatched: function(oEvent) {     
      
      var args = oEvent.getParameter("arguments");
      
      if(args && args.uuid) {
        this.updateViewModelByUuid(args.uuid);
      }
    },
    
    /**
     * Get device uuid in view model.
     * @function
     * @return {string} device uuid.
     * @private
     */
    getDeviceUuid: function() { 
      var result = "";
      var oViewModel = this.getView().getModel();
      
      if(oViewModel) {
        result = oViewModel.getProperty("/deviceUuid");
      } 
      
      return result;
    },

	  /**
     * Set device uuid in view model.
     * @function
     * @param {object} device device object.
     * @private
     */
    setDeviceUuid: function (uuid) {
      var result = "";
      var oViewModel = this.getView().getModel();

      if (oViewModel) {
        oViewModel.setProperty("/deviceUuid", uuid);
      }
    },
    
	  /**
     * get interface uuid by index.
     * @function
     * @param {object} device device object.
     * @private
     */
    getInterfaceUuid: function(device, devIFIndex) { 
      var result = undefined;

      if (device) {
        for (var i = 0; i < device.interfaceList.length; i++) {

          if (devIFIndex == i) {
            result = device.interfaceList[i].uuid;
            break;
          }          
        }
      }
      return result;
    },

	  /**
     * Query device list and show the information the selected device.
     * 
     * @param {object} onSuccess The callback functioin if query is sucessful.
     *        
     * @public
     */
    queryDeviceList: function (onSuccess) {

      var that = this;
      var url = oAppDataModel.getRequestUrl("/device/list");
      var sessionToken = oAppDataModel.getSessionToken();

      jQuery.ajax({
        url: url,
        type: "GET",
        cache: false,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (request) {
          request.setRequestHeader('sessionToken', sessionToken);
        },
        success: function (data) {
          //console.log(JSON.stringify(data));
          onSuccess(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          that.showMessage(XMLHttpRequest, 'failedToGetDeviceList');
        }
      });
    },

	  /**
    * Set device info from device response.
    * 
    * @param {string} deviceUuid the device uuid.
    *        
    * @public
    */
    setDeviceInfo: function (deviceUuid) {
      var result = false;
      var devListRep = oAppDataModel.getDeviceListResponse();

      if (devListRep) {
        var device = devListRep.getDevice(deviceUuid);

        if (device) {
          oAppDataModel.setDevice(device);
          this.updateViewModel(device);
          this.queryParameterList(device);
          this.queryProcessDataList(device);

          result = true;
        }
      }

      return result;
    },

    /**
     * Query device information.
     * 
     * @param {string} deviceUuid the device uuid.
     *        
     * @public
     */
    queryDeviceInfo: function (deviceUuid) {

      var that = this;
      var url = oAppDataModel.getRequestUrl("/device/info") + '?deviceUuid=' + encodeURIComponent(deviceUuid);
      var sessionToken = oAppDataModel.getSessionToken();

      jQuery.ajax({
        url: url,
        type: "GET",
        cache: false,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        beforeSend: function (request) {
          request.setRequestHeader('sessionToken', sessionToken);
        },
        success: function (data) {
          //console.log(JSON.stringify(data));

          oAppDataModel.setDevice(data);
          that.updateViewModel(data);
          that.queryParameterList(data);
          that.queryProcessDataList(data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          that.showMessage(XMLHttpRequest, 'failedToGetInfo');
        }
      });
    },

    /**
     * Query parameter list from server.
     * @function
     * @param {object} device device object.
     * @private
     */
    queryParameterList: function(device) {
      var that = this;
      var uuid = device.uuid;
      var url = oAppDataModel.getRequestUrl("/device/parameter/list") + '?deviceUuid=' + encodeURIComponent(uuid);
      var sessionToken = oAppDataModel.getSessionToken();
    
      jQuery.ajax({
        url : url,
        type : "GET",
        dataType: "json",
        beforeSend: function (request) {
          request.setRequestHeader('sessionToken', sessionToken);
        },
        contentType : "application/json; charset=utf-8",
        success : function(data) {   
          if (data && data.packageList) {
            that.updateParameterList(data.packageList);
          }
          else {
            sap.m.MessageToast.show('Failed to parser the response of "/device/parameter/list"',
                                    MessageToastOption);
          }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          that.showMessage(XMLHttpRequest, 'failedToGetParameterList');
        }
      });
    },

    /**
     * Show remessage 
     * @function
     * @param {object} XMLHttpRequest XML Http request object.
     * @param {string} msgId The message id.
     * @private
     */
    showMessage: function (XMLHttpRequest, msgId) {

      var msg = oBundle.getText(msgId);

      if (XMLHttpRequest && XMLHttpRequest.responseJSON) {
        var res = XMLHttpRequest.responseJSON;

        if (res.message) {
          msg = msg + " " + res.message;
        }
      }

      sap.m.MessageToast.show(msg, MessageToastOption);
    },

    /**
     * update the view with specified parameters.
     * 
     * @param {string} params The device UUID.
     *        
     * @public
     */
    updateView: function (params) {

      if (params) {
        this.setDeviceUuid(params);
        this.updateViewModelByUuid(params);
      }

      return true;
    },

    /**
     * Event when the live info is changed.
     * @function
     * @public
     */
    onLiveInfoChanged: function () {
      var deviceUuid = this.getDeviceUuid();
      this.updateViewModelByUuid(deviceUuid);
    },
    /**
     * Event handler when menu button is pressed.
     * @public
     */
    openMenu: function (oEvent) {
      var oButton = oEvent.getSource();

      // create menu only once
      if (!this._menu) {
        this._menu = sap.ui.xmlfragment(
          "netIOT.pnDevice.DeviceInfo.DeviceInfo",
          this
        );
        this.getView().addDependent(this._menu);
      }

      var eDock = sap.ui.core.Popup.Dock;
      this._menu.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);
    },

    /**
     * Event handler  for navigating back to the caller app.
     * @public
     */
    goToCallerApp : function (evt) {
      openContainerApp();
    },
		/**
     * Event handler  for navigating back.
     * It checks if there is a history entry. If yes, history.go(-1) will happen.
     * If not, it will replace the current entry of the browser history with the worklist route.
     * Furthermore, it removes the defined binding context of the view by calling unbindElement().
     * @public
     */
    onNavBack : function (evt) {
      navToHome();
      //navBack();
      //if (this.router) {
      //  this.router.navBack(MobileAppIds.ID_DEVICE_LIST_PAGE);  
      //} 
    },

    /**
     * Go back to the home page.
     * 
     * @memberOf DeviceInfo
     */
    goToHomePage : function (evt) { 
      navToHome();

      //if (this.router) {
      //  this.router.navBack(MobileAppIds.ID_HOME_PAGE);  
      //}
    }, 
	  /**
     * Go back to the home page.
     * 
     * @memberOf DeviceInfo
     */
    goToLogin: function (evt) {
      updateView(MobileAppIds.LoginPageInfo.viewId);
      navTo(MobileAppIds.LoginPageInfo.pageId);
    },

	  /**
     * Go to the about page.
     * 
     * @memberOf DeviceInfo
     */
    showDeviceList: function (evt) {
      var isLogged = oAppDataModel.getLoginFlag();

      if (isLogged) {

        var that = this;
        var OnSuccess = function (data) {
          that.ShowDeviceListDialog(data);
        }

        this.queryDeviceList(OnSuccess);
      } else {
        this.showMessage(null, 'loginFirst');
      }
    },

	  /**
    * Go to the about page.
    * 
    * @memberOf DeviceInfo
    */
    ShowDeviceListDialog: function (data) {

      var m = sap.m;
      var that = this;
      var enableLoginButton = true;

      var listControl = sap.ui.xmlfragment(
        "netIOT.pnDevice.DeviceInfo.DeviceList",
        this
      );

      var deviceList = this.createDeviceList(data);

      var oData = {
        deviceList: deviceList
      };

      var oViewModel = new JSONModel(oData);

      var dialog = new m.Dialog({
        title: oBundle.getText('deviceList'),
        content: [
          listControl
        ],

        beginButton: new m.Button({
          text: oBundle.getText('ok'),
          enabled: enableLoginButton,
          press: function () {
            var item = listControl.getSelectedItem();

            if (item) {
              var context = item.getBindingContext();

              if (context) {
                var deviceUuid = context.getProperty("uuid");

                if (deviceUuid) {
                  var result = that.setDeviceInfo(deviceUuid);

                  if (result) {
                    dialog.close();
                  }
                }
              }
            }
          }
        }),

        endButton: new m.Button({
          text: oBundle.getText('close'),
          press: function () {
            dialog.close();
          }
        }),
        afterClose: function () {
          dialog.destroy();
        }
      });

      dialog.addStyleClass('deviceListDialog');
      dialog.setModel(oViewModel);

      var view = this.getView();

      if (view) {
        view.addDependent(dialog);
        dialog.open();
      }
    },

	  /**
     * Go to the about page.
     * 
     * @memberOf DeviceInfo
     */
    goToAbout: function (evt) {
      updateView(MobileAppIds.AboutPageInfo.viewId);
      navTo(MobileAppIds.AboutPageInfo.pageId);
    },

    /**
     * Event handler when a Profinet port item gets pressed
     * @param {sap.ui.base.Event} oEvent the table selectionChange event
     * @public
     */
    onPressProfinetPort: function (oEvent) {
      var oItem = oEvent.getSource();
        
      if(oItem) {
        var params = {
          deviceUuid: this.getDeviceUuid(),
          portUuid: oItem.getBindingContext().getProperty("uuid")
        }

        updateView(MobileAppIds.PortInfoPageInfo.viewId, params);
        navTo(MobileAppIds.PortInfoPageInfo.pageId);
      }
    },

	  /**
     * Event handler when a Profinet port item gets pressed
     * @param {sap.ui.base.Event} oEvent the table selectionChange event
     * @public
     */
    onPressIoLinkPort: function (oEvent) {
      // Same implementation as Profinet, change it later if necessary.
      this.onPressProfinetPort(oEvent);
    },

    /**
     * Event handler when a table item gets pressed
     * @param {sap.ui.base.Event} oEvent the table selectionChange event
     * @public
     */
    onPressParamter: function(oEvent) {
    
      var oContext = oEvent.getSource().getBindingContext();
      
      if(oContext) {
        
        var oItem = oContext.getProperty(oContext.sPath); 
        var oViewModel = this.getView().getModel();
        
        if(oViewModel && oItem) {
         
          var params = {
            deviceUuid: oViewModel.getProperty("/deviceUuid"),
            packageId: oItem.packageId,
            parameter: oItem.parameter
          };

          updateView(MobileAppIds.ParameterPageInfo.viewId, params);
          navTo(MobileAppIds.ParameterPageInfo.pageId);

          //var device = oAppDataModel.getDevice(deviceUuid);
          //var deviceIFUuid = this.getInterfaceUuid(device, 0);

          //if (deviceIFUuid) {
          //  var params = {
          //    deviceIFUuid: deviceIFUuid,
          //    semanticInfo: oItem.semanticInfo
          //  }

          //  updateView(MobileAppIds.ParameterPageInfo.viewId, params);
          //  navTo(MobileAppIds.ParameterPageInfo.pageId);
          
            // TODO
            //if (this.router) {
            //  oAppDataModel.currentParameter.deviceUuid = deviceUuid;
            //  oAppDataModel.currentParameter.semanticInfo = oItem.semanticInfo;
         
            //  this.router.navTo(MobileAppIds.ID_PARAMETER_PAGE, {
            //    uuid: deviceUuid
            //  }); 
            //}
         //}
        }
      }
    },

	  /**
     * Event handler when a table item gets pressed
     * @param {sap.ui.base.Event} oEvent the table selectionChange event
     * @public
     */
    onPressIoData: function (oEvent) {
      var oContext = oEvent.getSource().getBindingContext();
      
      if(oContext) {
        
        var oItem = oContext.getProperty(oContext.sPath); 
        var oViewModel = this.getView().getModel();
        
        if (oViewModel && oItem) {

          var params = {
            deviceUuid: oViewModel.getProperty("/deviceUuid"),
            packageId: oItem.packageId,
            processData: oItem.processData
          };

          updateView(MobileAppIds.ProcessDataPageInfo.viewId, params);
          navTo(MobileAppIds.ProcessDataPageInfo.pageId);
        }
      }
    },

    /** Get the status icon source by device status.
     * 
     * @param {status} status the device status.
     * @return {string} the icon source string.
     * 
     * @public
      */
    getIconInfo: function (status) {
      // Default status is inactive,.
      var info = {
        src: "sap-icon://status-negative",
        color: "#009DE0"
      };

      if (status === EnumSeverity.Warning) {
        info.src = "sap-icon://message-warning";
        info.color = "Neutral";
      }
      else if (status === EnumSeverity.Error) {
        info.src = "sap-icon://message-error";
        info.color = "Negative";
      }
      else if (status === EnumSeverity.OK) {
        info.src = "sap-icon://physical-activity";
        info.color = "Positive";
      }

      return info;
    },

	  /**
     * update the device list in view model.
     * 
     * @param {object} data the device list response.
     *        
     * @public
     */
    createDeviceList: function (data) {

      oAppDataModel.setDeviceListResponse(data);
      var deviceListResponse = oAppDataModel.getDeviceListResponse();

      var device, status;
      var deviceList = deviceListResponse.deviceList;
      var devices = [];
      var deviceName, ipAddresses, macAddress, ipList, iconInfo;
   
      for (var i = 0; i < deviceList.length; i++) {
        device = deviceList[i];

        if (device.hasOwnProperty('snmpGlobal')) {
          deviceName = device.snmpGlobal.snmpDeviceName;
        } else {
          deviceName = '';
        }

        if (this.isInactiveDevice(device)) {
          status = EnumSeverity.None;
        } else {
          status = deviceListResponse.getStatus(device.uuid);
        }

        var addresses = this.getIpAndMacAddress(device);

        ipAddresses = addresses.ipAddress;
        macAddress = addresses.macAddress;

        iconInfo = this.getIconInfo(status);

        var item = {
          status: status,
          uuid: device.uuid,
          deviceName: deviceName,
          ipAddress: ipAddresses,
          macAddress: macAddress,
          iconSrc: iconInfo.src,
          iconColor: iconInfo.color
        };

        devices.push(item);
      }

      return devices;
    },

    /** Get the interface IP addresses and MAC addresses in a device.
     * 
     * @param device  device object
     * 
     * @memberOf DeviceList
     */
    getIpAndMacAddress: function (device) {
      var ipAddress = '';
      var macAddress = '';

      if (device && device.interfaceList) {
        var item = null;

        for (var i = 0; i < device.interfaceList.length; i++) {

          item = device.interfaceList[i];

          if (item.hasOwnProperty("ipAddress")) {

            if (ipAddress && i > 0) {
              ipAddress = ipAddress + ", ";
            }

            ipAddress = ipAddress + item.ipAddress;
          }

          var arpIf = item.arpInterface;

          if (arpIf && arpIf.arpMacAddress) {

            if (macAddress && i > 0) {
              macAddress = macAddress + ", ";
            }

            macAddress = macAddress + arpIf.arpMacAddress;
          }
        }
      }

      return { ipAddress: ipAddress, macAddress: macAddress };
    },

	  /**
     * Check if a device is inactive.
     * @param {object} device the device object.
     * @return {boolean} true if device is inactive; false, otherwise.
     *
     * @private
     */
    isInactiveDevice: function (device) {
      var result = false;

      if (device && device.interfaceList) {
        var list = device.interfaceList;

        for (var i = 0; i < list.length; i++) {
          if (list[i].arpInterface) {
            if (list[i].arpInterface.dontAnswered) { //arpDontAnswered
              result = true;
              break;
            }
          }
        }
      }

      return result;
    }

	});

	return PageController;

});
