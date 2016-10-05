/**
 * Copyright (c) 2016 Hilscher Gesellschaft fuer Systemautomation mbH
 *
 * Licensed under the MIT License, - see MITLicense.txt.
 *
 * A class manages the login settings.
 */

"use strict";

/**
 * @constructor LoginManager
 * A class represents mobile application data model. 
 *
 */ 
function LoginManager() {
  
  if (!(this instanceof LoginManager)) {
    throw new SyntaxError('Constructor must be called with the new operator!');
  }

  this.selectedServerId = -1;
  this.serverInfoList = [];
}

/** Invalid server info Id.
 * 
 */
LoginManager.INVAID_SERVER_ID = -1;

/** Get selected server id.
 *
 * @return {object} The selected server id.
 */
LoginManager.prototype.getSelectedServerId = function () {
  return this.selectedServerId;
}

/** Set selected server id.
 *
 * @param {number} id The selected server id.
 * 
 */
LoginManager.prototype.setSelectedServerId = function (id) {
  this.selectedServerId = id;
}

/** Get selected server id.
 *
 * @return {object} The selected server id.
 */
LoginManager.prototype.getSelectedServerInfo = function () {
  return this.getServerInfo(this.selectedServerId);
}

/** Get server info object by index.
 * @param {number} index The index of server info in list.
 *
 * @return {object} The server info if index is valid; null, otherwise.
 */     
LoginManager.prototype.getServerInfo = function (id) {
  
  for (var i = 0; i < this.serverInfoList.length; i++) {

    if (this.serverInfoList[i].serverId == id) {
      return this.serverInfoList[i];
    }
  }

  return null;
}

/** Get server info object by index.
 * @param {string} serverUrl The server url.
 *
 * @return {object} The server info if corresponding url is found; null, otherwise.
 */
LoginManager.prototype.getServerInfoByUrl = function (serverUrl) {

  for (var i = 0; i < this.serverInfoList.length; i++) {

    if (this.serverInfoList[i].serverUrl == serverUrl) {
      return this.serverInfoList[i];
    }
  }

  return null;
}

/** Add a server info object.
 * @param {object} info The server info object.
 * @param {boolean} select A flag indicating whether to use the newly created server.
 *
 * @return {boolean} true if server info object is successsfully created; false, otherwise.
 */
LoginManager.prototype.createServerInfo = function (info, select) {
  var result = false;

  if (info) {
    var id = this.createNewId();
    var newInfo = {
      serverId: id,
      serverName: info.serverName ? info.serverName : "",
      serverUrl: info.serverUrl ? info.serverUrl.trim() : "",
      userName: info.userName ? info.userName : "",
      password: info.password ? info.password : ""
    };

    this.serverInfoList.push(newInfo);

    if (select) {
      this.setSelectedServerId(id);
    }

    result = true;
  }

  return result;
}

/** Update a server info object.
 * @param {object} serverInfo The server info object.
 *
 * @return {boolean} true if server info object is successsfully added; false, otherwise.
 */
LoginManager.prototype.updateServerInfo = function (info) {
  var result = false;
  var item = null;

  if (info.hasOwnProperty("serverId")) {
    for (var i = 0; i < this.serverInfoList.length; i++) {

      if (this.serverInfoList[i].serverId == info.serverId) {
        item = this.serverInfoList[i];
        break;
      }
    }
  }

  if (item) {

    if (info.hasOwnProperty("serverName")) {
      item.serverName = info.serverName;
    }
    if (info.hasOwnProperty("serverUrl")) {
      item.serverUrl = info.serverUrl;
    }
    if (info.hasOwnProperty("userName")) {
      item.userName = info.userName;
    }
    if (info.hasOwnProperty("password")) {
      item.password = info.password;
    }

    result = true;
  }

  return result;
}

/** Delete server info .
 *
 * @param {object} ids The id of a server info or the ids of a server info list.
 *
 * @return {boolean} true if server infos are successsfully deleted; false, otherwise.
 */
LoginManager.prototype.deleteServerInfo = function (ids) {
  var result = false;
   
  // TODO:
  for (var i = 0; i < ids.length; i++) {

    for (var j = 0; j < this.serverInfoList.length; j++) {

      if (this.serverInfoList[j].serverId == ids[i]) {
        this.serverInfoList.splice(j, 1);
        result = true;
        break;
      }
    }
  }

  return result;
}

/** Add a server info object.
 * @param {object} serverInfo The server info object.
 *
 * @return {boolean} true if server info object is successsfully added; false, otherwise.
 */
LoginManager.prototype.createNewId = function () {
  var id = -1;
  var found = false;

  do {
    id++;
    found = true;

    for (var i = 0; i < this.serverInfoList.length; i++) {

      if (this.serverInfoList[i].serverId == id) {
        found = false;
        break;
      }
    }
  } while (!found);

  return id;
}

/** Get the data to be saved.
 *
 * @return {object} The internal data to be saved.
 *
 */
LoginManager.prototype.getData = function () {

  return {
    selectedServerId: this.selectedServerId,
    serverInfoList: this.serverInfoList
  };
}

/** Set data.
 *
 * @param {object} data The saved data.
 *
 */
LoginManager.prototype.setData = function (data) {

  if (data) {

    if (data.hasOwnProperty("selectedServerId")) {
      this.selectedServerId = data.selectedServerId;
    }

    if (data.hasOwnProperty("serverInfoList")) {
      this.serverInfoList = data.serverInfoList;
    }
  }
}

