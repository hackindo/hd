
/*
CodeName: HDjs(Hackindo Javascript Framework)
version: Alpha
Contributor: Muhammad Farid Wajdi
website: www.hackindo.com
holla world
*/
(function(){  
window.hd={
	version:'Hackindo Javascript Framework alpha'
};

// hd database
hd.data = {};

// regular expressions 
hd.data={
	regex:{
		cssStyles:'([a-z]|-)*:.[^;\\n]*;?',// css property and value(eg background-color:#44444 etc)
		cssRule:'((-|:|\\.|#)*?\\w)*{(.|\\n)[^\\}]*}', // css rule (eg div#ele{color:red;font-size:20px})
		cssUnit:'(em|ex|%|px|cm|mm|in|pt|pc)', // css unit (eg 3px or 2em or 100%)
		floatNumber:'((\\d+)?(\\.(?=\\d))+?\\d+|\\d(?!\\.))+', // float and number 
		node:'^<([A-Z][A-Z0-9]*)\\b[^>]*>(.*?)<\\/\\1>', // html/xml node pattern
		ip:'\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b' // ip address
	}
};

// this jql object is intended for patching to the results of jql(javascript query language)
hd.jql = {
	// begin of Javascript Query Functions 
	query:function(q){
		// get elements and returns array
		if(typeof q === 'string'){
			var ele = this instanceof NodeList || this instanceof Array?this[0]:!this.ownerDocument?document:this,
			eles;
			if(ele === document && q.match(/^<.*\/>$/gi)){
				// if q match html tag and the root is document then parse q to html elements
				// create element
				var tag = q.replace(/^<(\w+).*/i,'$1'),
				att = q.match(/(\w\d?)+=".[^"]*"/gi),
				ele = hd.patch(document.createElement(tag));
				if(att){
					for(var i=0;i<att.length;i++){
						var at = att[i].replace(/(\w+\d?)=.*/i,'$1'),
						value = att[i].replace(/\w+\d?="(.*)"/i,'$1');
						ele.atb(at,value);
					}
				}		
				tag = att = null;
				eles=ele;
			}else if(ele === document && q.match(new RegExp(hd.data.regex.node,'gi'))){
				var x = q.match(new RegExp(hd.data.regex.node,'i'))[0],
				f = x.replace(/\n+|\s{2,}|\t/g,''),
				tag = f.replace(/^<([a-z0-9]+).*/i,'$1'),
				att = f.replace(/^<[a-z0-9]+(.[^>]*)>.*/gi,'$1').match(/(\w\d?)+=".[^"]*"/gi),
				ele = hd.patch(document.createElement(tag));
				ele.innerHTML = f.replace(/<([A-Z][A-Z0-9]*)\b[^>]*>(.*?)<\/\1>/i,'$2');
				if(att){
					for(var i=0;i<att.length;i++){
						var at = att[i].replace(/(\w+\d?)=.*/i,'$1'),
						value = att[i].replace(/\w+\d?="(.*)"/i,'$1');
						ele.atb(at,value);
					}
				}	
				eles=ele;
			}else{
				try {
					eles = ele.querySelectorAll(q);
					if(eles.length<=0) eles = null
				} catch (error) {
					eles=null;
				}
			}
			
			if(eles){
				hd.patch(eles);
				for(var i=0;i<eles.length;i++){
					hd.patch(eles[i]);
				}
			}
			
			container = null;
			return eles;
		}else if(typeof q === 'object'){
			if(q.ownerDocument||q===document)return hd.patch(q);			
		}
		
		return null;
	},
	each:function(fn){
		if('function' !== typeof fn) return false;
		if(typeof this.length === 'undefined') return;
		for (var i=0;i<this.length;i++) {
			fn.call(this[i],i,this[i]);
		}
	},
	first:function(){
		return this[0];
	},
	last:function(){
		return this.length-1;
	},
	items:function(i){
		if(typeof i === 'number') return this[i];	
	},
	addChild:function(e,index){
		if(e==null) return;
		var parent = this instanceof NodeList?this[0]:this instanceof Array?this[0].parentNode:this,
		ele;
			
		if(typeof e.style !== 'undefined'){
			ele = e;
		}
		
		if(ele==null) return;
		
		index = index === 0?'first':index >= parent.childs().length?'end':index;
		
		if(typeof index ==='string'){
			if(index.match(/first/i)){
				parent.insertBefore(ele, parent.childs(0));
			}else{
				parent.appendChild(ele);
			}
		}else if(typeof index ==='number'){
			parent.insertBefore(ele, parent.childs(index));
		}else{
			parent.appendChild(ele);
		}
	},
	childs:function(idx){
		// get child element of an element
		if(idx !=null && typeof idx !== 'number') return null;
		var ele =this instanceof NodeList || this instanceof Array?this[0]:this;
		if(!ele.style) return null;
		var q = ele.query('*'),
		ch = [];
		q.each(function(i,e){
			if(q[i].parentNode == ele) ch.push(q[i]);
		}.bind(ele));
		
		for(var a=0;a<ch.length;a++){
			hd.patch(ch[a])
		}
		
		return hd.patch((idx!=null?ch[idx]:ch));
	},
	atb:function(e,v){
	// e = attribute name, v = value
	/* if value is not give then this will return the current value */
		if(e == null || typeof e !== 'string') return false;
		var ele = this instanceof NodeList || this instanceof Array?this[0]:this;
		if(v !=null){
		  ele.setAttribute(e,v);
		}else{
		  return ele.getAttribute(e);
		}
	},
	css:function (u){
		if (typeof(u) !== "string" || u == "") return;
		var ele = this instanceof NodeList || this instanceof Array?this[0]:this;
		var x = /(-|)[a-z-A-Z-0-9]*(\s|)\:(\s|){1,}[a-z-0-9"':\.()=,%\s_#/+?&!]*/gi;
		var A = /^[a-z-0-9]*:/i;
		var m = ele.atb("style") != null ? ele.atb("style").match(x) : null;
		var l = u.match(x);
		var z = [];
	
		if (!l)return;
		
		if (m == null) {
			this.atb("style", u)
		} else {
			for (var o = 0; o < l.length; o++) {
				var e = l[o].replace(/\s*/gi, "").match(A);
				for (var y = 0; y < m.length; y++) {
					var p = m[y].replace(/\s*/gi, "").match(A);
					if (e[0] == p[0]) {
						m[y] = l[o];
						break
					}
					if (y >= (m.length - 1)) {
						z.push(l[o])
					}
				}
			}
			var t = m.concat(z);
			var w = "";
			for (var o = 0; o < t.length; o++) {
				w += t[o] + ";"
			}
			ele.atb("style", w);
			e, u, w, t, o, m, z, y = null
		}
	},
	on:function(name,fn,capture){ // add event handler
		if('function' !== typeof fn || typeof name !== 'string') return false;
		var ele = this instanceof NodeList || this instanceof Array?this[0]:this,
		capture = typeof capture === 'boolean'?capture:false;
		ele.data.events.push({name:name,fn:fn});		
		ele.addEventListener(name,fn,capture);
	},
	off:function(name, fn){ // remove an event handler
		if('function' !== typeof fn || typeof name !== 'string') return;
		var ele = this instanceof NodeList || this instanceof Array?this[0]:this;
		for(var i=0;i<this.data.events.length;i++){
			if(this.data.events[i].name == name && this.data.events[i].fn ==fn)this.data.events.splice(i,1);
		}
		this.removeEventListener(name,fn);
	},
	clearEvents:function(){
		var ele = this instanceof NodeList || this instanceof Array?this[0]:this;
		if(!ele.events) return;
		for(var i=0;i<ele.events.length;i++){
			ele.removeEventListener(ele.events[i].name,ele.events[i].fn);
		}
	},
	clearListeners:function(name){
		var ele = this instanceof NodeList || this instanceof Array?this[0]:this;
		if(!ele.events) return;
		for(var i=0;i<ele.events.length;i++){
			if(ele.events[i].name == name) ele.removeEventListener(name,ele.events[i].fn);
		}
	},
	html:function(v){
		if(v!=null&&typeof v ==='string'){
			this.innerHTML = v
		}else{
			return this.innerHTML;
		}
	}
};

//patch hd's libs
hd.patch = function(e){
	if(!e) return null;
	if(e.isHD) return e;
	for(var i in hd.jql){
		if(i.match(/html|text/gi) && (e instanceof NodeList||e instanceof Array) || // skip item for NodeList
			i.match(/items|last|first/gi) && (e instanceof Element)) // skip item for Element
			 continue;
		e[i] = hd.jql[i];
	}
	e.data = {
		events:[],
		animations:[]
	};
	e.isHD = true;
	return e;
};

// root commands
hd.fn = {
	log:function(s){
		if(typeof console !== 'undefined'){
	      console.log(s);
	    }else{
	      alert(s);
	    }
	},
	ready:function(fn){
		// document ready function
		
	},
	_string:{
		parseHTML:function(v){
			if(typeof v !== 'string') return null;
			var f = v.replace(/\n+|\s{2,}|\t/g,'');
			if(f.match(new RegExp(hd.data.regex.node,'gim'))){
				var container = hd.patch(document.createElement('div'));
				container.html(f);
				for(var i=0;i<container.childNodes.length;i++){
					if(container.childNodes[i].style) hd.patch(container.childNodes[i])
				}
				return hd.patch(container.childNodes);
			}
			return null;
		},
		stripTags:function(v, clean){ // remove html/xml tags and return a string
			if(typeof v !== 'string') return null;
			if(typeof clean ==='boolean' && clean){
				return v.replace(/<[a-z0-9]+.*>|<\/[a-z0-9]+>|\n+|\s{2,}|\t/gim,'')
			}
			return v.replace(/<[a-z0-9]+.*>|<\/[a-z0-9]+>/gim,'')
		},
		isIP:function(v){
			return v.match(new RegExp('^'+hd.data.regex.ip+'$'))?true:false;
		}
	},
	_number:{
		randomize:function (c, e, m) {
			/*
			c:Number = minimum Number
			e:Number = maximum Number
			m:Array = skip numbers.
			*/
			var l = Math.floor(Math.random() * (e - c + 1)) + c;
			m = m!=null?m:[];
			if (typeof m.length !== 'undefined' && m.length>0) {
				while (m.indexOf(l)>=0) {
					l =Math.floor(Math.random() * (e - c + 1)) + c
				}
			}
			
			return l
		}	
	},
	_array:{
		randomOrder:function(v){
			var t; // empty variable to hold temporary data
			for(var d=0; d<v.length;d++){
				var r = $._number.randomize(0, (v.length-1), [d]);
				t = v[r];
				v[r] = v[d];
				v[d] = t;
			}
			return v;
		}
	},
	_object:{
		inspectData:function(obj,data,deep){
			if(typeof obj !=='object') return [];
			var ret = [],
			obj = typeof obj==='object'?$._object.toArray(obj):obj;
			for(var i=0;i<obj.length;i++){
				if(deep && (typeof obj[i] ==='object' || typeof obj[i] ==='array')){
					var o = typeof obj[i] === 'object'?$._object.toArray(obj[i]): obj[i];
					if($._object.inspectData(o, data, deep)) ret.push(i)
				}else{
					if(obj[i] === data) ret.push(i)
				}
			}
			return ret;
		},
		toArray:function(obj,both){
			if(typeof obj!=='object') return [];
			both = typeof both ==='boolean'?both:false;
			var ret=[];
			for(var i in obj){
				if(obj.hasOwnProperty(i)) ret.push((both?[i, obj[i]]:obj[i]))
			}
			return ret;
		}
	}
};

// check compabilities of the browser(collecting data)
var _checker = function(){
	var supports = hd.supports = {};
	supports.css3 = ('text-shadow' in document.documentElement.style);
	supports.doctype=document.doctype == null?null:{
		name: document.doctype.name,
		systemId:document.doctype.systemId,
		textContent:document.doctype.textContent,
		publicId:document.doctype.publicId
	}
	supports.addEventListener = typeof Element.prototype.addEventListener !=='undefined' || Element.prototype.attachEvent !== 'undefined';
	
	// if addEventListener doesn't exits but the browser is supported then make a polyfill for addEventListener
	//this intended for ie 8 only
	if (!Element.prototype.addEventListener && 
		supports.addEventListener) {
		if (!Event.prototype.preventDefault) {
			Event.prototype.preventDefault=function() {
			this.returnValue=false;
			};
		}
		if (!Event.prototype.stopPropagation) {
			Event.prototype.stopPropagation=function() {
			this.cancelBubble=true;
			};
		}
		var eventListeners=[],
		addEventListener=function(type,listener) {
		var self=this,
		wrapper=function(e) {
		 e.target=e.srcElement;
		 e.currentTarget=self;
		 if (listener.handleEvent) {
		   listener.handleEvent(e);
		 } else {
		   listener.call(self,e);
		 }
		};
		if (type=="DOMContentLoaded") {
		 var wrapper2=function(e) {
		   if (document.readyState=="complete") {
		     wrapper(e);
		   }
		 };
		 document.attachEvent("onreadystatechange",wrapper2);
		 eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});
		
		 if (document.readyState=="complete") {
		   var e=new Event();
		   e.srcElement=window;
		   wrapper2(e);
		 }
		} else {
		 this.attachEvent("on"+type,wrapper);
		 eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
		}
		};
		
		var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
		var counter=0;
		while (counter<eventListeners.length) {
		 var eventListener=eventListeners[counter];
		 if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
		   if (type=="DOMContentLoaded") {
		     this.detachEvent("onreadystatechange",eventListener.wrapper);
		   } else {
		     this.detachEvent("on"+type,eventListener.wrapper);
		   }
		   break;
		 }
		 ++counter;
		}
		};
		Element.prototype.addEventListener=addEventListener;
		Element.prototype.removeEventListener=removeEventListener;
		if (HTMLDocument) {
		HTMLDocument.prototype.addEventListener=addEventListener;
		HTMLDocument.prototype.removeEventListener=removeEventListener;
		}
		if (Window) {
		Window.prototype.addEventListener=addEventListener;
		Window.prototype.removeEventListener=removeEventListener;
		}
		}
	
		// add bind polyfill
		if (!('bind' in Function.prototype)) {
			Function.prototype.bind = function(){
				var fn = this, args = Array.prototype.slice.call(arguments),
				  object = args.shift();
				return function(){
				return fn.apply(object,
				  args.concat(Array.prototype.slice.call(arguments)));
				};
			};
		}
  
	supports = null;
}

// initializing HDJS	
_checker();
_checker = null;

// install root functions
var rootHd;
if(!window.$){
	rootHd = '$';
}else if(!window.$hd){
	rootHd = '$hd';
}
window[rootHd] = hd.jql.query;
window[rootHd]['supports'] = hd.supports;
for(var i in hd.fn){
	window[rootHd][i] = hd.fn[i]
}
})();

