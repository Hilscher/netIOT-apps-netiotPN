sap.ui.define(['jquery.sap.global',
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/routing/History',
    'sap/ui/model/resource/ResourceModel'], function (
    jQuery, Controller, JSONModel, History, ResourceModel) {
  "use strict";

  var PageController = Controller.extend(
      "netIOT.pnDevice.Parameter.ParameterValue.ParameterValue", {

        onInit : function(oEvent) {

          this.initViewModel();

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
              "data": "test"
            }),
            dataType : "json",
            contentType : "application/json; charset=utf-8",
            success : function(data) {
              
              if(data && data.parameter) {
                
                that.setRawParameterData(data.parameter);
                
                that.updateDataModel(data.parameter);                  
              }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
              var msg = oBundle.getText("noConnection");
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

          var dataModel = this.getView().getModel();
          
          if (dataModel) {     
           
            var indexPath = dataModel.getProperty("/indexPath");
            var spPath = indexPath.split("/");
            
            if(spPath.length >= 3) {
              var pathArray = spPath.slice(0, spPath.length - 2); 
              indexPath = pathArray.join("/"); 
              
              var subParam = dataModel.getProperty(indexPath);
              
              if (subParam) {
                this.updateDataModel(subParam);
                dataModel.setProperty("/indexPath", indexPath);
              }
            }
            else {
              navBack();
            }             
          }          
        },

        /**
         * Go back to the home page.
         * 
         * @memberOf Parameter
         */
        goToHomePage: function (evt) {
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
         
          var dataModel = this.getView().getModel();
          var context = oEvent.getSource().getBindingContext();

          if (context && dataModel) {     
           
            var indexPath = context.getProperty("/indexPath") + context.sPath;   
            var subParam = dataModel.getProperty(indexPath);
            
            if (subParam) {
              this.updateDataModel(subParam);
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
        updateDataModel : function(parameter) {

          var dataModel = this.getView().getModel();

          if (parameter && dataModel) {           
            
            // Basic info
            this.updateBasicInfo(dataModel, parameter);
            
            // SubParameters         
            this.updateSubParameters(dataModel, parameter);            
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
            
            // Name 
            if (jQuery.isArray(parameter.name)) {
              temp = parameter.name.join(".");
            }
           
            basicInfos.push({
              name : oBundle.getText('Name'),
              value : temp,
              listType : "Inactive"
            });

            // SemanticInfo
            /*
            if (jQuery.isArray(parameter.semanticInfo)) {
              temp = parameter.semanticInfo.join("; ");
              
              basicInfos.push({
                name : oBundle.getText('SemanticInfo'),
                value : temp,
                listType : "Inactive"
              });
            } 
            */
            
            // Description
            if(parameter.hasOwnProperty("description")) {
             
              basicInfos.push({
                name: oBundle.getText("description"),
                value: parameter.description,
                listType: "Inactive"
              });
            }

            // DataType
            var dataType = "";
            if(parameter.hasOwnProperty("dataType")) {
              dataType = parameter.dataType;
            }           

            basicInfos.push({
              name: oBundle.getText("DataType"),
              value: dataType,
              listType: "Inactive"
            });

            // ValueEnums
            var valueEnums = undefined;
            if(parameter.hasOwnProperty("valueEnums")) {
              valueEnums = parameter.valueEnums;              
            }             
            
            // Value
            var listType = "Inactive";
            
            if(parameter.hasOwnProperty("value")) {
              var result = this.convertValueToString(parameter.value, dataType, valueEnums);
              temp = result.text;
              
              if(result.isComplicateValue) {
                listType = "Navigation";
              }
            }
            else {
              temp = "";
            }

            basicInfos.push({
              name: oBundle.getText("Value"),
              value: temp,
              listType: listType
            });

            if (valueEnums) {
              basicInfos.push({
                name: oBundle.getText("ValueEnums"),
                value: valueEnums,
                listType: "Navigation"
              });
            }
            
            // DefaultValue
            if(parameter.hasOwnProperty("defaultValue")) {
              var result = this.convertValueToString(parameter.defaultValue, dataType);
             
              basicInfos.push({
                name: oBundle.getText("DefaultValue"),
                value: result.text,
                listType: "Inactive"
              });
            }            

            // MinValue
            if(parameter.hasOwnProperty("minValue")) {
              var result = this.convertValueToString(parameter.minValue, dataType);
            
              basicInfos.push({
                name: oBundle.getText("MinValue"),
                value: result.text,
                listType: "Inactive"
              });
            }            

            // MaxValue
            if(parameter.hasOwnProperty("maxValue")) {
              var result = this.convertValueToString(parameter.maxValue, dataType);
           
              basicInfos.push({
                name: oBundle.getText("MaxValue"),
                value: result.text,
                listType: "Inactive"
              });
            }
            
            // Unit
            if(parameter.hasOwnProperty("unit")) {            
              basicInfos.push({
                name: oBundle.getText("Unit"),
                value: parameter.unit,
                listType: "Inactive"
              });
            }            

            // AccessRight
            if(parameter.hasOwnProperty("accessRight")) {
              temp = parameter.accessRight;
              
              basicInfos.push({
                name: oBundle.getText("AccessRight"),
                value: temp,
                listType: "Inactive"
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
        updateSubParameters : function(dataModel, parameter) {
          
          if(dataModel && parameter) {
            
            var subParameters = []; 
            
            if(parameter.hasOwnProperty("subParameters") &&
               jQuery.isArray(parameter.subParameters)) {
              
              var subParam, shortName, subParamValue, subParamUnit;
              var convertResult;
              
              for (var i = 0; i < parameter.subParameters.length; i++) {
                
                subParam = parameter.subParameters[i];
                
                if(subParam) {                       
                  
                  convertResult = this.convertValueToString(subParam.value, subParam.dataType);
                  subParamValue = convertResult.text;
                  
                  if(subParam.hasOwnProperty("unit")) {
                    subParamUnit = subParam.unit;  
                  }
                  else {
                    subParamUnit = "";
                  }
                  
                  subParameters.push({
                    name: this.getShortName(subParam.name),
                    value: subParamValue,
                    unit: subParamUnit
                  });                 
                }                
              } 
            }
            
            var count = subParameters.length;
            var subParameterCount = "(" + count.toString() + ")";
             
            var showSubParameters = false;
            
            if(count > 0) {
              showSubParameters = true; 
            }
                        
            dataModel.setProperty("/subParameters", subParameters);
            dataModel.setProperty("/subParameterCount", subParameterCount);
            dataModel.setProperty("/showSubParameters", showSubParameters);
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
            } else if(dataType == "ByteString") {
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
