/**
 * Copyright (c) 2016 Hilscher Gesellschaft fuer Systemautomation mbH
 *
 * Licensed under the MIT License, - see MITLicense.txt.
 *
 * The controller for page About.
 */

sap.ui.define([
    'jquery.sap.global',
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    "sap/ui/core/routing/History",
    "sap/ui/model/resource/ResourceModel"
], function (jQuery, Controller, JSONModel, History, ResourceModel) {
  "use strict";

  var PageController = Controller.extend("netIOT.pnDevice.About.About", {

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
        var route = this.router.getRoute("AboutPage");

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
      var licenseList = [];
      var licenseJson = jQuery.sap.syncGetJSON("openSrcLicense.json");

      if (licenseJson && licenseJson.success && licenseJson.data) {
        licenseList = licenseJson.data.licenseList;
      }
     
      var oData = {
        licenseList: licenseList
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
    },

    /**
     * Event handler for navigating back.
     * @public
     */
    showLicense: function (evt) {
      updateView(MobileAppIds.LicensePageInfo.viewId);
      navTo(MobileAppIds.LicensePageInfo.pageId);
    },
    
    /**
     * Event handler when clicking homepage.
     * @public
     */
    openHomepageUrl: function (evt) {
      var url = 'http://' + oBundle.getText("homepageUrl");

      if (typeof cordova !== "undefined" &&
          cordova.InAppBrowser) {
        cordova.InAppBrowser.open(url, '_system');
      } else if (window) {
        window.open(url, '_system');
      }
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
    }
  });

  return PageController;
});