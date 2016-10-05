sap.ui.define(['jquery.sap.global',
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/routing/History',
    'sap/ui/model/resource/ResourceModel'], function (
    jQuery, Controller, JSONModel, History, ResourceModel) {
  "use strict";

  var PageController = Controller.extend(
      "netIOT.pnDevice.Login.ServerInfo.ServerInfo", {

        onInit : function(oEvent) {
          this.initViewModel();
        },

        /**
         * Initialize the view model.
         *       
         * @public
         */
        initViewModel: function () {

          var oData = {
            serverId: -1,
            serverName: "",
            serverUrl: "",
            userName: "",
            password: "",

            saveButtonText: "",
            isSaveButtonEnabled: false,
            passwordInputType: "Password",
            passwordIconSrc: "sap-icon://display",
            isPasswordHidden: true,
            canPasswordBeShown: false
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
         * update the view with specified parameters.
         * 
         * @param {object} params The possible parameters.
         *        
         * @public
         */
        updateView: function (serverId) {
          var result = false;

          if (jQuery.isNumeric(serverId)) {
            
            var loginMgr = oAppDataModel.loginManager;
          
            if (loginMgr) {
              var info = loginMgr.getServerInfo(serverId);
              result = this.updateServerInfo(info);
              this.resetView();
            }

            var i18nModel = this.getView().getModel("i18n");

            if (i18nModel) {
              var buttonText;
              var canPasswordBeShown = false;

              if (serverId < 0) {
                buttonText = i18nModel.getProperty("add");
                canPasswordBeShown = true;
              }
              else {
                buttonText = i18nModel.getProperty("save");
              }

              this.setProperty("/saveButtonText", buttonText);
              this.setProperty("/canPasswordBeShown", canPasswordBeShown);
            }
          }

          return result;
        },

        resetView() {
          this.setProperty("/isSaveButtonEnabled", false);
          this.hidePassword(true);
          this.clearAllValidationFlags();
        },

        /**
         * @param {object} info The server info object.
         *
         * @return {boolean} true, if the server info in view model is reset; false, otherwise;
         */
        updateServerInfo(info) {
          var result = false;
          var serverId = (info && info.hasOwnProperty("serverId")) ? info.serverId : -1;
          var serverName = (info && info.hasOwnProperty("serverName")) ? info.serverName : "";
          var serverUrl = (info && info.hasOwnProperty("serverUrl")) ? info.serverUrl : "";
          var userName = (info && info.hasOwnProperty("userName")) ? info.userName : "";
          var password = (info && info.hasOwnProperty("password")) ? info.password : "";

          var oViewModel = this.getView().getModel();

          if (oViewModel) {
            oViewModel.setProperty("/serverId", serverId);
            oViewModel.setProperty("/serverName", serverName);
            oViewModel.setProperty("/serverUrl", serverUrl);
            oViewModel.setProperty("/userName", userName);
            oViewModel.setProperty("/password", password);

            result = true;
          }
          
          return result;
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
         * This event is fired when the server information is changed.
         * 
         * @public
         */
        onSave: function (oControlEvent) {

          var oDataModel = this.getView().getModel();

          if (!oDataModel) {
            return;
          }
      
          var loginMgr = oAppDataModel.loginManager;

          if (loginMgr) {

            var serverId = oDataModel.getProperty("/serverId");
        
            var info = {
              serverId: serverId,
              serverName: oDataModel.getProperty("/serverName"),
              serverUrl: oDataModel.getProperty("/serverUrl"),
              userName: oDataModel.getProperty("/userName"),
              password: oDataModel.getProperty("/password")
            };

            var result = false;

            if (serverId < 0) {
              result = loginMgr.createServerInfo(info);
            } else {
              result = loginMgr.updateServerInfo(info);
            }

            if (result) {
              result = updateView(MobileAppIds.LoginPageInfo.viewId);

              oAppDataModel.saveLoginManager();
            }

            if (result) {
              navBack();
            }
          }
        },

        /**
         * This event is fired when the server information is changed.
         * 
         * @public
         */
        togglePasswordInputType: function (oControlEvent) {
          var isPasswordHidden = this.getProperty("/isPasswordHidden");
         
          if (isPasswordHidden != null) {
            isPasswordHidden = !isPasswordHidden;
            this.hidePassword(isPasswordHidden);
          }
        },

        /**
         * Hide the password text.
         * 
         * @public
         */
        hidePassword: function (hidePassword) {

          var oDataModel = this.getView().getModel();

          if (oDataModel) {          

            if (hidePassword) {
              oDataModel.setProperty("/passwordIconSrc", "sap-icon://display");
              oDataModel.setProperty("/passwordInputType", "Password");
            } else {
              oDataModel.setProperty("/passwordIconSrc", "sap-icon://hide");
              oDataModel.setProperty("/passwordInputType", "Text");
            }

            oDataModel.setProperty("/isPasswordHidden", hidePassword);
          }
        },

        /**
         * This event is fired when the server name is changed.
         * 
         * @public
         */
        onServerNameChanged: function (oController) {
          var isValid = this.isServerNameValid();
          this.setValidationFlag("serverName", isValid);

          this.refreshSaveButton(isValid);
        },        

        /**
         * This event is fired when the server information is changed.
         * 
         * @public
         */
        onUserNameChanged: function (oController) {
          var isValid = this.isUserNameValid();
          this.setValidationFlag("userName", isValid);
          this.refreshSaveButton(isValid);
        },

        /**
         * This event is fired when the server url is changed.
         * 
         * @public
         */
        onServerUrlChanged: function (oController) {
          this.refreshSaveButton();
        },

        /**
         * This event is fired when the server url is changed.
         * 
         * @public
         */
        onPasswordChanged: function (oController) {
          this.refreshSaveButton();

          var oViewModel = this.getView().getModel();

          if (oViewModel && oController) {
            var password = oController.getParameters().value;

            if (password.length == 0) {
              oViewModel.setProperty("/canPasswordBeShown", true);
            }
          }
        },

        /**
         * Check if server name is valid.
         * 
         * @public
         */
        isServerNameValid: function () {
          var isValid = false;
          var text = this.getProperty("/serverName");

          if (text && text.length > 0) {
            isValid = true;
          }
          return isValid;
        },

        /**
         * Check if user name is valid.
         * 
         * @public
         */
        isUserNameValid: function () {
          var isValid = false;
          var text = this.getProperty("/userName");

          if (text && text.length > 0) {
            isValid = true;
          }
          return isValid;
        },

        /**
         * This event is fired when the server information is changed.
         * 
         * @public
         */
        refreshSaveButton: function (singleValidFlag) {

          singleValidFlag = singleValidFlag ? singleValidFlag : true;

          var allInputsValid = false;

          if (singleValidFlag) {
          
            if (this.isServerNameValid()) {
              
              if (this.isUserNameValid()) {
                allInputsValid = true;
              }
            }
          }          

          this.setProperty("/isSaveButtonEnabled", allInputsValid);
        },

        /**
         * This event is fired when the server information is changed.
         * 
         * @public
         */
        clearAllValidationFlags: function (hidePassword) {
          this.setValidationFlag("serverName", true);
          this.setValidationFlag("serverUrl", true);
          this.setValidationFlag("userName", true);
        },
      
        /**
         * This event is fired when the server information is changed.
         * 
         * @public
         */
        setValidationFlag: function (id, isValid) {
          var control = this.getView().byId(id);

          if (control) {
            if (isValid) {
              control.removeStyleClass("invalidInput");
            } else {
              control.addStyleClass("invalidInput");
            }
          }
        },

        /**
         * Event handler for navigating back. It checks if there is a history
         * entry. If yes, history.go(-1) will happen. If not, it will replace
         * the current entry of the browser history with the worklist route.
         * Furthermore, it removes the defined binding context of the view by
         * calling unbindElement().
         * 
         * @public
         */
        onNavBack : function(evt) {
          navBack();
        },

        /**
         * Go back to the home page.
         * 
         * @memberOf Parameter
         */
        goToHomePage: function (evt) {
          navToHome();
        },

        /**
         * update the view data model.
         * 
         * @param {object} parameter the parameter object
         *        
         * @public
         */
        updateDataModel : function(data) {

          var oViewModel = this.getView().getModel();

          if (dataModel) {

            var serverId = (data && data.serverId) ? data.serverId : -1; // -1, Create new server
            var serverName = (data && data.serverName) ? data.serverName : "";
            var serverUrl = (data && data.serverUrl) ? data.serverUrl : "";
            var userName = (data && data.userName) ? data.userName : "";
            var password = (data && data.password) ? data.password : "";
         
            oViewModel.setProperty("serverId", serverId);
            oViewModel.setProperty("serverName", serverName);
            oViewModel.setProperty("serverUrl", serverUrl);
            oViewModel.setProperty("userName", userName);
            oViewModel.setProperty("password", password);
          }
        }
      });

  return PageController;

});
