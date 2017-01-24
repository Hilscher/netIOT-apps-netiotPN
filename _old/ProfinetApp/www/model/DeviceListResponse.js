/**
 * Copyright (c) 2016 Hilscher Gesellschaft fuer Systemautomation mbH
 *
 * Licensed under the MIT License, - see MITLicense.txt.
 *
 * Define a for device list response.
 */

"use strict";

/**
 * @constructor DeviceListResponse
 * A class represents mobile application data model. 
 *
 */
function DeviceListResponse() {

  if (!(this instanceof DeviceListResponse)) {
    throw new SyntaxError('Constructor must be called with the new operator!');
  }

  this.callReference = "";
  this.index = 0;
  this.totalCount = 0;
  this.startTime = "";
  this.startTimeStruct = null;
  this.scanDuration = 0;
  this.state = 0;
  this.deviceList = null;

  // status set for device, interface, port etc.
  this.statusDictionary = {};
}

/** Set data.
 *
 * @param {object} data The saved data.
 *
 */
DeviceListResponse.prototype.setData = function (data) {

  if (!data) {
    return;
  }

  if (data.hasOwnProperty("callReference")) {
    this.callReference = data.callReference;
  }

  if (data.hasOwnProperty("index")) {
    this.index = data.index;
  } else {
    this.index = 0;
  }

  if (data.hasOwnProperty("totalCount")) {
    this.totalCount = data.totalCount;
  } else {
    this.totalCount = 0;
  }

  if (data.hasOwnProperty("startTime")) {
    this.startTime = data.startTime;
    this.startTimeStruct = convertDateToTimeStruct(data.startTime);
  } else {
    this.startTime = '';
    this.startTimeStruct = null;
  }

  if (data.hasOwnProperty("scanDuration")) {
    this.scanDuration = data.scanDuration;
  }

  if (data.hasOwnProperty("state")) {
    this.state = data.state;
  }

  if (data.hasOwnProperty("deviceList")) {
    this.deviceList = data.deviceList;
  }

  this.statusDictionary = {};
}

/**
 * @return {string} The start time in the last device list response. 
 */
DeviceListResponse.prototype.hasData = function () {

  if (this.deviceList != null) {
    return true;
  }

  return false;
}

/**
 * @return {string} The start time in the last device list response. 
 */
DeviceListResponse.prototype.getStartTime = function () {

  if (this.hasData()) {
    return this.startTime;
  }

  return "0";
}

/**
 * @return {string} The start time in the last device list response. 
 */
DeviceListResponse.prototype.getStartTimeStruct = function () {
  return this.startTimeStruct;
}


/**
 * @return {object} The device list. 
 */
DeviceListResponse.prototype.getDeviceList = function () {
  return this.deviceList;
}

/**
 * Get device by uuid.
 *
 * @param {string} uuid The device uuid.
 * 
 * @return {object} The device object. 
 */
DeviceListResponse.prototype.getDevice = function (deviceUuid) {

  var result = null;

  if (deviceUuid && this.deviceList) {
    var device = null;

    for (var i = 0; i < this.deviceList.length; i++) {

      device = this.deviceList[i];

      if (device && device.hasOwnProperty('uuid')) {
        if (device.uuid == deviceUuid) {
          result = device;
          break;
        }
      }
    }
  }

  return result;
}

/**
 * Get device by uuid of any item.
 *
 * @param {string} uuid The uuid of device, interface or port.
 * 
 * @return {object} The device object. 
 */
DeviceListResponse.prototype.getDeviceByAnyUuid = function (uuid) {

  if (!uuid || !this.deviceList) {
    return null;
  }

  var result = null;
  var device, devIF, port;

  for (var i = 0; i < this.deviceList.length; i++) {
    device = this.deviceList[i];

    if (!device) {
      continue;
    }

    if (device.hasOwnProperty('uuid') &&
      device.uuid == uuid) {
      result = device;
      break;
    }

    if (device.interfaceList) {
      var ifCount = device.interfaceList.length;

      for (var j = 0; j < ifCount; j++) {
        devIF = device.interfaceList[j];

        if (devIF.hasOwnProperty('uuid') && devIF.uuid == uuid) {
          result = device;
          break;
        }

        port = this.getPortInInterface(devIF, uuid);

        if (port) {
          result = device;
          break;
        }
      }
    }

    if (result) {
      break;
    }
  }

  return result;
}

/*
 * Get interface by uuid.
 *
 * @param {string} uuid The interface uuid.
 * 
 * @return {object} The interface object. 
 */
DeviceListResponse.prototype.getInterface = function (uuid) {

  var result = null;

  if (uuid && this.deviceList) {
    var device = null;
    var devIF = null;

    for (var i = 0; i < this.deviceList.length; i++) {

      device = this.deviceList[i];

      if (device && device.interfaceList) {

        for (var j = 0; j < device.interfaceList.length; j++) {

          devIF = device.interfaceList[j];

          if (devIF.hasOwnProperty('uuid')) {

            if (devIF.uuid == uuid) {
              result = devIF;
              break;
            }
          }
        }
      }

      if (result) {
        break;
      }
    }
  }

  return result;
}

