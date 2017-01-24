/**
 * Copyright (c) 2016 Hilscher Gesellschaft fuer Systemautomation mbH
 *
 * Licensed under the MIT License, - see MITLicense.txt.
 *
 * The mobile application data model.
 */

"use strict";

/**
 * @constructor AppDataModel
 * A class represents mobile application data model. 
 *
 */
function AppDataModel() {

  if (!(this instanceof AppDataModel)) {
    throw new SyntaxError('Constructor must be called with the new operator!');
  }

  this.loginFlag = false;
  this.sessionToken = "";

  this.loginManager = new LoginManager();
  this.apiPath = SERVER_API_PATH;

  this.updateInterval = 5000; // ms

  this.deviceListResponse = new DeviceListResponse();
  this.statusList = [];
  this.device = null;

  this.currentParameter = {
    deviceUuid: "",
    semanticInfo: null
  };
}

/** Get login flag.
 *
 * @return {boolean} The session token.
 */
AppDataModel.prototype.getLoginFlag = function () {
  return this.loginFlag;
}

/** Set login flag.
 *
 * @param {boolean} flag The login flag.
 *                  true, if it is already logged in; false, otherwise.
 * 
 */
AppDataModel.prototype.setLoginFlag = function (flag) {

  if (flag) {
    this.loginFlag = true;
  }
  else {
    this.loginFlag = false;
  }
}

/** Get session token.
 *
 * @return {string} The session token.
 */
AppDataModel.prototype.getSessionToken = function () {
  return this.sessionToken;
}

/** Set session token.
 *
 * @param {string} token The sessionToken.
 * 
 */
AppDataModel.prototype.setSessionToken = function (token) {

  if (token) {
    this.sessionToken = token;
  }
  else {
    this.sessionToken = "";
  }
}

/** Get the server Url.
 * @return {string} The server Url. 
 */
AppDataModel.prototype.getServerUrl = function () {

  var serverUrl = "";
  var serverInfo = this.loginManager.getSelectedServerInfo();

  if (serverInfo != null) {
    serverUrl = serverInfo.serverUrl;
  }

  return serverUrl;
}

/** get full request Url.
 * @param {string} relativeUrl The relative Url.
 * @param {string} serverUrl The server Url.
 * 
 * @return {string} The full request Url. 
 */
AppDataModel.prototype.getRequestUrl = function (relativeUrl, serverUrl) {
  var url = serverUrl ? serverUrl : this.getServerUrl();
  var hasSlash = url.endsWith("/");

  if (!hasSlash) {
    url = url + "/";
  }

  return url + this.apiPath + relativeUrl;
}

/** Get the update interval.
 * @return {number} The update interval. 
 */
AppDataModel.prototype.getUpdateInterval = function () {
  return this.updateInterval;
}

/** set device.
 * @param {object} device The device.
 */
AppDataModel.prototype.setDevice = function (device) {
  this.device = device;
}

/**
 * @return {object} The device. 
 */
AppDataModel.prototype.getDevice = function () {
  return this.device;
}

/**
 * @return {object} The device list response. 
 */
AppDataModel.prototype.getDeviceListResponse = function () {
  return this.deviceListResponse;
}

/** Set device list response.
 * @param {object} res The device list response. 
 */
AppDataModel.prototype.setDeviceListResponse = function (res) {

  if (res) {

    if (this.deviceListResponse.hasData() == false) {
      this.deviceListResponse.setData(res);
    }
    else if (res.startTime) {
      var newTimeStruct = convertDateToTimeStruct(res.startTime);
      var currentTimeStruct = this.deviceListResponse.getStartTimeStruct();

      if (compareTimestruct(newTimeStruct, currentTimeStruct) > 0) {
        this.deviceListResponse.setData(res);
      }
    }
  }
}

/**
 * @return {object} The device list response. 
 */
AppDataModel.prototype.getStatusList = function () {
  return this.statusList;
}

/** Add status list response.
 * @param {object} res The status list response.
 */
AppDataModel.prototype.addStatusListResponse = function (res) {

  if (res.networkStatusList) {
    // TODO: Merge data
    this.statusList = res.networkStatusList;
    this.deviceListResponse.addStatusListResponse(res);
  }
}

/**
 * @param {string} The old start time. 
 *
 * @return {boolean} true, if there is a new device list response;
 *                   false, otherwise.
 */
AppDataModel.prototype.hasNewDeviceList = function (oldStartTime) {
  var result = false;

  if (this.deviceListResponse.hasData()) {
    var currentTime = Number(this.deviceListResponse.getStartTime());
    var oldTime = Number(oldStartTime);

    if (currentTime > oldTime) {
      result = true;
    }
  }

  return result;
}

/** Save the data model.
 *
 */
AppDataModel.prototype.save = function () {
  var result = this.saveLoginManager();
  return result;
}

/** Load the data model.
 *
 */
AppDataModel.prototype.load = function () {
  
  this.loadLoginManager();

  return true;
}

/** Save login manager.
 *
 */
AppDataModel.prototype.saveLoginManager = function () {

  var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

  // Save loginManager
  var data = this.loginManager.getData();
  var result = oStorage.put("loginManager", JSON.stringify(data));

  return result;
}

/** Load login manager.
 *
 */
AppDataModel.prototype.loadLoginManager = function () {
  var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);

  // Load loginManager
  var text = oStorage.get("loginManager");
  var data = JSON.parse(text);

  this.loginManager.setData(data);

  return true;
}

/** Read manifest json file.
 *
 */
AppDataModel.prototype.readManifest = function (manifest) {

  if (manifest) {

    if (manifest.hasOwnProperty("updateInterval")) {

      var minInterval = 2000; // Minimal interval is 2000 ms.

      if (manifest.updateInterval >= minInterval) {
        this.updateInterval = manifest.updateInterval;
      }
      else {
        this.updateInterval = minInterval;
      }
    }
  }

  return true;
}

