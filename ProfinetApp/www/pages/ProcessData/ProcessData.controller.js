sap.ui.define(['jquery.sap.global',
               'sap/ui/core/mvc/Controller',
               'sap/ui/model/json/JSONModel',
               'sap/ui/core/routing/History',
               'sap/ui/model/resource/ResourceModel'], function (
    jQuery, Controller, JSONModel, History, ResourceModel) {
  "use strict";

  var PageController = Controller.extend(
      "netIOT.pnDevice.ProcessData.ProcessData", {
        
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
            var route = this.router.getRoute("processDataPage");
            
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
              subProcessDataList: [],
              subDataCount: "0",
              showSubProcessDataList: false,
              parentLevel: 0,
              indexInParent: 0,
              rawProcessData: null,
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
        queryProcessData: function (packageId, deviceUuid, semanticInfo) {
          var that = this;
          var sessionToken = oAppDataModel.getSessionToken();
          var url = oAppDataModel.getRequestUrl("/device/processData")
                    + '?packageId=' + encodeURIComponent(packageId)
                    + '&deviceUuid=' + encodeURIComponent(deviceUuid)
                    + '&semanticInfo=' + encodeURIComponent(JSON.stringify(semanticInfo));

          jQuery.ajax({
            url : url,
            type: "GET",
            beforeSend: function (request) {
              request.setRequestHeader('sessionToken', sessionToken);
            },
            dataType : "json",
            contentType : "application/json; charset=utf-8",
            success : function(data) {
              if (data) {
                that.setRawProcessData(data);
                that.updateViewModel(data);
              }
            },
            error : function(XMLHttpRequest, textStatus, errorThrown) {
              var msg = oBundle.getText('failedToGetProcessData');

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
          
          if (args && args.packageId && args.uuid && oDataModel) {
            
            //oDataModel.setProperty("/uuid", args.uuid);        
            //var semanticInfo = oAppDataModel.currentParameter.semanticInfo;
            //this.queryProcessData(args.packageId, args.uuid, semanticInfo);
          }
          else {
           //console.log("Failed to get device by uuid " + args.uuid);
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

          if (params && params.packageId && params.deviceUuid && params.processData) {
            var semanticInfo = params.processData.semanticInfo;

            if (semanticInfo) {
              this.queryProcessData(params.packageId, params.deviceUuid, semanticInfo);
            }
          }

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
        goToSubProcessData : function(oEvent) {        
          
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
        setRawProcessData : function(parameter) {
          var dataModel = this.getView().getModel();

          if (parameter && dataModel) {  
            dataModel.setProperty("/rawProcessData", parameter);
            dataModel.setProperty("/indexPath", "/rawProcessData");
          }
        },
        
        /**
         * update the view data model.
         * 
         * @param {object} parameter the parameter object
         *        
         * @public
         */
        updateViewModel: function (processData) {

          var dataModel = this.getView().getModel();

          if (processData && dataModel) {
            
            // Basic info
            this.updateBasicInfo(dataModel, processData);
            
            // subDataList
            this.updateSubProcessData(dataModel, processData);
          }
        },

        /**
         * Update basic information of a process data.
         * 
         * @param {object} dataModel the data model of parameter view.
         * @param {object} processData the process data object from server.
         *          
         * @public
         */
        updateBasicInfo: function (dataModel, processData) {
          
          if(dataModel && processData) {
            var basicInfos = [];
            var temp = "";            
            
            // Name 
            if (jQuery.isArray(processData.name)) {
              temp = processData.name.join(".");
            }
           
            basicInfos.push({
              name : oBundle.getText('name'),
              value : temp,
              listType : "Inactive"
            });

            // SemanticInfo
            /*
            if (jQuery.isArray(processData.semanticInfo)) {
              temp = processData.semanticInfo.join("; ");
              
              basicInfos.push({
                name : oBundle.getText('semanticInfo'),
                value : temp,
                listType : "Inactive"
              });
            } 
            */
            
            // Description
            if(processData.hasOwnProperty("description")) {
             
              basicInfos.push({
                name: oBundle.getText("description"),
                value: processData.description,
                listType: "Inactive"
              });
            }

            // Direction
            var direction = "";
            if (processData.hasOwnProperty("direction")) {
              direction = processData.direction;
            }

            basicInfos.push({
              name: oBundle.getText("direction"),
              value: direction,
              listType: "Inactive"
            });

            // DataType
            var dataType = "";
            if(processData.hasOwnProperty("dataType")) {
              dataType = processData.dataType;
            }           

            basicInfos.push({
              name: oBundle.getText("dataType"),
              value: dataType,
              listType: "Inactive"
            });

            // ByteOffset
            if (processData.hasOwnProperty("byteOffset")) {
              basicInfos.push({
                name: oBundle.getText("byteOffset"),
                value: processData.byteOffset,
                listType: "Inactive"
              });
            }

            // BitOffset
            if (processData.hasOwnProperty("bitOffset")) {
              basicInfos.push({
                name: oBundle.getText("bitOffset"),
                value: processData.bitOffset,
                listType: "Inactive"
              });
            }

            // BitLength
            if (processData.hasOwnProperty("bitLength")) {
              basicInfos.push({
                name: oBundle.getText("bitLength"),
                value: processData.bitLength,
                listType: "Inactive"
              });
            }

            // ValueEnums
            var valueEnums = undefined;
            if(processData.hasOwnProperty("valueEnums")) {
              valueEnums = processData.valueEnums;              
            } 
            
            // Value
            var listType = "Inactive";
            
            if (processData.hasOwnProperty("value")) {
              temp = processData.value;
              //var result = this.convertValueToString(processData.value, dataType, valueEnums);
              //temp = result.text;
              
              //if(result.isComplicateValue) {
              //  listType = "Inactive"; //Navigation
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
            if(processData.hasOwnProperty("defaultValue")) {
              //var result = this.convertValueToString(processData.defaultValue, dataType);
             
              basicInfos.push({
                name: oBundle.getText("defaultValue"),
                value: processData.defaultValue,
                listType: "Inactive"
              });
            }

            // AllowedValues
            if (processData.hasOwnProperty("allowedValues")) {
              basicInfos.push({
                name: oBundle.getText("allowedValues"),
                value: processData.allowedValues,
                listType: "Inactive"
              });
            }

            // MinValue
            if(processData.hasOwnProperty("minValue")) {
              //var result = this.convertValueToString(processData.minValue, dataType);
            
              basicInfos.push({
                name: oBundle.getText("minValue"),
                value: processData.minValue,
                listType: "Inactive"
              });
            }            

            // MaxValue
            if(processData.hasOwnProperty("maxValue")) {
              //var result = this.convertValueToString(processData.maxValue, dataType);

              basicInfos.push({
                name: oBundle.getText("maxValue"),
                value: processData.maxValue,
                listType: "Inactive"
              });
            }
            
            // Unit
            if(processData.hasOwnProperty("unit")) {
              basicInfos.push({
                name: oBundle.getText("unit"),
                value: processData.unit,
                listType: "Inactive"
              });
            }            

            // AccessRight
            if(processData.hasOwnProperty("accessRight")) {
              temp = processData.accessRight;
              
              basicInfos.push({
                name: oBundle.getText("accessRight"),
                value: temp,
                listType: "Inactive"
              });
            }

            dataModel.setProperty("/dataItemShortName", this.getShortName(processData.name));  
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
        updateSubProcessData : function(dataModel, parentData) {
          var showSubDataList = false;
          var count = 0;
          var subDataList = [];

          if (dataModel && parentData) {

            if (parentData.hasOwnProperty("subProcessDataList") &&
               jQuery.isArray(parentData.subProcessDataList)) {
              
              var subParam, shortName, subParamValue, subParamUnit;
              var listType, convertResult;
              var list = parentData.subProcessDataList;
              
              for (var i = 0; i < list.length; i++) {
                
                subParam = list[i];
                
                if(subParam) {
                  
                  //convertResult = this.convertValueToString(subParam.value, subParam.dataType);
                  //subParamValue = convertResult.text;

                  if (subParam.value !== null && subParam.value !== undefined) {
                    subParamValue = subParam.value;
                  } else {
                    subParamValue = '';
                  }
                  
                  if(subParam.hasOwnProperty("unit")) {
                    subParamUnit = subParam.unit;  
                  }
                  else {
                    subParamUnit = "";
                  }
                  
                  if (subParam.hasOwnProperty("subProcessDataList")) {
                    listType = 'Navigation';
                  } else {
                    listType = 'Inactive';
                  }

                  subDataList.push({
                    name: this.getShortName(subParam.name),
                    value: subParamValue,
                    listType: listType,
                    unit: subParamUnit
                  });
                }
              } 
            }
            
            count = subDataList.length;
            
            if(count > 0) {
              showSubDataList = true; 
            }
          }

          dataModel.setProperty("/subProcessDataList", subDataList);
          dataModel.setProperty("/showSubProcessDataList", showSubDataList);
          dataModel.setProperty("/subDataCount", count.toString());
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
         * Convert the value to text by data type and value enumerations.
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

              if (value.length < 50)
                text = value;
              else
                text = "...";

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