/*
 * Get interface by uuid.
 *
 * @param {string} portUuid The port uuid.
 * 
 * @return {object} The port and its ancestor objects. 
 */
DeviceListResponse.prototype.getPortAndAncestor = function (portUuid) {

  var result = null;

  if (portUuid && this.deviceList) {

    for (var i = 0; i < this.deviceList.length; i++) {

      result = this.getPortAndAncestorInDevice(this.deviceList[i], portUuid);

      if (result) {
        break;
      }
    }
  }

  return result;
}

/*
 * Get interface by uuid.
 *
 * @param {string} uuid The interface uuid.
 * 
 * @return {object} The port object. 
 */
DeviceListResponse.prototype.getPort = function (uuid) {

  var info = this.getPortAndAncestor(uuid);

  if (info && info.port) {
    return info.port;
  }

  return null;
}

/*
 * Get interface by uuid.
 *
 * @param {string} portUuid The port uuid.
 * 
 * @return {object} The port and its ancestor objects. 
 */
DeviceListResponse.prototype.getPortAndAncestorInDevice = function (device, portUuid) {

  var result = null;

  if (portUuid && device && device.interfaceList) {
    var port = null;

    for (var j = 0; j < device.interfaceList.length; j++) {

      port = this.getPortInInterface(device.interfaceList[j], portUuid);

      if (port) {

        result = {
          device: device,
          deviceInterface: device.interfaceList[j],
          port: port
        };
        break;
      }
    }
  }

  return result;
}

/*
 * Get port in interface.
 *
 * @param {object} devIF The device interface object.
 * @param {string} portUuid The port uuid.
 * 
 * @return {object} The port object. 
 */
DeviceListResponse.prototype.getPortInInterface = function (devIF, portUuid) {

  var result = null;

  if (portUuid && devIF && devIF.portList) {
    var port = null;

    for (var k = 0; k < devIF.portList.length; k++) {

      port = devIF.portList[k];

      if (port.hasOwnProperty('uuid')) {
        if (port.uuid == portUuid) {
          result = port;
          break;
        }
      }
    }
  }

  return result;
}

/*
 * Add status list for the device list.
 *
 * @param {object} statusListResponse The status response.
 */
DeviceListResponse.prototype.addStatusListResponse = function (statusListResponse) {

  if (!this.hasData() || !statusListResponse || !(statusListResponse.networkStatusList)) {
    return;
  }

  var compareResult = 0;
  var statusItem, message, deviceStatus, statusTimeStruct;
  var list = statusListResponse.networkStatusList;

  for (var i = list.length - 1; i >= 0; i--) {
    statusItem = list[i];
    statusTimeStruct = convertDateToTimeStruct(statusItem.timestamp);
    compareResult = compareTimestruct(statusTimeStruct, this.startTimeStruct);

    if (compareResult <= 0) {
      break; // The status time is older than last scan time.
    }

    if (statusItem.messageList) {
      for (var j = 0; j < statusItem.messageList.length; j++) {
        message = statusItem.messageList[j];

        if (message && message.source == "device") {
          // If source is device, the message uuid is device uuid.

          if (message.uuid && message.severity) {
            var changeSeverity = true;
            var serverity = EnumSeverity.convertSeverity(message.severity);

            if (this.statusDictionary.hasOwnProperty(message.uuid)) {

              var deviceStatus = this.statusDictionary[message.uuid];

              compareResult = compareTimestruct(statusItem.timeStruct, deviceStatus.timeStruct);

              if (compareResult < 0) {
                // Do not change severity if the timestamp in status item is older than the saved one.
                changeSeverity = false;
              } else {

                if (compareResult == 0) {
                  if (deviceStatus.severity >= serverity) {
                    // Same timestamp, use the highest severity.
                    changeSeverity = false;
                  }
                }
              }
            }

            if (changeSeverity) {
              this.statusDictionary[message.uuid] = {
                timestamp: statusItem.timestamp,
                timeStruct: statusTimeStruct,
                serverity: serverity
              };

            }
          }
        }
      }
    }
  }
}

/*
 * Get item status. The item may be a device, interface, port etc.
 *
 * @param {string} uuid The item uuid.
 */
DeviceListResponse.prototype.setStatus = function (uuid, status) {

  if (status > EnumSeverity.OK) {
    if (this.statusDictionary.hasOwnProperty(uuid)) {
      var oldStatus = this.statusDictionary[uuid].serverity;

      if (status > oldStatus) {
        this.statusDictionary[uuid].serverity = status;
      }
    } else {
      // TODO: The use correct timestamp.
      this.statusDictionary[uuid] = {
        timestamp: this.startTime,
        timeStruct: this.startTimeStruct,
        serverity: status
      };
    }
  }
}

/*
 * Get item status. The item may be a device, interface, port etc.
 *
 * @param {string} uuid The item uuid.
 */
DeviceListResponse.prototype.getStatus = function (uuid) {
  var status = EnumSeverity.OK;

  if (this.statusDictionary.hasOwnProperty(uuid)) {
    status = this.statusDictionary[uuid].serverity;
  }

  return status;
}
