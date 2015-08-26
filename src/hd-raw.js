
/*
CodeName: HDjs(Hackindo Javascript Framework)
version: Alpha
Contributor: Muhammad Farid Wajdi
website: www.hackindo.com
*/
(function(){  
window.hd={
	version:'Hackindo Javascript Framework alpha'
};

// hd query manager
hd.data = {};

// regular expressions 
hd.data.regex={
	cssStyles:'([a-z]|-)*:.[^;\\n]*;?',// css property and value(eg background-color:#44444 etc)
  	cssRule:'((-|:|\\.|#)*?\\w)*{(.|\\n)[^\\}]*}', // css rule (eg div#ele{color:red;font-size:20px})
  	cssUnit:'(em|ex|%|px|cm|mm|in|pt|pc)', // css unit (eg 3px or 2em or 100%)
  	floatNumber:'((\\d+)?(\\.(?=\\d))+?\\d+|\\d(?!\\.))+', // float and number 
	node:'<.*\\/>|<([A-Z][A-Z0-9]*)\\b[^>]*>(.*?)<\\/\\1>', // html/xml node pattern
	ip:'\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b' // ip address
};

// this jql object is intended for patching to the results of jql(javascript query language)
hd.jql = {
	// begin of Javascript Query Functions 
	query:function(q){
		// get elements and returns array
		if(typeof q === 'string'){
			var ele = this instanceof NodeList || this instanceof Array?this[0]:!this.ownerDocument?document:this,
			eles;
			if(ele === document && q.match(new RegExp(hd.data.regex.node,'gim'))){
				// if q match html tag and the root is document then parse q to html elements
				var container = document.createElement('div');
				container.innerHTML = q;
				eles = container.childNodes;
				$.log(eles);			
			}else{
				try {
					eles = ele.querySelectorAll(q);
				} catch (error) {
					eles=null;
				}
			}
			
			if(eles){
				hd.import(eles);
				for(var i=0;i<eles.length;i++){
					hd.import(eles[i]);
				}
			}
			container = null;
			return eles;
		}else if(typeof q === 'object'){
			if(q.ownerDocument||q===document)return hd.import(q);			
		}
		
		return null;
	},
	each:function(fn){
		if('function' !== typeof fn) return false;
		if(this instanceof NodeList){
			for (var i=0;i<this.length;i++) {
				fn.call(this[i],i,this[i]);
			}
		}else{
			var qs = this.querySelectorAll('*');
			for (var i=0;i<qs.length;i++) {
				if(qs[i].parentNode == this)fn.call(qs[i],i,qs[i]);
			}
		}
	},
	first:function(){
		return hd.import(this[0]);
	},
	last:function(){
		return hd.import(this[this.length-1]);
	},
	items:function(i){
		if(typeof i === 'number') return this[i];	
	},
	addChild:function(e,index){
		if(e==null) return false;
		var parent = this instanceof NodeList?this[0]:this instanceof Array?this[0].parentNode:this,
		ele;

		if(typeof e ==='string'){
			if(e.match(/^<.*\/>$/gi)){
				// create element
				var tag = e.replace(/^<(\w+).*/i,'$1'),
				att = e.match(/(\w\d?)+=".[^"]*"/gi),
				ele = hd.import(document.createElement(tag));
				if(att){
					for(var i=0;i<att.length;i++){
						var at = att[i].replace(/(\w+\d?)=.*/i,'$1'),
						value = att[i].replace(/\w+\d?="(.*)"/i,'$1');
						ele.atb(at,value);
					}
				}
			}
		}else if(typeof e.style !== 'undefined'){
			ele = e;
		}
		if(ele==null) return false;
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

		var q = ele.query('*'),
		ch = [];
		q.each(function(i,e){
			if(q[i].parentNode == ele) ch.push(q[i]);
		}.bind(ele));
		
		for(var a=0;a<ch.length;a++){
			hd.import(ch[a])
		}
		
		return hd.import((idx!=null?ch[idx]:ch));
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
		var ele = this instanceof NodeList || this instanceof Array?this[0]:this;
		ele.data.events.push({name:name,fn:fn});		
		ele.addEventListener(name,fn,capture);
	},
	off:function(name, fn){ // remove an event handler
		if('function' !== typeof fn || typeof name !== 'string') return false;
		var ele = this instanceof NodeList || this instanceof Array?this[0]:this;
		
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
	}
};

//import hd's libs
hd.import = function(e){
	if(!e) return null;
	if(e.isHD) return e;
	for(var i in hd.jql){
		if(i.match(/data/gi) && (e instanceof NodeList||e instanceof Array) || // skip item for NodeList
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
	isCSS3:('text-shadow' in window.getComputedStyle(document.documentElement)),
	_string:{
		isIP:function(v){
			return v.match(new RegExp('^'+hd.data.regex.ip+'$'))?true:false;
		}
	},
	_array:{

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


window.log = function(s){
    if(typeof console !== 'undefined'){
      console.log(s);
    }else{
      alert(s);
    }
 };

// install root functions
var rootHd;
if(!window.$){
	rootHd = '$';
}else if(!window.$hd){
	rootHd = '$hd';
}
window[rootHd] = hd.jql.query;
for(var i in hd.fn){
	window[rootHd][i] = hd.fn[i]
}
})();
