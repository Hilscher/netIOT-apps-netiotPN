sap.ui.define(['jquery.sap.global',
               'sap/ui/core/mvc/Controller',
               'sap/ui/model/json/JSONModel',
               'sap/ui/core/routing/History',
               'sap/ui/model/resource/ResourceModel'], function (
    jQuery, Controller, JSONModel, History, ResourceModel) {
  "use strict";

  var PageController = Controller.extend(
      "netIOT.pnDevice.Parameter.Parameter", {
        
        onInit : function(oEvent) {

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
            var route = this.router.getRoute("parameterPage"); 
            
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
          
          var oData = {
              uuid: "",
              parameterShortName : "",
              basicInfos : [],
              subParameterList : [],
              subParameterCount: "(100)",
              showSubParameterList : false,
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
         * Query a parameter from server.
         *       
         * @public
         */   
        queryParameter: function (packageId, uuid, semanticInfo) {
          var that = this;
          var sessionToken = oAppDataModel.getSessionToken();
          var url = oAppDataModel.getRequestUrl("/device/parameter")
                    + '?packageId=' + encodeURIComponent(packageId)
                    + '&uuid=' + encodeURIComponent(uuid)
                    + '&semanticInfo=' + encodeURIComponent(JSON.stringify(semanticInfo));

          jQuery.ajax({
            url : url,
            type: "GET",
            beforeSend: function (request) {
              request.setRequestHeader('sessionToken', sessionToken);
            },
            dataType : "json",
            contentType : "application/json; charset=utf-8",
            success: function (data) {
              //console.log(JSON.stringify(data));
              if(data) {
                that.setRawParameterData(data);
                that.updateViewModel(data);
              }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
              
              var msg = oBundle.getText('noAccessRight');
              //var msg = oBundle.getText('failedToGetParameter');

              //if (XMLHttpRequest && XMLHttpRequest.responseJSON) {
              //  var res = XMLHttpRequest.responseJSON;

              //  if (res.message) {
              //    msg = msg + " " + res.message;
              //  }
              //}

              sap.m.MessageToast.show(msg, MessageToastOption);
            }
          });
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
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        onObjectMatched: function(oEvent) {
          
          var args = oEvent.getParameter("arguments");
          var oDataModel = this.getView().getModel();
          
          if(args && args.uuid && oDataModel) {             
            
            oDataModel.setProperty("/uuid", args.uuid);        
            var semanticInfo = oAppDataModel.currentParameter.semanticInfo;
            this.queryParameter(args.uuid, semanticInfo);
          }
          else {
          }
        },        

        /**
         * update the view with specified parameters.
         * 
         * @param {object} parameter The parameter object.
         *        
         * @public
         */
        updateView: function (params) {

          if (params && params.uuid && params.packageId && params.parameter) {
            this.queryParameter(params.packageId, params.uuid, params.parameter.semanticInfo);
          }

          //if (parameter) {
          //  this.setRawParameterData(parameter);
          //  this.updateViewModel(parameter);
          //}

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

          var dataModel = this.getView().getModel();
          
          if (dataModel) {

            var indexPath = dataModel.getProperty("/indexPath");
            var spPath = indexPath.split("/");

            if (spPath.length >= 3) {
              var pathArray = spPath.slice(0, spPath.length - 2);
              indexPath = pathArray.join("/");

              var subParam = dataModel.getProperty(indexPath);

              if (subParam) {
                this.updateViewModel(subParam);
                dataModel.setProperty("/indexPath", indexPath);
              }
            }
            else {

              navBack();
              //if (this.router) {
              //  var oDataModel = this.getView().getModel();

              //  if (this.router) {               

              //    this.router.navBack( MobileAppIds.ID_DEVICE_INFO_PAGE,
              //                         {uuid: oDataModel.getProperty("/uuid")}
              //                       );
              //  }                
              //}
            }
          }
        },

        /**
         * Go back to the home page.
         * 
         * @memberOf Parameter
         */
        goToHomePage : function(evt) {
          navToHome();

          //if (this.router) {
          //  this.router.navBack(MobileAppIds.ID_HOME_PAGE);  
          //}
        },
        
        /**
         * Event handler when a table item gets pressed
         * 
         * @param {sap.ui.base.Event}
         *          oEvent the table selectionChange event
         * @public
         */
        goToDetails : function(oEvent) {
         
          var context = oEvent.getSource().getBindingContext();
          
          if(context) {
            
            var item = context.getProperty(context.sPath);   
           
            var app = sap.ui.getCore().byId(MobileAppIds.ID_EDGE_GATEWAY_APP); 
              
            if (app) {
                            
              app.to(MobileAppIds.ID_VALUE_ENUMS_PAGE, {
                objectId: "123"
              });  
            }
          }   
        },
        
        /**
         * Event handler when a table item gets pressed
         * 
         * @param {sap.ui.base.Event}
         *          oEvent the table selectionChange event
         * @public
         */
        goToSubParameter : function(oEvent) {        
          
          var dataModel = this.getView().getModel();
          var context = oEvent.getSource().getBindingContext();

          if (context && dataModel) {     
           
            var indexPath = context.getProperty("/indexPath") + context.sPath;
            var subParam = dataModel.getProperty(indexPath);
            
            if (subParam) {
              this.updateViewModel(subParam);
              dataModel.setProperty("/indexPath", indexPath);
            }
          }
        },

        /**
         * set the raw parameter data from server.
         * 
         * @param {object} parameter the parameter object
         *        
         * @public
         */
        setRawParameterData : function(parameter) {
          var dataModel = this.getView().getModel();

          if (parameter && dataModel) {  
            dataModel.setProperty("/rawParameterData", parameter);
            dataModel.setProperty("/indexPath", "/rawParameterData");
          }
        },
        
        /**
         * update the view data model.
         * 
         * @param {object} parameter the parameter object
         *        
         * @public
         */
        updateViewModel : function(parameter) {

          var dataModel = this.getView().getModel();

          if (parameter && dataModel) {
            
            // Basic info
            this.updateBasicInfo(dataModel, parameter);
            
            // SubParameterList
            this.updateSubParameterList(dataModel, parameter);
          }
        },

        /**
         * Update basic information of a parameter.
         * 
         * @param {object} dataModel the data model of parameter view.
         * @param {object} parameter the parameter object from server.
         *          
         * @public
         */
        updateBasicInfo : function(dataModel, parameter) {
          
          if(dataModel && parameter) {
            var basicInfos = [];
            var temp = "";
            var inactiveListType = "Inactive";
            
            // Name 
            if (jQuery.isArray(parameter.name)) {
              temp = parameter.name.join(".");
            }
           
            basicInfos.push({
              name : oBundle.getText('name'),
              value : temp,
              listType: inactiveListType
            });

            // SemanticInfo
            /*
            if (jQuery.isArray(parameter.semanticInfo)) {
              temp = parameter.semanticInfo.join("; ");
              
              basicInfos.push({
                name : oBundle.getText('semanticInfo'),
                value : temp,
                listType : inactiveListType
              });
            } 
            */
            
            // Description
            if(parameter.hasOwnProperty("description")) {
             
              basicInfos.push({
                name: oBundle.getText("description"),
                value: parameter.description,
                listType: inactiveListType
              });
            }

            // opcDataType
            var opcDataType = "";
            if (parameter.hasOwnProperty("opcDataType")) {
              opcDataType = parameter.opcDataType;
            }

            basicInfos.push({
              name: oBundle.getText("opcDataType"),
              value: opcDataType,
              listType: inactiveListType
            });

            // pnDataType
            if (parameter.hasOwnProperty("pnDataType")) {
              basicInfos.push({
                name: oBundle.getText("pnDataType"),
                value: parameter.pnDataType,
                listType: inactiveListType
              });
            }

            // iolDataType
            if (parameter.hasOwnProperty("iolDataType")) {
              basicInfos.push({
                name: oBundle.getText("iolDataType"),
                value: parameter.iolDataType,
                listType: inactiveListType
              });
            }
            
            // ByteOffset
            if (parameter.hasOwnProperty("byteOffset")) {
              basicInfos.push({
                name: oBundle.getText("byteOffset"),
                value: parameter.byteOffset,
                listType: inactiveListType
              });
            }

            // BitOffset
            if (parameter.hasOwnProperty("bitOffset")) {
              basicInfos.push({
                name: oBundle.getText("bitOffset"),
                value: parameter.bitOffset,
                listType: inactiveListType
              });
            }

            // BitLength
            if (parameter.hasOwnProperty("bitLength")) {
              basicInfos.push({
                name: oBundle.getText("bitLength"),
                value: parameter.bitLength,
                listType: inactiveListType
              });
            }

            // ValueEnums
            var valueEnums = undefined;
            if(parameter.hasOwnProperty("valueEnums")) {
              valueEnums = parameter.valueEnums;
            }
            
            // Value
            var listType = "Inactive";
            
            if (parameter.hasOwnProperty("value")) {
              temp = parameter.value;
             
              //var result = this.convertValueToString(parameter.value, dataType, valueEnums);
              //temp = result.text;
              
              //if(result.isComplicateValue) {
              //  listType = inactiveListType; //Navigation
              //}
            }
            else {
              temp = "";
            }

            basicInfos.push({
              name: oBundle.getText("value"),
              value: temp,
              listType: listType
            });

            if (valueEnums) {
              basicInfos.push({
                name: oBundle.getText("valueEnums"),
                value: valueEnums,
                listType: "Inactive" //Navigation
              });
            }
            
            // DefaultValue
            if(parameter.hasOwnProperty("defaultValue")) {
              //var result = this.convertValueToString(parameter.defaultValue, dataType);
              //result.text

              basicInfos.push({
                name: oBundle.getText("defaultValue"),
                value: parameter.defaultValue,
                listType: inactiveListType
              });
            }

            // AllowedValues
            if (parameter.hasOwnProperty("allowedValues")) {
              basicInfos.push({
                name: oBundle.getText("allowedValues"),
                value: parameter.allowedValues,
                listType: inactiveListType
              });
            }

            // MinValue
            if(parameter.hasOwnProperty("minValue")) {
              //var result = this.convertValueToString(parameter.minValue, dataType);
            
              basicInfos.push({
                name: oBundle.getText("minValue"),
                value: parameter.minValue,
                listType: inactiveListType
              });
            }            

            // MaxValue
            if(parameter.hasOwnProperty("maxValue")) {
              //var result = this.convertValueToString(parameter.maxValue, dataType);
           
              basicInfos.push({
                name: oBundle.getText("maxValue"),
                value: parameter.maxValue,
                listType: inactiveListType
              });
            }
            
            // Unit
            if(parameter.hasOwnProperty("unit")) {
              basicInfos.push({
                name: oBundle.getText("unit"),
                value: parameter.unit,
                listType: inactiveListType
              });
            }

            // AccessRight
            if(parameter.hasOwnProperty("accessRight")) {
              temp = parameter.accessRight;
              
              basicInfos.push({
                name: oBundle.getText("accessRight"),
                value: temp,
                listType: inactiveListType
              }); 
            }

            dataModel.setProperty("/parameterShortName", this.getShortName(parameter.name));  
            dataModel.setProperty("/basicInfos", basicInfos);
          }
        },

        /**
         * Update sub parameter list.
         * 
         * @param {object} dataModel the data model of parameter view.
         * @param {object} parameter the parameter object from server.
         *          
         * @public
         */
        updateSubParameterList : function(dataModel, parameter) {

          if(dataModel && parameter) {

            var subParameterList = []; 

            if(parameter.hasOwnProperty("subParameterList") &&
               jQuery.isArray(parameter.subParameterList)) {

              var subParam, shortName, subParamValue, subParamUnit;
              var convertResult;
              
              for (var i = 0; i < parameter.subParameterList.length; i++) {
                
                subParam = parameter.subParameterList[i];
                
                if(subParam) {
                  
                  if (subParam.value !== null && subParam.value !== undefined) {
                    //convertResult = this.convertValueToString(subParam.value, subParam.dataType);
                    //subParamValue = convertResult.text;
                    subParamValue = subParam.value;
                  } else {
                    subParamValue = '';
                  }

                  if(subParam.hasOwnProperty('unit')) {
                    subParamUnit = subParam.unit;  
                  }
                  else {
                    subParamUnit = '';
                  }
                  
                  subParameterList.push({
                    name: this.getShortName(subParam.name),
                    value: subParamValue,
                    unit: subParamUnit
                  });
                }
              } 
            }
            
            var count = subParameterList.length;
            var subParameterCount = "(" + count.toString() + ")";
             
            var showSubParameterList = false;
            
            if(count > 0) {
              showSubParameterList = true; 
            }
                        
            dataModel.setProperty("/subParameterList", subParameterList);
            dataModel.setProperty("/subParameterCount", subParameterCount);
            dataModel.setProperty("/showSubParameterList", showSubParameterList);
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
        },
        
        /**
         * Convert the parameter value to text by data type and value enumerations.
         * 
         * @param {object} value The value of parameter.
         * @param {string} value The value of parameter.
         * @param {Array<object>} valueEnums The value of parameter.
         *        
         * @public
         */
        convertValueToString : function(value, dataType, valueEnums) {
          var text = "";
          var isComplicateValue = false;
          var hasError = false;
          
          if(value != null && value != undefined && dataType) {
            
            if(dataType == "String") {
              text = value;  
            } else if (dataType == "ByteString") {

              text = value;
              //if (value.length < 50)
              //  text = value;
              //else
              //  text = "...";

              isComplicateValue = true;
              
            } else if(dataType == "Variant") {
              
              text = "...";  
              isComplicateValue = true;
              
              if (jQuery.isArray(value.value)) {
                
                var count = value.value.length;
                
                if(count < 6) { 
                  
                  if(value.dataType == "Byte") {
                    
                    text = "";
                    var byteValue;
                    
                    for (var i = 0; i < count; i++) {
                      byteValue = parseInt(value.value[i]);
                      
                      if(byteValue != undefined && byteValue != null) {
                        text = text + "  0x" + pad(byteValue.toString(16), 2);
                      }
                      else {
                        hasError = true;
                        break;
                      }
                    }                    
                  }
                }
              }
                           
            } else {
              // Other basic types              
              var isEnumTextFound = false;
              
              if(valueEnums && 
                 (dataType == "Boolean" || dataType == "SByte" || 
                  dataType == "Byte" || dataType == "Int16" ||
                  dataType == "UInt16" || dataType == "Int32" ||
                  dataType == "UInt32")) {
                
                var intValue = 0;
                
                if(dataType == "Boolean") {                  
                  if(value)
                    intValue = 1;                 
                }
                else {
                  intValue = parseInt(value);
                }
                
                for(var j = 0; j < valueEnums.length; j++) {
                  
                  if(valueEnums[j].value == intValue) {
                    text = valueEnums[j].symbol;
                    isEnumTextFound = true;
                    break;
                  }
                }
              }
                
              if(!isEnumTextFound) {
                text = value.toString();
              } 
            }            
          
            if(hasError) {
              text = "Failed to parse value!"; 
            }
          }
          
          return {text: text, isComplicateValue: isComplicateValue};
        }
      });

  return PageController;

});

