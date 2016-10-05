/**
 * Copyright (c) 2016 Hilscher Gesellschaft fuer Systemautomation mbH
 *
 * Licensed under the MIT License, - see MITLicense.txt.
 *
 * Definition of page Ids and common methods for pages.
 */

"use strict";

var MobileAppIds = {

  ID_EDGE_GATEWAY_APP: "netIOT.pnDevice",

  DeviceInfoPageInfo: {
    pageId: "idDeviceInfoPage",
    viewId: "idDeviceInfoView",
    viewName: "netIOT.pnDevice.DeviceInfo.DeviceInfo"
  },
  PortInfoPageInfo: {
    pageId: "idPortInfoPage",
    viewId: "idPortInfoView",
    viewName: "netIOT.pnDevice.PortInfo.PortInfo"
  },
  ParameterPageInfo: {
    pageId: "idParameterPage",
    viewId: "idParameterView",
    viewName: "netIOT.pnDevice.Parameter.Parameter"
  },
  ProcessDataPageInfo: {
    pageId: "idProcessDataPage",
    viewId: "idProcessDataView",
    viewName: "netIOT.pnDevice.ProcessData.ProcessData"
  },
  LoginPageInfo: {
    pageId: "idLoginPage",
    viewId: "idLoginView",
    viewName: "netIOT.pnDevice.Login.Login"
  },
  ServerInfoPageInfo: {
    pageId: "idServerInfoPage",
    viewId: "idServerInfoView",
    viewName: "netIOT.pnDevice.Login.ServerInfo.ServerInfo"
  },
  AboutPageInfo: {
    pageId: "idAboutPage",
    viewId: "idAboutView",
    viewName: "netIOT.pnDevice.About.About"
  },
  LicensePageInfo: {
    pageId: "idLicensePage",
    viewId: "idLicenseView",
    viewName: "netIOT.pnDevice.About.License.License"
  }
};

var oAppDataModel = new AppDataModel();

/**
 * Create the pages of mobile application.
 */
function createMobileAppPages() {

  jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
  jQuery.sap.require("sap.m.MessageBox");
  jQuery.sap.require("sap.m.Dialog");
  jQuery.sap.require("jquery.sap.storage");
  jQuery.sap.require("sap.ui.core.util.Export");
  jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
  
  oAppDataModel.load();

  var oManifestJson = jQuery.sap.syncGetJSON("manifest.json");

  if (oManifestJson && oManifestJson.success &&  oManifestJson.data) {    
    oAppDataModel.readManifest(oManifestJson.data);
  }

  // create a mobile app and display page1 initially
  var app = new sap.m.App(MobileAppIds.ID_EDGE_GATEWAY_APP,
    {
      initialPage: MobileAppIds.DeviceInfoPageInfo.pageId
    }
  ); 
   
  // DeviceInfo page
  createPage(app, MobileAppIds.DeviceInfoPageInfo);

  // PortInfo page
  createPage(app, MobileAppIds.PortInfoPageInfo);

  // Parameter page
  createPage(app, MobileAppIds.ParameterPageInfo);

  // ProcessData page
  createPage(app, MobileAppIds.ProcessDataPageInfo);

  // Login page
  createPage(app, MobileAppIds.LoginPageInfo);

  // ServerInfo page
  createPage(app, MobileAppIds.ServerInfoPageInfo);

  // About page
  createPage(app, MobileAppIds.AboutPageInfo);

  // License page
  createPage(app, MobileAppIds.LicensePageInfo);

  // General page
  //createPage(app, MobileAppIds.GeneralPageInfo);

  // place the application into the HTML document
  app.placeAt("content");
}

/**
 * update view with specified ID.
 * 
 * @param {object} _app The app object.
 * @param {object} pageInfo The page information object.
 *        
 * @public
 */
function createPage(_app, pageInfo) {
 
  if (_app && pageInfo) {
    var view = sap.ui.view({
      id: pageInfo.viewId,
      viewName: pageInfo.viewName,
      height: "100%",
      width: "100%",
      type: sap.ui.core.mvc.ViewType.XML
    });

    if (view) {
      var page = new sap.m.Page(pageInfo.pageId, {
        showHeader: false,
        content: view
      });

      if (page) {
        _app.addPage(page);
      }
    }
  }
}

/**
 * update view with specified ID.
 * 
 * @param {string} viewId The view ID.
 * @param {object} params The possible parameters.
 *        
 * @public
 */
function updateView(viewId, params) {
  var isViewUpdated = false;

  var controller = getControllerInView(viewId);

  if (controller && controller.updateView) {
    isViewUpdated = controller.updateView(params);
  }

  if (!isViewUpdated) {
    sap.m.MessageToast.show("Failed to update view " + viewId + "!", MessageToastOption);
  }

  return isViewUpdated;
}

/**
 * get the controller in view with specified ID.
 *
 * @param {string} viewId The view ID.
 * @return {object} The possible controller in view.
 *
 * @public
 */
function getControllerInView(viewId) {
  var controller = null;
  var view = sap.ui.getCore().byId(viewId);

  if (view) {
     controller = view.getController();
  }

  return controller;
}

/**
 * Get app.
 * 
 * @return {sap.m.App} the instance of mobile application.
 *        
 * @public
 */
function getApp() {
  return sap.ui.getCore().byId(MobileAppIds.ID_EDGE_GATEWAY_APP);
}
/**
 * Go to page with specified ID.
 * 
 * @param {string} sTransitionName The transition name.
 *        
 * @public
 */
function navToHome(sTransitionName) {
  var app = getApp();

  if (app) {
    app.to(MobileAppIds.DeviceInfoPageInfo.pageId, sTransitionName);
  }
} 

/**
 * Go to page with specified ID.
 * 
 * @param {string} pageId The page ID.
 * @param {string} sTransitionName The transition name.
 *        
 * @public
 */
function navTo(pageId, sTransitionName) {
  var app = getApp();

  if (app) {
    app.to(pageId, sTransitionName);
  }
}

/**
 * Go to page with specified ID.
 * 
 * @param {string} pageId The page ID.
 *        
 * @public
 */
function navBack() {
  var app = getApp();

  if (app) {
    app.back();
  }
}