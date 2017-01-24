/**
 * Copyright (c) 2016 Hilscher Gesellschaft fuer Systemautomation mbH
 *
 * Licensed under the MIT License, - see MITLicense.txt.
 *
 * Define the global functions and flags.
 */

"use strict";

//Debug flags
var isDebugMode = false;
//isDebugMode = true;

var SERVER_API_PATH = "netIOTEdgeServer/API/v1";

var ContainerAppScheme = 'netIOT://com.hilscher.netiot';
var isLoginDialogOpened = false;

//Global variables
var currentVersion = "0.9.0";

var sLocale = "en"; //sap.ui.getCore().getConfiguration().getLanguage();

var oBundle = jQuery.sap.resources({
  url: "i18n/i18n.properties",
  locale : sLocale
});


var BusProtocols = {
  Ethernet: 'ethernet',
  IOLink: 'iolink',
  Profinet: 'profinet',
  Unknown: 'unknown'
}

/**
 * The options for sap.m.MessageToast contructor.
 */
var MessageToastOption = {
  duration: 3000,
  width: '60%',
  offset: '0 -100',
  at: 'center center'
};

var EnumSeverity = {
  None: -1,
  OK: 0,
  Warning: 1,
  Error: 2,

  /*
   * convert severity string to value.
   * 
   * @param topoObject  a topology object.
   */
  convertSeverity: function (severityText) {

    var severity = this.None;
    var upperCaseText = severityText.toUpperCase();

    if (upperCaseText === 'OK' || upperCaseText === 'INFO') {
      severity = this.OK;
    }
    else if (upperCaseText === 'WARNING') {
      severity = this.Warning;
    }
    else if (upperCaseText === 'ERROR') {
      severity = this.Error;
    }

    return severity;
  }
};


/**
 * Open netIO container App
 *@return {object} the handle of opened app.
 */
function openContainerApp() {
  return openApp(ContainerAppScheme);
}

/**
 * Open App with a specific URL.
 *@return {object} the handle of opened app.
 */
function openApp(url) {
  var ref = null;
  if (cordova && cordova.InAppBrowser) {
    ref = cordova.InAppBrowser.open(url, '_system');
  }
  return ref;
}

/**
 * Show device info
 */
function showDeviceInfo(deviceUuid) {
  updateView(MobileAppIds.DeviceInfoPageInfo.viewId, deviceUuid);
  navTo(MobileAppIds.DeviceInfoPageInfo.pageId);
}

/**
 * Show device info
 */
function resetDeviceInfo() {
  var controller = getControllerInView(MobileAppIds.DeviceInfoPageInfo.viewId);

  if (controller && controller.resetViewModel) {
    controller.resetViewModel();
  }
}

/**
 * handleUrlFromOtherApp.
 */
function handleUrlFromOtherApp(url) {
  var data = decodeUrl(url);
  var isLogged = oAppDataModel.getLoginFlag();
  var loginAgain = true;
  var loginMgr = oAppDataModel.loginManager;
  var serverUrl = data.schema + '://' + data.host;

  if (data.port) {
    serverUrl += ':' + data.port;
  }

  if (isLogged) {
    var oldServer = loginMgr.getSelectedServerInfo();

    if (oldServer.serverUrl === serverUrl) {
      loginAgain = false;
    }
  }

  if (loginAgain) {
    if (!isLoginDialogOpened) {
      isLoginDialogOpened = true;
      showLoginDialog(data, serverUrl);
    } 
  } else {
    showDeviceInfo(data.deviceUuid);
  }
}

/** Login with the specific data.
 *@param {string} serverUrl server Url.
 *@param {string} userName user name.
 *@param {string} password login password.
 *@param {object} callback callback function.
 */
