/**
 * Copyright (c) 2016 Hilscher Gesellschaft fuer Systemautomation mbH
 *
 * Licensed under the MIT License, - see MITLicense.txt.
 *
 * The controller for page Login.
 */

sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"sap/ui/core/routing/History",
    "sap/ui/model/resource/ResourceModel"
], function (jQuery, Controller, JSONModel, History, ResourceModel) {
  "use strict";

  var PageController = Controller.extend("netIOT.pnDevice.Login.Login", {

    onInit: function (oEvent) {

      this.initRouter();
      this.initViewModel();
    },

    /**
     * Initialize the router.
     *       
     * @public
     */
    initRouter: function () {

      this.router = sap.ui.core.UIComponent.getRouterFor(this);

      if (this.router) {
        var route = this.router.getRoute("LoginPage");

        if (route) {
          route.attachPatternMatched(this.onObjectMatched, this);
        }
      }
    },

    /**
     * Initialize the view model.
     *       
     * @public
     */
    initViewModel: function () {

      var oData = {
        isLogged: false,
        loginButtonText: oBundle.getText('login'),
        selectedServerId: -1,
        selectedServerName: "",
        serverList: []
      };

      var oViewModel = new JSONModel(oData);
      this.getView().setModel(oViewModel);

      // set i18n model on view
      var i18nModel = new ResourceModel({
        bundleUrl: "i18n/i18n.properties"
      });

      if (i18nModel) {
        this.getView().setModel(i18nModel, "i18n");
      }
    },

    /**
     * Set property to view model.
     * 
     * @param {string} path The property path.
     * @param {object} data The property data.
     * 
     * @public
     */
    setProperty: function (path, data) {

      var oViewModel = this.getView().getModel();

      if (oViewModel) {
        oViewModel.setProperty(path, data);
      }
    },

    /**
     * Get property from view model.
     * 
     * @public
     */
    getProperty: function (path) {

      var oViewModel = this.getView().getModel();

      if (oViewModel) {
        return oViewModel.getProperty(path);
      }

      return null;
    },

    /**
     * Binds the view to the object path.
     * @function
     * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
     * @private
     */
    onObjectMatched: function (oEvent) {
      this.updateViewModel();
    },

    /**
     * update view.
     * 
     * @param {object} params The possible parameters.
     *        
     * @public
     */
    updateView: function (params) {
      this.updateViewModel();
      return true;
    },

    /**
     * Update view model.
     * @function
     *
     */
    updateViewModel: function () {
      this.updateSelectedServer();
      this.updateServerList();
    },

    /**
     * Update view model.
     * @function
     *
     */
    updateServerList: function () {

      var loginManager = oAppDataModel.loginManager;

      if (loginManager) {
        var item, serverList = [];

        for (var i = 0; i < loginManager.serverInfoList.length; i++) {
          item = loginManager.serverInfoList[i];

          serverList.push({
            id: item.serverId,
            name: item.serverName,
            url: item.serverUrl
          });
        }

        this.setProperty("/serverList", serverList);
      }
    },

    /**
     * Update view model.
     * @param {number} serverId
     *
     */
    updateSelectedServer: function (serverId) {

      var loginManager = oAppDataModel.loginManager;

      if (loginManager) {

        serverId = (serverId != null && serverId != undefined) ? serverId : loginManager.getSelectedServerId();

        var enableLoginButton = false;
        var selectedServerName = "";
        var serverInfo = loginManager.getServerInfo(serverId);

        if (serverInfo) {
          enableLoginButton = true;
          selectedServerName = serverInfo.serverName;
        }

        var oldServerId = this.getProperty("/selectedServerId");

        if (oldServerId == LoginManager.INVAID_SERVER_ID) {
          if (serverInfo) {
            this.setProperty("/selectedServerId", serverInfo.serverId);
          }
        } else if (oldServerId != serverId) {
          this.setProperty("/selectedServerId", serverId);
          this.setLoginFlag(false);
        }

        this.setProperty("/selectedServerName", selectedServerName);
        this.enableLoginButton(enableLoginButton);
      }
    },

    /**
         * Set the login flag.
         *
         * @param {boolean} isLogged A flag indicating whether login is successful.
         * @public
         */
    setLoginFlag: function (isLogged) {
      var buttonText = oBundle.getText('login');

      if (isLogged) {
        // Change the text 
        buttonText = oBundle.getText('logout');
      }

      this.setProperty("/isLogged", isLogged);
      this.setProperty("/loginButtonText", buttonText);
      oAppDataModel.setLoginFlag(isLogged);
    },

    /** Save settings.
     * 
     * @function
     * 
     * @private
     */
    save: function () {
      oAppDataModel.saveLoginManager();
    },

    /**
     * Event handler  for navigating back.
     *
     * @public
     */
    onLoginButton: function (evt) {
      var loginFlag = oAppDataModel.getLoginFlag();

      if (loginFlag) {
        this.sendLogoutRequest();
      } else {
        this.sendLoginRequest();
      }
    },

    /**
     * Event handler  for navigating back.
     *
     * @public
     */
    sendLoginRequest: function () {
      var serverInfo = oAppDataModel.loginManager.getSelectedServerInfo();

      if (!serverInfo) {
        return;
      }

      sap.ui.core.BusyIndicator.show(0);

      var that = this;
      var url = oAppDataModel.getRequestUrl("/user/login");
      //var encodedPassword = btoa(serverInfo.password);

      jQuery.ajax({
        url: url,
        type: "POST",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
          "deviceId": "TODO",
          "appId": "TODO",
          "username": serverInfo.userName,
          "password": serverInfo.password
        }),
        success: function (data) {

          if (data) {
            if (data.hasOwnProperty("sessionToken")) {

              oAppDataModel.setSessionToken(data.sessionToken);
              that.setLoginFlag(true);
            }
          }

          sap.ui.core.BusyIndicator.hide();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {

          sap.ui.core.BusyIndicator.hide();

          that.setProperty("/isLogged", false);
          var msg = oBundle.getText("failedToLogin");

          if (XMLHttpRequest && XMLHttpRequest.responseJSON) {
            var res = XMLHttpRequest.responseJSON;

            if (res.message) {
              msg = msg + " " + res.message;
            }
          }

          sap.m.MessageToast.show(msg, MessageToastOption);

          sap.ui.core.BusyIndicator.hide();
        }
      });
    },

    /**
     * Send logout request.
     *
     * @public
     */
    sendLogoutRequest: function () {
      var serverInfo = oAppDataModel.loginManager.getSelectedServerInfo();

      if (!serverInfo) {
        return;
      }

      var that = this;
      var url = oAppDataModel.getRequestUrl("/user/logout");
      var sessionToken = oAppDataModel.getSessionToken();

      jQuery.ajax({
        url: url,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (request) {
          request.setRequestHeader('sessionToken', sessionToken);
        },
        success: function (data) {
          that.setLoginFlag(false);

          oAppDataModel.setDevice(null);
          resetDeviceInfo();
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          // TODO: Do not set login flag to false?
          that.setLoginFlag(false);

          oAppDataModel.setDevice(null);
          resetDeviceInfo();

          //var isSessionTokenTimeout = false;
          //var msg = oBundle.getText("failedToLogout");

          //if (XMLHttpRequest && XMLHttpRequest.responseJSON) {
          //  var res = XMLHttpRequest.responseJSON;

          //  if (res.code == 6) {
          //    // Server error Code:  SessionTokenTimeout: { user: { code: 6, codeTxt: 'SessionTokenTimeout', message: 'session timeout' }, htmlCode: 400 }
          //    isSessionTokenTimeout = true;
          //  } else if (res.message) {
          //    msg = msg + " " + res.message;
          //  }
          //}

          //if (isSessionTokenTimeout) {
          //  that.setLoginFlag(false);
          //} else {
          //  sap.m.MessageToast.show(msg, MessageToastOption);
          //}
        }
      });

    },

    /**
     * Event handler  for navigating back.
     * It checks if there is a history entry. If yes, history.go(-1) will happen.
     * If not, it will replace the current entry of the browser history with the worklist route.
     * Furthermore, it removes the defined binding context of the view by calling unbindElement().
     * @public
     */
    onNavBack: function (evt) {
      this.goToHomePage(evt);
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
     * Go to user info page
     * @param {sap.ui.base.Event} oEvent the table selectionChange event
     * @public
     */
    selectServer: function (oEvent) {

      var oContext = oEvent.getSource().getBindingContext();

      if (oContext) {
        var oItem = oContext.getProperty(oContext.sPath);
        var loginMgr = oAppDataModel.loginManager;

        if (loginMgr && oItem && oItem.name) {

          var loginFlag = oAppDataModel.getLoginFlag();

          if (loginFlag) {
            // Already login
            var serverId = loginMgr.getSelectedServerId();

            if (serverId != oItem.id) {
              this.sendLogoutRequest();
              this.setLoginFlag(false);
            }
          }

          loginMgr.setSelectedServerId(oItem.id);

          this.updateSelectedServer(oItem.id);
          this.save();
        }
      }
    },

    /**
     * Go to server info page and create a new server.
     * @param {sap.ui.base.Event} oEvent the table selectionChange event
     * @public
     */
    addServer: function (oEvent) {
      var serverId = -1; // -1 is an invalid server Id, it means to add a new server.
      var isUpdated = updateView(MobileAppIds.ServerInfoPageInfo.viewId, serverId);

      if (isUpdated) {
        navTo(MobileAppIds.ServerInfoPageInfo.pageId);
      }
    },

    /**
     * Fires when selection in server list is changed.
     * @param {sap.ui.base.Event} oControlEvent the control event
     * @public
     */
    onSelectionChange(oControlEvent) {
      var serverList = this.getView().byId("serverList");

      if (serverList) {
        var hasSelectedItems = false;
        var items = serverList.getSelectedItems();

        if (items.length > 0) {
          hasSelectedItems = true;
        }

        this.enableDeleteButton(hasSelectedItems);
      }
    },

    /**
     * This event is fired when the server information is changed.
     * 
     * @public
     */
    enableDeleteButton: function (isEnabled) {
      var control = this.getView().byId("deleteButton");

      if (control) {
        control.setEnabled(isEnabled);

        if (isEnabled) {
          control.addStyleClass("customIcon");
        } else {
          control.removeStyleClass("customIcon");
        }
      }
    },

    /**
     * This event is fired when the server information is changed.
     * 
     * @public
     */
    enableLoginButton: function (isEnabled) {
      var control = this.getView().byId("loginButton");

      if (control) {
        control.setEnabled(isEnabled);
      }
    },

    /** Delete the selected server infos.
    * 
    * @param {sap.ui.base.Event} oEvent the table selectionChange event
    * @public
    */
    onDeleteButton: function (oEvent) {
      var that = this;
      var m = sap.m.MessageBox;

      var onClose = function (oAction) {
        if (oAction == m.Action.OK) {
          that.deleteServers();
        }
      }

      var oOptions = {
        icon: m.Icon.WARNING,
        title: oBundle.getText("deleteServer"),
        onClose: onClose,
        actions: [m.Action.CANCEL, m.Action.OK]
      };

      m.show(oBundle.getText("confirmDeleteServer"), oOptions);
    },

    /** Delete the selected server infos.
     * 
     * @param {sap.ui.base.Event} oEvent the table selectionChange event
     * @public
     */
    deleteServers: function () {

      var serverListCtrl = this.getView().byId("serverList");
      var loginManager = oAppDataModel.loginManager;

      if (serverListCtrl && loginManager) {

        var deleteSelectedServer = false;
        var selectedServerId = loginManager.getSelectedServerId();
        var dataItem;
        var serverIds = [];
        var contexts = serverListCtrl.getSelectedContexts();

        for (var i = 0; i < contexts.length; i++) {
          dataItem = contexts[i].getProperty(contexts[i].sPath);

          if (dataItem) {
            serverIds.push(dataItem.id);

            if (selectedServerId == dataItem.id) {
              deleteSelectedServer = true;
            }
          }
        }

        var result = loginManager.deleteServerInfo(serverIds);

        if (result) {

          this.updateServerList();
          this.enableDeleteButton(false);

          if (deleteSelectedServer) {
            this.updateSelectedServer(LoginManager.INVAID_SERVER_ID);
          }

          this.save();

          serverListCtrl.removeSelections(true);
        }
      }
    },

    /**
     * Go to server info page and edit the selected server.
     * @param {sap.ui.base.Event} oEvent the table selectionChange event
     * @public
     */
    goToServerInfo: function (oEvent) {

      var oContext = oEvent.getSource().getBindingContext();

      if (oContext) {
        var oItem = oContext.getProperty(oContext.sPath);

        if (oItem) {
          var isUpdated = updateView(MobileAppIds.ServerInfoPageInfo.viewId, oItem.id);

          if (isUpdated) {
            navTo(MobileAppIds.ServerInfoPageInfo.pageId);
          }
        }
      }
    }
  });

  return PageController;
});