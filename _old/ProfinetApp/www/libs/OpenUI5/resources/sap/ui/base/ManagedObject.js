/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./BindingParser','./DataType','./EventProvider','./ManagedObjectMetadata','../model/BindingMode','../model/CompositeBinding','../model/Context','../model/FormatException','../model/ListBinding','../model/Model','../model/ParseException','../model/TreeBinding','../model/Type','../model/ValidateException','jquery.sap.act','jquery.sap.script','jquery.sap.strings'],function(q,B,D,E,M,b,C,d,F,L,f,P,T,g,V){"use strict";var I;var h=E.extend("sap.ui.base.ManagedObject",{metadata:{"abstract":true,publicMethods:["getId","getMetadata","getModel","setModel","hasModel","bindProperty","unbindProperty","bindAggregation","unbindAggregation","bindObject","unbindObject","getObjectBinding"],library:"sap.ui.core",properties:{},aggregations:{},associations:{},events:{"validationSuccess":{enableEventBubbling:true,parameters:{element:{type:'sap.ui.base.ManagedObject'},property:{type:'string'},type:{type:'sap.ui.model.Type'},newValue:{type:'any'},oldValue:{type:'any'}}},"validationError":{enableEventBubbling:true,parameters:{element:{type:'sap.ui.base.ManagedObject'},property:{type:'string'},type:{type:'sap.ui.model.Type'},newValue:{type:'any'},oldValue:{type:'any'},message:{type:'string'}}},"parseError":{enableEventBubbling:true,parameters:{element:{type:'sap.ui.base.ManagedObject'},property:{type:'string'},type:{type:'sap.ui.model.Type'},newValue:{type:'any'},oldValue:{type:'any'},message:{type:'string'}}},"formatError":{enableEventBubbling:true,parameters:{element:{type:'sap.ui.base.ManagedObject'},property:{type:'string'},type:{type:'sap.ui.model.Type'},newValue:{type:'any'},oldValue:{type:'any'}}}},specialSettings:{id:true,models:true,bindingContexts:true,objectBindings:true,Type:true}},constructor:function(i,s,o){var t=this;E.call(this);if(typeof i!=='string'&&i!==undefined){o=s;s=i;i=s&&s.id;}if(!i){i=this.getMetadata().uid();}else{var p=h._fnIdPreprocessor;i=(p?p.call(this,i):i);var a=I||(I=D.getType("sap.ui.core.ID"));if(!a.isValid(i)){throw new Error("\""+i+"\" is not a valid ID.");}}this.sId=i;this.mProperties=this.getMetadata().createPropertyBag();this.mAggregations={};this.mAssociations={};this.oParent=null;this.aDelegates=[];this.aBeforeDelegates=[];this.iSuppressInvalidate=0;this.oPropagatedProperties=h._oEmptyPropagatedProperties;this.mSkipPropagation={};this.oModels={};this.oBindingContexts={};this.mElementBindingContexts={};this.mBindingInfos={};this.sBindingPath=null;this.mBindingParameters=null;this.mBoundObjects={};this._sOwnerId=h._sOwnerId;(function(){try{if(t.register){t.register();}if(t._initCompositeSupport){t._initCompositeSupport(s);}if(t.init){t.init();}t.applySettings(s,o);}catch(e){if(t.deregister){t.deregister();}throw e;}}());}},M);h.create=function(v,K,s){if(!v||v instanceof h||typeof v!=="object"||v instanceof String){return v;}function a(t){if(typeof t==="function"){return t;}if(typeof t==="string"){return q.sap.getObject(t);}}var c=a(v.Type)||a(K&&K.type);if(typeof c==="function"){return new c(v,s);}var m="Don't know how to create a ManagedObject from "+v+" ("+(typeof v)+")";q.sap.log.fatal(m);throw new Error(m);};var S;function j(i){if(!S){S=sap.ui.require("sap/ui/core/StashedControlSupport");}if(S){return S.getStashedControls(i);}return[];}h._fnIdPreprocessor=null;h._fnSettingsPreprocessor=null;h.runWithPreprocessors=function(a,p){var o={id:this._fnIdPreprocessor,settings:this._fnSettingsPreprocessor};p=p||{};this._fnIdPreprocessor=p.id;this._fnSettingsPreprocessor=p.settings;try{var r=a.call();this._fnIdPreprocessor=o.id;this._fnSettingsPreprocessor=o.settings;return r;}catch(e){this._fnIdPreprocessor=o.id;this._fnSettingsPreprocessor=o.settings;throw e;}};h.prototype.applySettings=function(s,o){if(!s||q.isEmptyObject(s)){return this;}var t=this,m=this.getMetadata(),v=m.getJSONKeys(),a=h.create,p=h._fnSettingsPreprocessor,K,c,e;function n(O){for(var i=0,u=O.length;i<u;i++){var w=O[i];if(Array.isArray(w)){n(w);}else{t[e._sMutator](a(w,e,o));}}}p&&p.call(this,s);if(s.models){if(typeof s.models!=="object"){throw new Error("models must be a simple object");}if(s.models instanceof f){this.setModel(s.models);}else{for(K in s.models){this.setModel(s.models[K],K==="undefined"?undefined:K);}}}if(s.bindingContexts){if(typeof s.bindingContexts!=="object"){throw new Error("bindingContexts must be a simple object");}if(s.bindingContexts instanceof d){this.setBindingContext(s.bindingContexts);}else{for(K in s.bindingContexts){this.setBindingContext(s.bindingContexts[K],K==="undefined"?undefined:K);}}}if(s.objectBindings){if(typeof s.objectBindings!=="string"&&typeof s.objectBindings!=="object"){throw new Error("binding must be a string or simple object");}if(typeof s.objectBindings==="string"||s.objectBindings.path){this.bindObject(s.objectBindings);}else{for(var K in s.objectBindings){s.objectBindings.model=K;this.bindObject(s.objectBindings[K]);}}}for(K in s){c=s[K];if((e=v[K])!==undefined){var r;switch(e._iKind){case 0:r=this.extractBindingInfo(c,o);if(r&&typeof r==="object"){this.bindProperty(K,r);}else{this[e._sMutator](r||c);}break;case 1:r=e.altTypes&&this.extractBindingInfo(c,o);if(r&&typeof r==="object"){this.bindProperty(K,r);}else{if(Array.isArray(c)){if(c.length>1){q.sap.log.error("Tried to add an array of controls to a single aggregation");}c=c[0];}this[e._sMutator](a(r||c,e,o));}break;case 2:r=this.extractBindingInfo(c,o);if(r&&typeof r==="object"){this.bindAggregation(K,r);}else{c=r||c;if(c){if(Array.isArray(c)){n(c);}else{t[e._sMutator](a(c,e,o));}}}break;case 3:this[e._sMutator](c);break;case 4:if(c){if(Array.isArray(c)){for(var i=0,l=c.length;i<l;i++){this[e._sMutator](c[i]);}}else{this[e._sMutator](c);}}break;case 5:if(typeof c=="function"){this[e._sMutator](c);}else{this[e._sMutator](c[0],c[1],c[2]);}break;case-1:default:break;}}else{}}return this;};h.prototype.toString=function(){return"ManagedObject "+this.getMetadata().getName()+"#"+this.getId();};h.prototype.getId=function(){return this.sId;};h.prototype.setProperty=function(p,v,s){var o=this.mProperties[p];v=this.validateProperty(p,v);if(q.sap.equal(o,v)){return this;}if(s){q.sap.act.refresh();this.iSuppressInvalidate++;}this.mProperties[p]=v;if(!this.isInvalidateSuppressed()){this.invalidate();}this.updateModelProperty(p,v,o);if(this.mEventRegistry["_change"]){E.prototype.fireEvent.call(this,"_change",{"id":this.getId(),"name":p,"oldValue":o,"newValue":v});}if(s){this.iSuppressInvalidate--;}return this;};h.prototype.getProperty=function(p){var v=this.mProperties[p],o=this.getMetadata().getProperty(p),t;if(!o){throw new Error("Property \""+p+"\" does not exist in "+this);}t=D.getType(o.type);if(t instanceof D&&t.isArrayType()&&q.isArray(v)){v=v.slice(0);}if(v instanceof String){v=v.valueOf();}return v;};h.prototype.validateProperty=function(p,v){var o=this.getMetadata().getProperty(p),t;if(!o){throw new Error("Property \""+p+"\" does not exist in "+this);}t=D.getType(o.type);if(t instanceof D&&t.isArrayType()&&q.isArray(v)){v=v.slice(0);}if(v===null||v===undefined){if(o.defaultValue!==null){v=o.defaultValue;}else{v=t.getDefaultValue();}}else if(t instanceof D){if(t.getName()=="string"){if(!(typeof v=="string"||v instanceof String)){v=""+v;}}else if(t.getName()=="string[]"){if(typeof v=="string"){v=[v];}if(!q.isArray(v)){throw new Error("\""+v+"\" is of type "+typeof v+", expected string[]"+" for property \""+p+"\" of "+this);}for(var i=0;i<v.length;i++){if(!typeof v[i]=="string"){v[i]=""+v[i];}}}else if(!t.isValid(v)){throw new Error("\""+v+"\" is of type "+typeof v+", expected "+t.getName()+" for property \""+p+"\" of "+this);}}if(t&&t.normalize&&typeof t.normalize==="function"){v=t.normalize(v);}return v;};h.prototype.getOriginInfo=function(p){var v=this.mProperties[p];if(!(v instanceof String&&v.originInfo)){return null;}return v.originInfo;};h.prototype.setAssociation=function(a,i,s){if(i instanceof h){i=i.getId();}else if(i!=null&&typeof i!=="string"){return this;}if(this.mAssociations[a]===i){return this;}if(s){this.iSuppressInvalidate++;}this.mAssociations[a]=i;if(!this.isInvalidateSuppressed()){this.invalidate();}if(s){this.iSuppressInvalidate--;}return this;};h.prototype.getAssociation=function(a,o){var r=this.mAssociations[a];if(!r){r=this.mAssociations[a]=o||null;}else{if(typeof r.length==='number'&&!(r.propertyIsEnumerable('length'))){return r.slice();}return r;}return r;};h.prototype.addAssociation=function(a,i,s){if(i instanceof h){i=i.getId();}else if(typeof i!=="string"){return this;}if(s){this.iSuppressInvalidate++;}var c=this.mAssociations[a];if(!c){c=this.mAssociations[a]=[i];}else{c.push(i);}if(!this.isInvalidateSuppressed()){this.invalidate();}if(s){this.iSuppressInvalidate--;}return this;};h.prototype.removeAssociation=function(a,o,s){var c=this.mAssociations[a];var e=null;if(!c){return null;}if(s){this.iSuppressInvalidate++;}if(typeof(o)=="object"&&o.getId){o=o.getId();}if(typeof(o)=="string"){for(var i=0;i<c.length;i++){if(c[i]==o){o=i;break;}}}if(typeof(o)=="number"){if(o<0||o>=c.length){q.sap.log.warning("ManagedObject.removeAssociation called with invalid index: "+a+", "+o);}else{e=c[o];c.splice(o,1);if(!this.isInvalidateSuppressed()){this.invalidate();}}}if(s){this.iSuppressInvalidate--;}return e;};h.prototype.removeAllAssociation=function(a,s){var i=this.mAssociations[a];if(!i){return[];}if(s){this.iSuppressInvalidate++;}delete this.mAssociations[a];if(!this.isInvalidateSuppressed()){this.invalidate();}if(s){this.iSuppressInvalidate--;}return i;};h.prototype.validateAggregation=function(a,o,m){var c=this.getMetadata(),A=c.getManagedAggregation(a),e,t,i,l;if(!A){throw new Error("Aggregation \""+a+"\" does not exist in "+this);}if(A.multiple!==m){throw new Error("Aggregation '"+a+"' of "+this+" used with wrong cardinality (declared as "+(A.multiple?"0..n":"0..1")+")");}if(!A.multiple&&!o){return o;}t=q.sap.getObject(A.type);if(typeof t==="function"&&o instanceof t){return o;}if(o&&o.getMetadata&&o.getMetadata().isInstanceOf(A.type)){return o;}e=A.altTypes;if(e&&e.length){if(o==null){return o;}for(i=0;i<e.length;i++){t=D.getType(e[i]);if(t instanceof D){if(t.isValid(o)){return o;}}}}l="\""+o+"\" is not valid for aggregation \""+a+"\" of "+this;if(D.isInterfaceType(A.type)){return o;}else{throw new Error(l);}};h.prototype.setAggregation=function(a,o,s){var O=this.mAggregations[a];if(O===o){return this;}o=this.validateAggregation(a,o,false);if(s){this.iSuppressInvalidate++;}if(O instanceof h){O.setParent(null);}this.mAggregations[a]=o;if(o instanceof h){o.setParent(this,a,s);}else{if(!this.isInvalidateSuppressed()){this.invalidate();}}if(s){this.iSuppressInvalidate--;}return this;};h.prototype.getAggregation=function(a,o){var c=this.mAggregations[a];if(!c){c=this.mAggregations[a]=o||null;}if(c){if(typeof c.length==='number'&&!(c.propertyIsEnumerable('length'))){return c.slice();}return c;}else{return null;}};h.prototype.indexOfAggregation=function(a,o){var c=this.mAggregations[a];if(c){if(c.length==undefined){return-2;}for(var i=0;i<c.length;i++){if(c[i]==o){return i;}}}return-1;};h.prototype.insertAggregation=function(a,o,c,s){if(!o){return this;}o=this.validateAggregation(a,o,true);var e=this.mAggregations[a]||(this.mAggregations[a]=[]);var i;if(c<0){i=0;}else if(c>e.length){i=e.length;}else{i=c;}if(i!==c){q.sap.log.warning("ManagedObject.insertAggregation: index '"+c+"' out of range [0,"+e.length+"], forced to "+i);}e.splice(i,0,o);o.setParent(this,a,s);return this;};h.prototype.addAggregation=function(a,o,s){if(!o){return this;}o=this.validateAggregation(a,o,true);var c=this.mAggregations[a];if(!c){c=this.mAggregations[a]=[o];}else{c.push(o);}o.setParent(this,a,s);return this;};h.prototype.removeAggregation=function(a,o,s){var c=this.mAggregations[a],e=null,i;if(!c){return null;}if(s){this.iSuppressInvalidate++;}if(typeof(o)=="string"){for(i=0;i<c.length;i++){if(c[i]&&c[i].getId()===o){o=i;break;}}}if(typeof(o)=="object"){for(i=0;i<c.length;i++){if(c[i]==o){o=i;break;}}}if(typeof(o)=="number"){if(o<0||o>=c.length){q.sap.log.warning("ManagedObject.removeAggregation called with invalid index: "+a+", "+o);}else{e=c[o];c.splice(o,1);e.setParent(null);if(!this.isInvalidateSuppressed()){this.invalidate();}}}if(s){this.iSuppressInvalidate--;}return e;};h.prototype.removeAllAggregation=function(a,s){var c=this.mAggregations[a];if(!c){return[];}if(s){this.iSuppressInvalidate++;}delete this.mAggregations[a];for(var i=0;i<c.length;i++){c[i].setParent(null);}if(!this.isInvalidateSuppressed()){this.invalidate();}if(s){this.iSuppressInvalidate--;}return c;};h.prototype.destroyAggregation=function(a,s){var e=this.mAggregations[a],i,l;j(this.getId()).forEach(function(c){if(c.sParentAggregationName===a){c.destroy();}});if(!e){return this;}if(s){this.iSuppressInvalidate++;}delete this.mAggregations[a];if(e instanceof h){e.destroy(s);}else if(q.isArray(e)){for(i=e.length-1;i>=0;i--){l=e[i];if(l){l.destroy(s);}}}if(!this.isInvalidateSuppressed()){this.invalidate();}if(s){this.iSuppressInvalidate--;}return this;};h.prototype.invalidate=function(){if(this.oParent){this.oParent.invalidate(this);}};h.prototype.isInvalidateSuppressed=function(){var i=this.iSuppressInvalidate>0;if(this.oParent&&this.oParent instanceof h){i=i||this.oParent.isInvalidateSuppressed();}return i;};h.prototype._removeChild=function(c,a,s){if(!a){q.sap.log.error("Cannot remove aggregated child without aggregation name.",null,this);}else{if(s){this.iSuppressInvalidate++;}var i=this.indexOfAggregation(a,c);var A=this.getMetadata().getAggregation(a);if(i==-2){if(A&&this[A._sMutator]){this[A._sMutator](null);}else{this.setAggregation(a,null,s);}}else if(i>-1){if(A&&this[A._sRemoveMutator]){this[A._sRemoveMutator](i);}else{this.removeAggregation(a,i,s);}}if(!this.isInvalidateSuppressed()){this.invalidate();}if(s){this.iSuppressInvalidate--;}}};h.prototype.setParent=function(p,a,s){if(!p){this.oParent=null;this.sParentAggregationName=null;this.oPropagatedProperties=h._oEmptyPropagatedProperties;if(!this._bIsBeingDestroyed){setTimeout(function(){if(!this.oParent){this.updateBindings(true,null);this.updateBindingContext(false,undefined,true);this.propagateProperties(true);}}.bind(this),0);}q.sap.act.refresh();return;}if(s){q.sap.act.refresh();this.iSuppressInvalidate++;}var o=this.getParent();if(o){o._removeChild(this,this.sParentAggregationName);}this.oParent=p;this.sParentAggregationName=a;this.oPropagatedProperties=p._getPropertiesToPropagate();if(this.hasModel()){this.updateBindings(true,null);this.updateBindingContext(false,undefined,true);this.propagateProperties(true);}if(p&&!this.isInvalidateSuppressed()){p.invalidate(this);}if(s){this.iSuppressInvalidate--;}return this;};h.prototype.getParent=function(){return this.oParent;};h.prototype.destroy=function(s){var t=this;this._bIsBeingDestroyed=true;if(s){this.iSuppressInvalidate++;}if(this.exit){this.exit();}if(this._exitCompositeSupport){this._exitCompositeSupport();}for(var a in this.mAggregations){this.destroyAggregation(a,s);}j(this.getId()).forEach(function(c){c.destroy();});if(this.deregister){this.deregister();}if(this.oParent&&this.sParentAggregationName){this.oParent._removeChild(this,this.sParentAggregationName,s);}delete this.oParent;q.each(this.mBindingInfos,function(n,o){if(o.factory){t.unbindAggregation(n,true);}else{t.unbindProperty(n,true);}});q.each(this.mBoundObjects,function(n,o){t.unbindObject(n,true);});if(s){this.iSuppressInvalidate--;}E.prototype.destroy.apply(this,arguments);this.setParent=function(){throw Error("The object with ID "+t.getId()+" was destroyed and cannot be used anymore.");};this.bIsDestroyed=true;};h.bindingParser=B.simpleParser;h.prototype.isBinding=function(v,K){return typeof this.extractBindingInfo(v)==="object";};h.prototype.extractBindingInfo=function(v,s){if(v&&typeof v==="object"){if(v.ui5object){delete v.ui5object;}else if(v.path!=undefined||v.parts){if(v.template){v.template=h.create(v.template);}return v;}}if(typeof v==="string"){return h.bindingParser(v,s,true);}};h.prototype.getBindingInfo=function(n){return this.mBindingInfos[n];};h.prototype.bindObject=function(p,m){var a={},s,i;if(typeof p=="object"){var o=p;p=o.path;m=o.parameters;s=o.model;a.events=o.events;}i=p.indexOf(">");a.sBindingPath=p;a.mBindingParameters=m;if(i>0){s=p.substr(0,i);a.sBindingPath=p.substr(i+1);}if(this.mBoundObjects[s]){this.unbindObject(s,true);}this.mBoundObjects[s]=a;if(this.getModel(s)){this._bindObject(s,a);}return this;};h.prototype._bindObject=function(m,o){var a,c,e,t=this;var i=function(l){if(a.getBoundContext()===t.getBindingContext(m)){t.setElementBindingContext(null,m);}t.setElementBindingContext(a.getBoundContext(),m);};e=this.getModel(m);c=this.getBindingContext(m);a=e.bindContext(o.sBindingPath,c,o.mBindingParameters);a.attachChange(i);o.binding=a;o.fChangeHandler=i;a.attachEvents(o.events);a.initialize();};h.prototype.bindContext=function(p){return this.bindObject(p);};h.prototype.unbindContext=function(m){return this.unbindObject(m);};h.prototype.unbindObject=function(m,_){var o=this.mBoundObjects[m];if(o){if(o.binding){o.binding.detachChange(o.fChangeHandler);o.binding.detachEvents(o.events);o.binding.destroy();}delete this.mBoundObjects[m];delete this.mElementBindingContexts[m];if(!_){this.updateBindingContext(false,m);this.propagateProperties(m);}}return this;};h.prototype.bindProperty=function(n,o,_,a){var s,A=true,p=this.getMetadata().getPropertyLikeSetting(n);if(!p){throw new Error("Property \""+n+"\" does not exist in "+this);}if(typeof o=="string"){o={parts:[{path:o,type:_ instanceof g?_:undefined,mode:a}],formatter:typeof _==='function'?_:undefined};}if(!o.parts){o.parts=[];o.parts[0]={path:o.path,type:o.type,formatOptions:o.formatOptions,constraints:o.constraints,model:o.model,mode:o.mode};delete o.path;delete o.mode;delete o.model;}for(var i=0;i<o.parts.length;i++){var c=o.parts[i];if(typeof c=="string"){c={path:c};o.parts[i]=c;}s=c.path.indexOf(">");if(s>0){c.model=c.path.substr(0,s);c.path=c.path.substr(s+1);}if(o.formatter&&c.mode!=b.OneWay&&c.mode!=b.OneTime){c.mode=b.OneWay;}if(!this.getModel(c.model)){A=false;}}if(this.isBound(n)){this.unbindProperty(n,true);}this.mBindingInfos[n]=o;if(A){this._bindProperty(n,o);}return this;};h.prototype._bindProperty=function(n,o){var m,c,a,s,e=b.TwoWay,t,l,p=this.getMetadata().getPropertyLikeSetting(n),r=p._iKind===0?p.type:p.altTypes[0],u=this,v=[],w=function(i){u.updateProperty(n);var y=a.getDataState();if(y){var z=y.getControlMessages();if(z&&z.length>0){var A=sap.ui.getCore().getMessageManager();y.setControlMessages([]);if(z){A.removeMessages(z);}}y.setInvalidValue(null);}if(a.getBindingMode()===b.OneTime&&a.isResolved()){a.detachChange(w);a.detachEvents(o.events);a.destroy();}},x=function(){var i=a.getDataState();if(!i){return;}if(u.refreshDataState){u.refreshDataState(n,i);}};c=this.getBindingContext(o.model);q.each(o.parts,function(i,y){c=u.getBindingContext(y.model);m=u.getModel(y.model);t=y.type;if(typeof t=="string"){l=q.sap.getObject(t);t=new l(y.formatOptions,y.constraints);}a=m.bindProperty(y.path,c,o.parameters);a.setType(t,r);a.setFormatter(y.formatter);s=y.mode||m.getDefaultBindingMode();a.setBindingMode(s);if(s!=b.TwoWay){e=b.OneWay;}v.push(a);});if(v.length>1||(o.formatter&&o.formatter.textFragments)){t=o.type;if(typeof t=="string"){l=q.sap.getObject(t);t=new l(o.formatOptions,o.constraints);}a=new C(v,o.useRawValues);a.setType(t,r);a.setBindingMode(o.mode||e);}else{a=v[0];}a.attachChange(w);if(this.refreshDataState){a.attachAggregatedDataStateChange(x);}a.setFormatter(q.proxy(o.formatter,this));o.binding=a;o.modelChangeHandler=w;o.dataStateChangeHandler=x;a.attachEvents(o.events);a.initialize();};h.prototype.unbindProperty=function(n,s){var o=this.mBindingInfos[n],p=this.getMetadata().getPropertyLikeSetting(n);if(o){if(o.binding){o.binding.detachChange(o.modelChangeHandler);if(this.refreshDataState){o.binding.detachAggregatedDataStateChange(o.dataStateChangeHandler);}o.binding.detachEvents(o.events);o.binding.destroy();}delete this.mBindingInfos[n];if(!s){this[p._sMutator](null);}}return this;};h.prototype.updateProperty=function(n){var o=this.mBindingInfos[n],a=o.binding,p=this.getMetadata().getPropertyLikeSetting(n);if(o.skipPropertyUpdate){return;}try{var v=a.getExternalValue();o.skipModelUpdate=true;this[p._sMutator](v);o.skipModelUpdate=false;}catch(e){o.skipModelUpdate=false;if(e instanceof F){this.fireFormatError({element:this,property:n,type:a.getType(),newValue:a.getValue(),oldValue:this[p._sGetter](),exception:e,message:e.message},false,true);o.skipModelUpdate=true;this[p._sMutator](null);o.skipModelUpdate=false;}else{throw e;}}};h.prototype.updateModelProperty=function(n,v,o){if(this.isBound(n)){var a=this.mBindingInfos[n],c=a.binding;if(a.skipModelUpdate){return;}if(c&&c.getBindingMode()==b.TwoWay){try{a.skipPropertyUpdate=true;c.setExternalValue(v);a.skipPropertyUpdate=false;var e=c.getExternalValue();if(v!=e){this.updateProperty(n);}if(c.hasValidation()){this.fireValidationSuccess({element:this,property:n,type:c.getType(),newValue:v,oldValue:o},false,true);}}catch(i){a.skipPropertyUpdate=false;if(i instanceof P){this.fireParseError({element:this,property:n,type:c.getType(),newValue:v,oldValue:o,exception:i,message:i.message},false,true);}else if(i instanceof V){this.fireValidationError({element:this,property:n,type:c.getType(),newValue:v,oldValue:o,exception:i,message:i.message},false,true);}else{throw i;}}}}};var k=1;h.prototype.bindAggregation=function(n,o){var p,t,s,a,m=this.getMetadata(),A=m.getAggregation(n);if(!A){throw new Error("Aggregation \""+n+"\" does not exist in "+this);}if(!A.multiple){q.sap.log.error("Binding of single aggregation \""+n+"\" of "+this+" is not supported!");}if(typeof o=="string"){p=arguments[1];t=arguments[2];s=arguments[3];a=arguments[4];o={path:p,sorter:s,filters:a};if(t instanceof h){o.template=t;}else if(typeof t==="function"){o.factory=t;}}if(this.isBound(n)){this.unbindAggregation(n);}if(!(o.template||o.factory)){if(A._doesNotRequireFactory){o.factory=function(){throw new Error("dummy factory called unexpectedly ");};}else{throw new Error("Missing template or factory function for aggregation "+n+" of "+this+" !");}}if(o.template){if(o.template._sapui_candidateForDestroy){q.sap.log.warning("A template was reused in a binding, but was already marked as candidate for destroy. You better should declare such a usage with templateShareable:true in the binding configuration.");delete o.template._sapui_candidateForDestroy;}if(o.templateShareable===undefined){o.templateShareable=k;}o.factory=function(c){return o.template.clone(c);};}var i=o.path.indexOf(">");if(i>0){o.model=o.path.substr(0,i);o.path=o.path.substr(i+1);}this.mBindingInfos[n]=o;if(this.getModel(o.model)){this._bindAggregation(n,o);}return this;};h.prototype._bindAggregation=function(n,o){var t=this,a,m=function(i){var u="update"+n.substr(0,1).toUpperCase()+n.substr(1);if(t[u]){var s=i&&i.getParameter("reason");if(s){t[u](s);}else{t[u]();}}else{t.updateAggregation(n);}},c=function(i){var r="refresh"+n.substr(0,1).toUpperCase()+n.substr(1);if(t[r]){t[r](i.getParameter("reason"));}else{m(i);}};var e=this.getModel(o.model);if(this.isTreeBinding(n)){a=e.bindTree(o.path,this.getBindingContext(o.model),o.filters,o.parameters,o.sorter);}else{a=e.bindList(o.path,this.getBindingContext(o.model),o.sorter,o.filters,o.parameters);}if(this.bUseExtendedChangeDetection===true){a.enableExtendedChangeDetection();}o.binding=a;o.modelChangeHandler=m;o.modelRefreshHandler=c;a.attachChange(m);a.attachRefresh(c);a.attachEvents(o.events);a.initialize();};h.prototype.unbindAggregation=function(n,s){var o=this.mBindingInfos[n],a=this.getMetadata().getAggregation(n);if(o){if(o.binding){o.binding.detachChange(o.modelChangeHandler);o.binding.detachRefresh(o.modelRefreshHandler);o.binding.detachEvents(o.events);o.binding.destroy();}if(o.template){if(!o.templateShareable&&o.template.destroy){o.template.destroy();}if(o.templateShareable===k){o.template._sapui_candidateForDestroy=true;}}delete this.mBindingInfos[n];if(!s){this[a._sDestructor]();}}return this;};h.prototype.updateAggregation=function(n){var o=this.mBindingInfos[n],a=o.binding,c=o.factory,A=this.getMetadata().getAggregation(n),G,e,l,s=A._sMutator+"Group",t=this;function u(r,l,v,w){var x=r[A._sGetter]()||[],y,z;if(x.length>l.length){for(var i=l.length;i<x.length;i++){r[A._sRemoveMutator](x[i]);x[i].destroy();}}for(var i=0;i<l.length;i++){y=l[i];z=x[i];if(v){v(y);}if(z){z.setBindingContext(y,o.model);}else{var H=r.getId()+"-"+i;z=c(H,y);z.setBindingContext(y,o.model);r[A._sMutator](z);}if(w){w(y,z);}}}function m(i){var N=a.getGroup(i);if(N.key!==G){var r;if(o.groupHeaderFactory){r=o.groupHeaderFactory(N);}t[s](N,r);G=N.key;}}function p(i,r){u(i,r,null,function(v,w){p(w,a.getNodeContexts(v));});}if(!o.template){this[A._sDestructor]();}if(a instanceof L){e=a.isGrouped()&&s;if(e||a.bWasGrouped){this[A._sDestructor]();}a.bWasGrouped=e;l=a.getContexts(o.startIndex,o.length);u(this,l,e?m:null);}else if(a instanceof T){p(this,a.getRootContexts());}};h.prototype.refreshAggregation=function(n){var o=this.mBindingInfos[n],a=o.binding;a.getContexts(o.startIndex,o.length);};h.prototype.propagateMessages=function(n,m){q.sap.log.warning("Message for "+this+", Property "+n);};h.prototype.isTreeBinding=function(n){return false;};h.prototype.updateBindings=function(u,m){var t=this,n,o;function a(o){var p=o.parts,i;if(p&&p.length>1){for(i=0;i<p.length;i++){if((u||p[i].model==m)&&!o.binding.aBindings[i].updateRequired(t.getModel(p[i].model))){return true;}}}else if(o.factory){return(u||o.model==m)&&!o.binding.updateRequired(t.getModel(o.model));}else{return(u||p[0].model==m)&&!o.binding.updateRequired(t.getModel(p[0].model));}return false;}function c(o){var p=o.parts,i;if(p){for(i=0;i<p.length;i++){if(!t.getModel(p[i].model)){return false;}}return true;}else if(o.factory){return!!t.getModel(o.model);}return false;}for(n in this.mBindingInfos){o=this.mBindingInfos[n];if(o.binding&&a(o)){if(this.refreshDataState){this.refreshDataState(n,o.binding.getDataState());}o.binding.detachChange(o.modelChangeHandler);if(o.modelRefreshHandler){o.binding.detachRefresh(o.modelRefreshHandler);}o.binding.detachEvents(o.events);o.binding.destroy();delete o.binding;delete o.modelChangeHandler;delete o.dataStateChangeHandler;delete o.modelRefreshHandler;}if(!o.binding&&c(o)){if(o.factory){this._bindAggregation(n,o);}else{this._bindProperty(n,o);}}}};h.prototype.isBound=function(n){return(n in this.mBindingInfos);};h.prototype.getObjectBinding=function(m){return this.mBoundObjects[m]&&this.mBoundObjects[m].binding;};h.prototype.getEventingParent=function(){return this.oParent;};h.prototype.getBinding=function(n){return this.mBindingInfos[n]&&this.mBindingInfos[n].binding;};h.prototype.getBindingPath=function(n){var i=this.mBindingInfos[n];return i&&(i.path||(i.parts&&i.parts[0]&&i.parts[0].path));};h.prototype.setBindingContext=function(c,m){var o=this.oBindingContexts[m];if(o!==c){this.oBindingContexts[m]=c;this.updateBindingContext(false,m);this.propagateProperties(m);}return this;};h.prototype.setElementBindingContext=function(c,m){var o=this.mElementBindingContexts[m];if(o!==c){this.mElementBindingContexts[m]=c;this.updateBindingContext(true,m);this.propagateProperties(m);}return this;};h.prototype.updateBindingContext=function(s,a,u){var m,o={},c,e,n,l,i;if(u){for(c in this.oModels){if(this.oModels.hasOwnProperty(c)){o[c]=c;}}for(c in this.oPropagatedProperties.oModels){if(this.oPropagatedProperties.oModels.hasOwnProperty(c)){o[c]=c;}}}else{o[a]=a;}for(c in o){if(o.hasOwnProperty(c)){c=c==="undefined"?undefined:c;m=this.getModel(c);l=this.mBoundObjects[c];if(m&&l&&l.sBindingPath&&!s){if(!l.binding){this._bindObject(c,l);}else{e=this._getBindingContext(c);if(e!==l.binding.getContext()){l.binding.setContext(e);}}continue;}e=this.getBindingContext(c);for(n in this.mBindingInfos){var p=this.mBindingInfos[n],r=p.binding,t=p.parts;if(!r){continue;}if(t&&t.length>1){for(i=0;i<t.length;i++){if(t[i].model==c){r.aBindings[i].setContext(e);}}}else if(p.factory){if(p.model==c){r.setContext(e);}}else{if(t[0].model==c){r.setContext(e);}}}}}};h.prototype.getBindingContext=function(m){if(this.mElementBindingContexts[m]){return this.mElementBindingContexts[m];}return this._getBindingContext(m);};h.prototype._getBindingContext=function(m){var o=this.getModel(m);if(this.oBindingContexts[m]){return this.oBindingContexts[m];}else if(o&&this.oParent&&this.oParent.getModel(m)&&o!=this.oParent.getModel(m)){return undefined;}else{return this.oPropagatedProperties.oBindingContexts[m];}};h.prototype.setModel=function(m,n){if(!m&&this.oModels[n]){delete this.oModels[n];this.propagateProperties(n);this.updateBindings(false,n);}else if(m&&m!==this.oModels[n]){this.oModels[n]=m;this.propagateProperties(n);this.updateBindingContext(false,n);this.updateBindings(false,n);}return this;};h._oEmptyPropagatedProperties={oModels:{},oBindingContexts:{}};h.prototype.propagateProperties=function(n){var p=this._getPropertiesToPropagate(),u=n===true,N=u?undefined:n,a,A,i;for(a in this.mAggregations){if(this.mSkipPropagation[a]){continue;}A=this.mAggregations[a];if(A instanceof h){this._propagateProperties(n,A,p,u,N);}else if(A instanceof Array){for(i=0;i<A.length;i++){if(A[i]instanceof h){this._propagateProperties(n,A[i],p,u,N);}}}}};h.prototype._propagateProperties=function(n,o,p,u,N){if(!p){p=this._getPropertiesToPropagate();u=n===true;N=u?undefined:n;}if(o.oPropagatedProperties!==p){o.oPropagatedProperties=p;o.updateBindings(u,N);o.updateBindingContext(false,N,u);o.propagateProperties(n);}};h.prototype._getPropertiesToPropagate=function(){var n=q.isEmptyObject(this.oModels),N=q.isEmptyObject(this.oBindingContexts),a=q.isEmptyObject(this.mElementBindingContexts);function m(e,o,c,i){return e?o:q.extend({},o,c,i);}if(N&&n&&a){return this.oPropagatedProperties;}else{return{oModels:m(n,this.oPropagatedProperties.oModels,this.oModels),oBindingContexts:m((N&&a),this.oPropagatedProperties.oBindingContexts,this.oBindingContexts,this.mElementBindingContexts)};}};h.prototype.getModel=function(n){return this.oModels[n]||this.oPropagatedProperties.oModels[n];};h.prototype.hasModel=function(){return!(q.isEmptyObject(this.oModels)&&q.isEmptyObject(this.oPropagatedProperties.oModels));};h.prototype.clone=function(s,a,o){var c=true,e=true;if(o){c=!!o.cloneChildren;e=!!o.cloneBindings;}if(!s){s=M.uid("clone")||q.sap.uid();}if(!a&&c){a=q.map(this.findAggregatedObjects(true),function(O){return O.getId();});}var m=this.getMetadata(),n=m._oClass,p=this.getId()+"-"+s,r={},t=this.mProperties,K,N,u,v=h.bindingParser.escape,i;var w=Object.keys(t);i=w.length;while(i>0){K=w[--i];if(!(this.isBound(K)&&e)){if(typeof t[K]==="string"){r[K]=v(t[K]);}else{r[K]=t[K];}}}r["models"]=this.oModels;r["bindingContexts"]=this.oBindingContexts;if(c){for(N in this.mAggregations){var A=this.mAggregations[N];if(m.hasAggregation(N)&&!(this.isBound(N)&&e)){if(A instanceof h){r[N]=A.clone(s,a);}else if(q.isArray(A)){r[N]=[];for(var i=0;i<A.length;i++){r[N].push(A[i].clone(s,a));}}else{r[N]=A;}}}var x=j(this.getId());for(var i=0,l=x.length;i<l;i++){var y=x[i].clone(s);y.sParentId=p;y.sParentAggregationName=x[i].sParentAggregationName;}for(N in this.mAssociations){var z=this.mAssociations[N];if(q.isArray(z)){z=z.slice(0);for(var i=0;i<z.length;i++){if(q.inArray(z[i],a)>=0){z[i]+="-"+s;}}}else if(q.inArray(z,a)>=0){z+="-"+s;}r[N]=z;}}u=new n(p,r);for(N in this.mBoundObjects){u.mBoundObjects[N]=q.extend({},this.mBoundObjects[N]);}for(N in this.mEventRegistry){u.mEventRegistry[N]=this.mEventRegistry[N].slice();}if(e){for(N in this.mBindingInfos){var G=this.mBindingInfos[N];var H=q.extend({},G);if(!G.templateShareable&&G.template&&G.template.clone){H.template=G.template.clone(s,a);delete H.factory;}else if(G.templateShareable===k){G.templateShareable=H.templateShareable=true;q.sap.log.error("A shared template must be marked with templateShareable:true in the binding info");}delete H.binding;delete H.modelChangeHandler;delete H.dataStateChangeHandler;delete H.modelRefreshHandler;if(G.factory||G.template){u.bindAggregation(N,H);}else{u.bindProperty(N,H);}}}return u;};h._handleLocalizationChange=function(p){var i;if(p===1){q.each(this.oModels,function(n,m){if(m&&m._handleLocalizationChange){m._handleLocalizationChange();}});}else if(p===2){q.each(this.mBindingInfos,function(n,o){var a=o.parts;if(a){for(i=0;i<a.length;i++){if(o.type&&o.type._handleLocalizationChange){o.type._handleLocalizationChange();}}if(o.modelChangeHandler){o.modelChangeHandler();}}});}};h.prototype.findAggregatedObjects=function(r,c){var A=[];if(c&&!typeof c==="function"){c=null;}function e(o){for(var n in o.mAggregations){var a=o.mAggregations[n];if(q.isArray(a)){for(var i=0;i<a.length;i++){if(!c||c(a[i])){A.push(a[i]);}if(r){e(a[i]);}}}else if(a instanceof h){if(!c||c(a)){A.push(a);}if(r){e(a);}}}}e(this);return A;};return h;});