function login(serverUrl, userName, password, callbackOnSucceed) {
    
  var url = oAppDataModel.getRequestUrl("/user/login", serverUrl);
  //var encodedPassword = btoa(password);

  jQuery.ajax({
    url: url,
    type: "POST",
    dataType: "json",
    data: JSON.stringify({
      "deviceId": "TODO",
      "appId": "TODO",
      "username": userName,
      "password": password
    }),
    contentType: "application/json; charset=utf-8",
    success: function (data) {
      //console.log(JSON.stringify(data));
         
      if (data && data.hasOwnProperty("sessionToken")) {
        callbackOnSucceed(data.sessionToken);
      } else {
        sap.m.MessageToast.show('No sessionToken in response!', MessageToastOption);
      }
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {

      var msg = oBundle.getText("failedToLogin");

      if (XMLHttpRequest && XMLHttpRequest.responseJSON) {
        var res = XMLHttpRequest.responseJSON;

        if (res.message) {
          msg = msg + " " + res.message;
        }
      }

      sap.m.MessageToast.show(msg, MessageToastOption);
    }
  });

}


/**
 * Show login dialog.
 *@param {object} data The data from other app.
 *@param {string} serverUrl The server Url.
 */
function showLoginDialog(data, serverUrl) {

  var m = sap.m;
  var colon = ':';
  var list = new m.List();

  var inputServerName = null;
  var inputUserName = null;
  var inputPassword = null;
  var loginButtonId = 'idLoginDlgLoginBtn';

  var validateFunc = function validate(oEvent) {
    //var parent = oEvent.getSource().getParent();
    var button = sap.ui.getCore().byId(loginButtonId);

    if (button) {

      var serverName = inputServerName.getValue();  
      var userName = inputUserName.getValue();
      var password = inputPassword.getValue();
      var isValid = false;

      if (serverName.length > 0 && userName.length > 0 &&
          password.length > 0) {
        isValid = true;
      }

      button.setEnabled(isValid);
    }
  };

  // Server Name
  inputServerName = new m.Input(
    {
     liveChange: validateFunc
    }
  );

  var inputItemServerName = new m.InputListItem({
    label: oBundle.getText('serverName') + colon,
    content: [inputServerName]
  });

  list.addItem(inputItemServerName);

  // Server URL
  var lableServerUrl = new m.Label({ text: serverUrl });

  var inputItemServerUrl = new m.InputListItem({
    label: oBundle.getText('serverUrl') + colon,
    content: [lableServerUrl]
  });

  list.addItem(inputItemServerUrl);

  // User Name
  inputUserName = new m.Input(
    {
      liveChange: validateFunc
    }
  );

  var inputItemUserName = new m.InputListItem({
    label: oBundle.getText('userName') + colon,
    content: [inputUserName]
  });

  list.addItem(inputItemUserName);

  // Password
  inputPassword = new m.Input(
    {
      type: m.InputType.Password,
      liveChange: validateFunc
    }
  ); 

  var inputItemPassword = new m.InputListItem({
    label: oBundle.getText('password') + colon,
    content: [inputPassword]
  });

  list.addItem(inputItemPassword);

  // Keep space to the buttons
  list.addStyleClass('sapUiLargeMarginBottom');

  var dialog = null;
  var deviceUuid = data.deviceUuid;
  var enableLoginButton = false;
  var loginMgr = oAppDataModel.loginManager;
  var oldServerInfo = loginMgr.getServerInfoByUrl(serverUrl);
  
  if (oldServerInfo) {
    enableLoginButton = true;
    inputServerName.setValue(oldServerInfo.serverName);
    inputUserName.setValue(oldServerInfo.userName);
    inputPassword.setValue(oldServerInfo.password);
  } else {
    inputServerName.setValue(data.host);
  }

  var callbackOnSucceed = function (sessionToken) {

    if (dialog) {

      var info = {
        serverId: LoginManager.INVAID_SERVER_ID,
        serverName: inputServerName.getValue(),
        serverUrl: serverUrl,
        userName: inputUserName.getValue(),
        password: inputPassword.getValue()
      };

      if (oldServerInfo) {
        info.serverId = oldServerInfo.serverId;
        var result = loginMgr.updateServerInfo(info);

        if (result) {
          loginMgr.setSelectedServerId(oldServerInfo.serverId);
        }
      } else {
        loginMgr.createServerInfo(info, true);
      }
      
      oAppDataModel.saveLoginManager();
      oAppDataModel.setLoginFlag(true);
      oAppDataModel.setSessionToken(sessionToken);

      updateLoginFlaginView(true);

      showDeviceInfo(deviceUuid);

      dialog.close();

      var msg = oBundle.getText('succeededToLogin');
      var option = JSON.parse(JSON.stringify(MessageToastOption));
      option.duration = 1000; // 1000 ms

      sap.m.MessageToast.show(msg, option);
    }
  };

  dialog = new m.Dialog({
    title: oBundle.getText('login'),
    content: [
      list
    ],

    beginButton: new m.Button(loginButtonId, {
      text: oBundle.getText('login'),
      enabled: enableLoginButton,
      press: function () {
        var button = sap.ui.getCore().byId(loginButtonId);

        if (button) {
          button.setEnabled(false);
        }

        var userName = inputUserName.getValue();
        var password = inputPassword.getValue();

        login(serverUrl, userName, password, callbackOnSucceed);
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
      isLoginDialogOpened = false;
    }
  });

  var view = getCurrentView();

  if (view) {
    view.addDependent(dialog);
    dialog.open();
  }
}

/**
 * Get the view object in current page.
 */
function getCurrentView() {
  var view = null;
  var app = getApp();

  if (app) {
    var page = app.getCurrentPage();

    if (page) {
      var content = page.getContent();

      if (content && content[0]) {
        view = content[0];
      }
    }
  }

  return view;
}

/**
 * update the login flag in login view/page.
 * 
 * @param {boolean} isLogged The login flag.
 *        
 * @public
 */
function updateLoginFlaginView(isLogged) {  
  var view = sap.ui.getCore().byId(MobileAppIds.LoginPageInfo.viewId);

  if (view) {
    var controller = view.getController();

    if (controller && controller.setLoginFlag) {
      controller.setLoginFlag(isLogged);
    }
  }
}

/**
 * Create indices for ports.
 * @param {Array<object>} deviceList A list of devices.
 * @param {object} portIndices The port indices.
 * 
 */
function createPortIndices(deviceList, portIndices) {

  if (portIndices === null || deviceList === null) {
    return;
  }

  var deviceCount = deviceList.length;
  var device = null;
  var devIF = null;
  var portLoad = 0;

  for (var m = 0; m < deviceCount; m++) {
    device = deviceList[m];

    if (device == null || device.hasOwnProperty('interfaceList') == false) {
      continue;
    }

    for (var i = 0; i < device.interfaceList.length; i++) {

      devIF = device.interfaceList[i];

      if (devIF.hasOwnProperty('portList') == false) {
        continue;
      }

      for (var j = 0; j < devIF.portList.length; j++) {

        var port = devIF.portList[j];

        if (port.hasOwnProperty('uuid')) {

          if (port.hasOwnProperty('inLoad')) {
            portLoad += port.inLoad;
          }

          if (port.hasOwnProperty('outLoad')) {
            portLoad += port.outLoad;
          }

          var item = {
            port: port,
            deviceId: m,
            blockIndex: i,
            portIndex: j,
            portLoad: portLoad
          };

          portIndices[port.uuid] = item;
        }
      }
    }
  }
}

/*
 * Get the neighbor node information.
 *
 * @param {object} portIndices  The port indices.
 * @param {string} fromPortUuid  The uuid of start port.
 * @param {string} toPortUuid  The uuid of end port.
 *  
 * @return {object} the information of neighbor.
 *
 */
function getNeighborInfo(portIndices, fromPortUuid, toPortUuid) {

  var toDeviceId = -1;
  var toBlockIndex = -1;
  var toPortIndex = -1;
  var toPortLoad = 0;
  var hasReferenceInNeightbor = false;

  if (portIndices && portIndices.hasOwnProperty(toPortUuid)) {

    var toPortInfo = portIndices[toPortUuid];

    toDeviceId = toPortInfo.deviceId;
    toBlockIndex = toPortInfo.blockIndex;
    toPortIndex = toPortInfo.portIndex;
    toPortLoad = toPortInfo.portLoad;

    var toPort = toPortInfo.port;

    if (toPort.hasOwnProperty("neighborList")) {

      var index = -1;

      for (var k = 0; k < toPort.neighborList.length; k++) {

        var neighborPort = toPort.neighborList[k];

        if (neighborPort && neighborPort.uuid == fromPortUuid) {
          hasReferenceInNeightbor = true;
          break;
        }
      }
    }
  }

  return {
    toDeviceId: toDeviceId,
    toBlockIndex: toBlockIndex,
    toPortIndex: toPortIndex,
    toPortLoad: toPortLoad,
    hasReferenceInNeightbor: hasReferenceInNeightbor
  };
}

/**
 * Get the supported protocol for the specified device.
 * @param {object} device The device object.
 * @return {string} The name of supported protocol.
 */
function getSupportedProtocol(device) {
  var protocol = BusProtocols.Unknown;

  if (device && device.supportedProtocolList) {
    var hasArp = false;
    var hasRcp = false;
    var hasSnmp = false;
    var hasIolink = false;

    var list = device.supportedProtocolList;

    for (var i = 0; i < list.length; i++) {
      var item = list[i];

      if (item.enabled) {
        if (item.protocol === 'arp') {
          hasArp = true;
        } else if (item.protocol === 'rpc') {
          hasRcp = true;
        } else if (item.protocol === 'snmp') {
          hasSnmp = true;
        } else if (item.protocol === 'iol') {
          hasIolink = true;
        }
      }
    }

    if (hasArp && hasSnmp) {
      if (hasRcp) {
        protocol = BusProtocols.Profinet;
      } else {
        protocol = BusProtocols.Ethernet;
      }
    } else if (hasIolink) {
      protocol = BusProtocols.IOLink;
    }
  }

  return protocol;
}

