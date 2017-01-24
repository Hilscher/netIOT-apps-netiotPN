/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/format/DateFormat','sap/ui/model/FormatException','sap/ui/model/odata/type/ODataType','sap/ui/model/ParseException','sap/ui/model/ValidateException'],function(D,F,O,P,V){"use strict";var d=new Date(2014,10,27,13,47,26);function i(t){return t.oConstraints&&t.oConstraints.isDateOnly;}function g(t){return sap.ui.getCore().getLibraryResourceBundle().getText(i(t)?"EnterDate":"EnterDateTime",[t.formatValue(d,"string")]);}function a(t){var f;if(!t.oFormat){f=jQuery.extend({strictParsing:true},t.oFormatOptions);if(i(t)){f.UTC=true;t.oFormat=D.getDateInstance(f);}else{delete f.UTC;t.oFormat=D.getDateTimeInstance(f);}}return t.oFormat;}function s(t,c){t.oConstraints=undefined;if(c){switch(c.nullable){case undefined:case true:case"true":break;case false:case"false":t.oConstraints=t.oConstraints||{};t.oConstraints.nullable=false;break;default:jQuery.sap.log.warning("Illegal nullable: "+c.nullable,null,t.getName());}if(c.isDateOnly===true){t.oConstraints=t.oConstraints||{};t.oConstraints.isDateOnly=true;}}t._handleLocalizationChange();}var b=O.extend("sap.ui.model.odata.type.DateTimeBase",{constructor:function(f,c){O.apply(this,arguments);s(this,c);this.oFormatOptions=f;},metadata:{"abstract":true}});b.prototype.formatValue=function(v,t){if(v===null||v===undefined){return null;}switch(t){case"any":return v;case"string":return a(this).format(v);default:throw new F("Don't know how to format "+this.getName()+" to "+t);}};b.prototype.parseValue=function(v,S){var r;if(v===null||v===""){return null;}switch(S){case"string":r=a(this).parse(v);if(!r){throw new P(g(this));}return r;default:throw new P("Don't know how to parse "+this.getName()+" from "+S);}};b.prototype._handleLocalizationChange=function(){this.oFormat=null;};b.prototype.validateValue=function(v){if(v===null){if(this.oConstraints&&this.oConstraints.nullable===false){throw new V(g(this));}return;}else if(v instanceof Date){return;}throw new V("Illegal "+this.getName()+" value: "+v);};return b;});