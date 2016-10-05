sap.ui.define([ 'jquery.sap.global', 
                'sap/ui/core/mvc/Controller',
                'sap/ui/model/json/JSONModel', 
                'sap/ui/core/routing/History',
                'sap/ui/model/resource/ResourceModel'],
              function (jQuery, Controller, JSONModel, History, ResourceModel) {
  "use strict";

  var PageController = Controller.extend(
      "netIOT.pnDevice.Parameter.ValueEnums.ValueEnums", {        
        
        onInit : function(oEvent) {

          this.initViewModel();

          var router = this.getRouter();
          
          var oData = {
            parameterShortName : "",
            enums : []
          };

          var oDataModel = new JSONModel(oData);
          this.getView().setModel(oDataModel);

          var that = this;
          var url = oAppDataModel.getRequestUrl("/deviceData/parameterRead");
          var sessionToken = oAppDataModel.getSessionToken();

          jQuery.ajax({
            url : url,
            type: "POST",
            beforeSend: function (request) {
              request.setRequestHeader('sessionToken', sessionToken);
            },
            data: JSON.stringify({
              "data" : "test"
            }),
            dataType : "json",
            contentType : "application/json; charset=utf-8",
            success : function(data) {
              
              if(data && data.parameter) { 
                that.updateDataModel(data.parameter);
              }
            },
            error : function(XMLHttpRequest, textStatus, errorThrown) {
              var msg = oBundle.getText("noConnection");

              if (XMLHttpRequest && XMLHttpRequest.responseJSON) {
                var res = XMLHttpRequest.responseJSON;

                if (res.message) {
                  msg = msg + " " + res.message;
                }
              }

              sap.m.MessageToast.show(msg, MessageToastOption);
            }
          });

        },

        /**
         * Initialize the view model.
         *       
         * @public
         */
        initViewModel: function () {

          var oData = {
            parameterShortName: "",
            basicInfos: [],
            subParameters: [],
            subParameterCount: "(100)",
            showSubParameters: false,
            parentLevel: 0,
            indexInParent: 0,
            rawParameterData: null,
            indexPath: ""
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
         * Similar to onAfterRendering, but this hook is invoked before the
         * controller's View is re-rendered (NOT before the first rendering!
         * onInit() is used for that one!).
         * 
         * @memberOf PageController
         */
        onBeforeRendering : function() {
        },

        /**
         * update the view with specified parameters.
         * 
         * @param {object} params The possible parameters.
         *        
         * @public
         */
        updateView: function (params) {
          return true;
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
         * Get the router for this view.
         * 
         * @memberOf Parameter.ValueEnums
         */        
        getRouter : function () {
          return sap.ui.core.UIComponent.getRouterFor(this);
        },

        /**
         * Go back to the home page.
         * 
         * @memberOf Parameter.ValueEnums
         */
        goToHomePage : function(evt) {
          navToHome();

          //if (this.router) {
          //  this.router.navBack(MobileAppIds.ID_HOME_PAGE);  
          //}
        },  
        
        /**
         * Go back to the home page.
         * 
         * @memberOf Parameter
         */
        Test : function() {
          console.log("Value Enum Test : function()!");
        },   
        
        /**
         * update the view data model.
         * 
         * @param {object} parameter the parameter object
         *        
         * @public
         */
        updateDataModel : function(parameter) {

          var dataModel = this.getView().getModel();

          if (parameter && dataModel) {           
            
            var enums = [];
            var temp = "";            

            // ValueEnums         
            if(parameter.hasOwnProperty("valueEnums")) {
              var valueEnums = parameter.valueEnums;  
                
              for(var i = 0; i < valueEnums.length; i++) {
                                
                enums.push({
                  name: i.toString(),
                  value: i.toString()
                });
              } 
            }
            else {
              for(var i = 0; i < 6; i++) {
                
                enums.push({
                  name: i.toString(),
                  value: i.toString()
                });
              } 
            }
            
            dataModel.setProperty("/parameterShortName", this.getShortName(parameter.name));  
            dataModel.setProperty("/enums", enums);       
          }
        },
                
        /**
         * Convert the parameter value by data type.
         * 
         * @param {Array}
         *        nameArray The value of parameter.
         * @public
         */
        getShortName : function(nameArray) {
          var shortName = "";
          
          if(nameArray && nameArray.length > 0) {
            shortName = nameArray[nameArray.length - 1];   
          }                  
          
          return shortName;
        }
        
     });

  return PageController;

});
