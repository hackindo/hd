
/*
CodeName: HDjs(Hackindo Javascript Framework)
version: Alpha
Contributor: Muhammad Farid Wajdi
website: www.hackindo.com
*/
(function(){  
window.hd={
	about:{
		version:'Hackindo Javascript Framework alpha',
		website:'www.hackindo.com'
	}
};

hd.classes ={
	motionTangents:{
		linear:function(pg){
			return pg;
		},
		quad:function(pg) {
			return Math.pow(pg, 5)
		},
		circle:function (pg) {
			return 1 - Math.sin(Math.acos(pg))
		},
		back:function(pg) {
			var x = 1.5;
			return Math.pow(pg, 2) * ((x + 1) * pg - x)
		},
		bounce:function (pg) {
			for(var a = 0, b = 1, result; 1; a += b, b /= 2) {
				if (pg >= (7 - 4 * a) / 11) return -Math.pow((11 - 6 * a - 11 * pg) / 4, 2) + Math.pow(b, 2)
			}
		},
		elastic:function (pg) {
			var x =1.5;
			return Math.pow(2, 10 * (pg-1)) * Math.cos(20*Math.PI*x/3*pg)
		}	
	},
	motion:function(ele,cssStart,cssEnd,duration,tangent, easing,loop, complete){
		if(ele==null||typeof cssEnd !== 'string') throw new TypeError();
		if(!$hd.isElement(ele) || !$hd(ele).isExists()) throw new TypeError();
		
		var validRules = /(left|top|width|color|height|background-color|margin-left|margin-right|margin-top|margin-botom|border-color|padding-left|padding-right|padding-top|border-bottom-width|border-top-width|border-left-width|border-right-width|border-bottom-color|border-top-color|border-left-color|border-right-color|padding-bottom|border-width|opacity|font-size)\s?(?=:).[^;]*(?=;?)/gim;
		
		// filtering css input
		cssEnd = cssEnd.replace(/\s{2,}|\n|\t/gim,'').replace(/\s?(:)(?=\s?)/,'$1').match(validRules);
		cssStart = !cssStart?[]:cssStart.replace(/\s{2,}|\n|\t/gim,'').replace(/\s?(:)(?=\s?)/,'$1').match(validRules);
		if(!cssEnd) throw new Error('invalid css rules, please refer to the documentation about the valid css rules for animation');
		
		// creating properties
		var _cssEnd = [],
		_paused = false,
		_cssStart = [],
		_tm = null,		
		_step,
		_complete = typeof complete ==='function'?complete:null,
		_loop = 0,
		_easing = typeof easing ==='string'?easing.match(/^easein|easeout|easeinout$/)?easing:'easein':'easein',
		_tangent = typeof tangent ==='string'?tangent in hd.classes.motionTangents ? tangent:'linear':'linear';
		
		this.ele = $hd(ele),
		this.duration = isNaN(duration)?1:parseFloat(duration),
		this.loop = isNaN(loop)?0:parseInt(loop),
		this.isPlaying = false;
		
		// verifying the css rules of the end point
		var verify = function(cssStart, cssEnd){
			for (var i = 0; i < cssEnd.length; i++) {
				var colorPattern = /#[a-z0-9]+|rgba?\s?\(([0-9]{1,3}\s?,\s?)+((([0-9]+)?(\.)?([0-9]+))+)?\)/gi,
				 name = cssEnd[i].replace(/^([a-z0-9-]+)(?=:).*/gi,'$1'),
				value = cssEnd[i].replace(/^[a-z0-9-]+:(.*)/gi,'$1'),
				startIndex = $hd(cssStart).inspectData(name+':',false),
				startValue = !startIndex.length?this.ele.getcss(name):cssStart[startIndex].replace(/^[a-z0-9-]+:(.*)/gi,'$1');

				if(value=='') continue;
				// parsing values
				if(name.match(/color/i)){
					//if color
					// validate the color
					
					if(!value.match(colorPattern)) continue;
					if(value.match(/#[a-z0-9]+/ig)){
						// if hex then convert to rgb
						var rgb = $hd(value).hex2rgb(),
						value = !rgb?null:rgb;
						if(!value) continue;
					}
					
					// verifying cssStart's value
					
					startValue = !startValue.match(colorPattern)?this.ele.getcss(name):startValue;
					if(!startValue.match(colorPattern)) continue;
					if(startValue.match(/#[a-z0-9]+/ig)){
						// if hex then convert to rgb
						var rgb = $hd(startValue).hex2rgb(),
						startValue = rgb==null?null:rgb;
					}
					
					// if browser doesn't support rgba then convert the value to rgb
					value = !$hd.supports.rgba && value.match(/rgba/i)?value.replace(/(.*)a\s?(\((\d{1,3},)(\d{1,3},)(\d{1,3})).*/i,'$1$2)'):value;
					startValue = !$hd.supports.rgba && startValue.match(/rgba/i)?startValue.replace(/(.*)a\s?(\((\d{1,3},)(\d{1,3},)(\d{1,3})).*/i,'$1$2)'):startValue;				
					
					// compare and convert the value of both to object
					var colora = value.match(/[0-9]{1,3}/g),
					colorb = startValue.match(/[0-9]{1,3}/g);
					
					if(colora.length > colorb.length){
						colorb.push(this.ele.getcss('opacity'))
					}else if(colorb.length>colora.length){
						colora.push(colorb[colorb.length-1])
					}
					_cssEnd.push({
						type:'color',
						name:name,
						value:{
							r:parseInt(colora[0]),
							g:parseInt(colora[1]),
							b:parseInt(colora[2]),
							a:colora[3]?parseFloat(colora[3]):null
						}
					});
					_cssStart.push({
						type:'color',
						name:name,
						value:{
							r:parseInt(colorb[0]),
							g:parseInt(colorb[1]),
							b:parseInt(colorb[2]),
							a:colorb[3]?parseFloat(colorb[3]):null
						}
					});

				}else{
					value = parseFloat(value),
					startValue = parseFloat((isNaN(parseFloat(startValue))?parseFloat(this.ele.getcss(name)):startValue));
					if(isNaN(value)) continue;
					if(isNaN(startValue)) startValue = 0;
					_cssEnd.push({
						type:'unit',
						name:name,
						value:parseFloat(value)
					});
					_cssStart.push({
						type:'unit',
						name:name,
						value:parseFloat(startValue)
					});
				}
				
			}
		};
		
		verify.apply(this,[cssStart,cssEnd]);
		
		// clearing the arguments
		cssStart = complete = cssEnd = duration = tangent = loop = ele = verify = null;
		
		if($hd(_cssEnd).isEmpty()) throw new Error('MotionClass::invalid css rules');// raise error if cssEnd is empty
		var _pauseTime = 0;
		
		this.play = function(){
			if(this.isPlaying) return;
			if(!this.ele.isExists() || !this.ele.visible()) {
				this.stop();
				return;
			}
			
			this.isPlaying = true;
			_paused = false;
			
			if(	$hd(_cssEnd).inspectData('left',true,true).length|| 
				$hd(_cssEnd).inspectData('top',true, true).length)
					this.ele.css('position:absolute');
					
			var st = new Date() - _pauseTime;
			
			_tm = window.setInterval(function(){
				if(!this.ele.isExists() || !this.ele.visible()) {
					this.stop();
					return;
				}
				var pg, delta,
				timePassed = new Date() - st;
				pg = timePassed / (this.duration*1000);
				
				if (pg > 1) pg = 1;
				
				if(_easing === 'easeout'){
					delta = 1 - hd.classes.motionTangents[_tangent](1 - pg);
				}else if(_easing==='easeinout'){
					if (pg <= 0.5) {
						// the first half of animation will easing in
						delta= hd.classes.motionTangents[_tangent](2 * pg) / 2
					} else {
						// the rest of animation will easing out
						delta= (2 - hd.classes.motionTangents[_tangent](2 * (1 - pg))) / 2
					}
				}else{
					delta = hd.classes.motionTangents[_tangent](pg);
				}
				// the movement
				_step.call(this,delta);
				
				
				if(_paused){
					window.clearInterval(_tm);
					_tm=null;
					_pauseTime = timePassed;
					this.isPlaying = false;
					return;
				}
				
				if (pg == 1) {
					_pauseTime =0;
					if(_loop>=this.loop){
						
						this.stop();			
						if(_complete)_complete();
					}else{
						_loop++;
						st = new Date(),
						timePassed =  new Date() - st,
						pg = 0;
					}
				}
				
			}.bind(this),10);
		};
		
		_step = function(delta){
			var styles = '',r,g,b,a,unit;
			for(var i=0;i<_cssEnd.length;i++){
				var name = _cssEnd[i].name, 
				svalue =_cssStart[i].value, 
				value = _cssEnd[i].value;
				
				r = Math.max(Math.min(parseInt((delta * (value.r-svalue.r)) + svalue.r, 10), 255), 0),
				g = Math.max(Math.min(parseInt((delta * (value.g-svalue.g)) + svalue.g, 10), 255), 0),
				b =  Math.max(Math.min(parseInt((delta * (value.b-svalue.b)) + svalue.b, 10), 255), 0),
				a = (value.a ==null?'':',' + $hd(parseFloat((value.a-svalue.a)*delta+svalue.a)).round(1))
				;
				if(_cssEnd[i].type == 'color'){
					styles += name+':'+(value.a !=null?'rgba(':'rgb(')+
					r + ',' + g + ',' + b +	a +') !important;';
				}else{
					unit = $hd(parseFloat((value-svalue)*delta+svalue)).round(2);
					styles += name+':'+	unit +'px !important;';	
				}			
				this.ele.css(styles);	
			}			
		};
		
		this.stop = function(){
			this.isPlaying = false;
			window.clearInterval(_tm);
			_tm=null;
			_loop = 0;
		};

		this.pause = function(){
			_paused = true;
		};
	},
	_string:function(v){
		this.value = v;
		this.toObject=function(){
			var ms = this.value.match(/[a-z0-9]+:.[^\n]*/gi),
			ret;
			if(!ms) return null;

			ms.filter(function(){
				var prop = ms[0].replace(/([a-z0-9]+)(?=:)(?::)(.*)/i,'$1'),
				val = ms[0].replace(/([a-z0-9]+)(?=:)(?::)(.*)/i,'$2');
				if(ret==null)ret={};
				ret[prop] = val;
				return false
			});
			ms=null;
			return ret;
		};
		
		this.parseHTML = function(){
			var f = this.value.replace(/\n+|\s{2,}|\t/g,'');
			if(f.match(new RegExp(hd.data.regex.node,'gim'))){
				var container = $hd('<div/>');
				container.html(f);
				for(var i=0;i<container.childNodes.length;i++){
					if(container.childNodes[i].style) hd.patch(container.childNodes[i],'node')
				}
				return hd.patch(container.childNodes,'node');
			}
			return null;
		};
		
		this.stripTags=function(clean){ // remove html/xml tags and return a string
			if(typeof clean ==='boolean' && clean){
				return this.value.replace(/<[a-z0-9]+.*>|<\/[a-z0-9]+>|\n+|\s{2,}|\t/gim,'')
			}
			return this.value.replace(/<[a-z0-9]+.*>|<\/[a-z0-9]+>/gim,'')
		};
		
		this.isIP=function(){
			return this.value.match(new RegExp('^'+hd.data.regex.ip+'$'))?true:false;
		};
		
		this.hex2rgb=function() {
			var v = this.value.toString().replace(/\s+/g,'').match(/#[a-z0-9]+/i);
			if(!v) return null;
			v = v[0];
			return 'rgb('+('0x' + v[1] + v[2] | 0)+','+('0x' + v[3] + v[4] | 0)+','+( '0x' + v[5] + v[6] | 0)+')';
		};
	},
	_number:function(v){
		this.value = v;
		this.randomize=function (c, e, m) {
			/*
			c:Number = minimum Number
			e:Number = maximum Number
			m:Array = skip numbers.
			*/
			if(c == null || e == null){
				c = 0, e = 100, this.value;
			}
			var l = Math.floor(Math.random() * (e - c + 1)) + c;
			m = m!=null?m:[];
			if (typeof m.length !== 'undefined' && m.length>0) {
				while (m.indexOf(l)>=0) {
					l =Math.floor(Math.random() * (e - c + 1)) + c
				}
			}
			
			return l
		}	
		
		this.round = function(decimal){
			return  Number(Math.round(this.value+'e'+(isNaN(decimal)?1:decimal))+'e-'+(isNaN(decimal)?1:decimal));
		}
	},
	_array:function(v){
		this.value = v;
		this.randomOrder=function(){
			var t; // empty variable to hold temporary data
			for(var d=0; d<this.value.length;d++){
				var r = $hd(1).randomize(0, (this.value.length-1), [d]);
				t = this.value[r];
				this.value[r] = this.value[d];
				this.value[d] = t;
			}
			return this.value;
		};
		
		this.clone = function(){
			return JSON.parse(JSON.stringify(this.value));
		};
		
		this.inspectData=function(data,deep,exact){
			var ret = [],
			dataType = typeof data;
			var obj =this.value;

			for(var i=0;i<obj.length;i++){
				if(dataType === 'string' && typeof obj[i] === dataType){
					if(!exact){
						if(obj[i].match(data)) ret.push(i)
					}else{
						if(obj[i].match(new RegExp('^'+data+'$'))) ret.push(i)
					}
				}else{
					if(obj[i] == data){
						ret.push(i);
					}else{
						if(deep && (typeof obj[i] === 'object' || typeof obj[i] === 'array')){
							if ($hd(obj[i]).inspectData(data,deep,exact).length) ret.push(i);
						}
					}
				}
			}
			return ret;
		};
		
		this.isEmpty = function(){
			return this.value.length==0;
		}
	},
	_object:function(v){
		this.value = v;
		this.merge=function(obj2){
			if(typeof obj2 !== 'object') return null;
			var newobj=null;
			for(var p in this.value){
				if(this.value.hasOwnProperty(p)){
					if(newobj==null)newobj = {};
					newobj[p] = this.value[p] 
				}
			}
			
			for(var p2 in obj2){
				if(obj2.hasOwnProperty(p2)){
					if(newobj==null)newobj = {};
					newobj[p2] = obj2[p2] 
				}
			}
			
			return newobj;
		};
		
		this.inspectData=function(data,deep,exact){
			var ret = [],
			dataType = typeof data;
			var obj =this.toArray();

			for(var i=0;i<obj.length;i++){
				if(dataType === 'string' && typeof obj[i] === dataType){
					if(!exact){
						if(obj[i].match(data)) ret.push(i)
					}else{
						if(obj[i].match(new RegExp('^'+data+'$'))) ret.push(i)
					}
				}else{
					if(obj[i] == data){
						ret.push(i);
					}else{
						if(obj[i] != null && deep && (obj[i] instanceof Object || typeof obj[i].length !== 'undefined')){
							if ($hd(obj[i]).inspectData(data,deep,exact).length) ret.push(i);
						}
					}
				}
			}
			return ret;
		};
		
		this.clone=function() {
		    var c = {};
		    for (var a in this.value) {
		        if (this.value.hasOwnProperty(a)) c[a] = this.value[a];
		    }
		    return c;
		};
		
		this.toArray=function(both){
			both = typeof both ==='boolean'?both:false;
			var ret=[];
			for(var i in this.value){
				if(this.value.hasOwnProperty(i)) ret.push((both?[i, this.value[i]]:this.value[i]))
			}
			return ret;
		};
	}
};
	
// hd database
hd.data={
	regex:{
		urlVar:'(\\?|&)([a-z0-9]+=(.[^\\s&]*)?)(?=&?)',
		cssStyles:'[a-z0-9-]+:.[^;]*(?=;?)',// css property and value(eg background-color:#44444 etc)
		cssRule:'((-|:|\\.|#)*?\\w)*{(.|\\n)[^\\}]*}', // css rule (eg div#ele{color:red;font-size:20px})
		cssUnit:'(em|ex|%|px|cm|mm|in|pt|pc)', // css unit (eg 3px or 2em or 100%)
		floatNumber:'((\\d+)?(\\.(?=\\d))+?\\d+|\\d(?!\\.))+', // float and number 
		node:'^<([A-Z][A-Z0-9]*)\\b[^>]*>(.*?)<\\/\\1>', // html/xml node pattern
		ip:'\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b' // ip address
	},
	readyListeners:[],
	completeListeners:[],
	seenElements:[],
	startup:{
		ready:false,
		tm:null,
		err:[],
		handler:function(){
			var readyExecuted = false;
			$hd.supports.documentRect = {
					windowWidth:window.innerWidth || document.documentElement.clientWidth,
					windowHeight:window.innerHeight || document.documentElement.clientHeight,
					bodyWidth:document.body ? document.body.clientWidth || document.body.getBoundingClientRect().width : null,
					bodyHeight:document.body ? document.body.clientHeight || document.body.getBoundingClientRect().height:null
				};
			switch (document.readyState) {
			case "loading":
				// handle when document is still loading
				break;
			case "interactive":
				// try to execute all ready listeners registered when the document has render its elements
				for(var i=0;i<hd.data.readyListeners.length;i++){
					try{
						hd.data.readyListeners[i].call(document);
					}catch(e){
						hd.data.startup.err.push(e);
						continue;
					}
				}
				hd.data.startup.ready = true;
				break;
			case "complete":
				//The page is fully loaded.
				while(hd.data.completeListeners[0]){
					try {
						hd.data.completeListeners[0].call(document);
						hd.data.completeListeners.splice(0,1)
					} catch (error) {
						hd.data.startup.err.push(e);
							continue;
					}
				}
				
				if(!hd.data.startup.ready){
					for(var i=0;i<hd.data.readyListeners.length;i++){
						try{
							hd.data.readyListeners[i].call(document);
						}catch(e){
							hd.data.startup.err.push(e);
							continue;
						}
					}
				}
				
				window.clearInterval(hd.data.startup.tm);
				hd.data.startup.complete();
				break;
			}
			
		},
		complete:function(){
			delete hd.data.readyListeners, delete hd.data.completeListeners,
			delete $hd.ready, delete $hd.complete,
			delete hd.fn.ready, delete hd.fn.complete;
			if(hd.data.startup.err.length){
				$hd.log('some errors in startup triggered -> \n');
				while(hd.data.startup.err[0]){
					$hd.log(hd.data.startup.err[0]);
					hd.data.startup.err.splice(0,1);
				}
			}
			delete hd.data.startup;
		}
	}
};

// this jql object is intended for patching to the results of jql(javascript query language)
hd.jql = {
	// begin of Javascript Query Functions 
	query:function(q){
		// get elements and returns array
		if(q ==null) return [];
		var ele = this instanceof NodeList || this instanceof Array?this[0]:!this.ownerDocument?document:this,
			eles;
		if(typeof q === 'string'){
			if(ele === document && q.match(/^<.*\/>$/gi)){
				// if q match html tag and the root is document then parse q to html elements
				// create element
				var tag = q.replace(/^<(\w+).*/i,'$1'),
				att = q.match(/(\w\d?)+=".[^"]*"/gi),
				ele = hd.patch(document.createElement(tag),'node');
				if(att){
					for(var i=0;i<att.length;i++){
						var at = att[i].replace(/(\w+\d?)=.*/i,'$1'),
						value = att[i].replace(/\w+\d?="(.*)"/i,'$1');
						ele.atb(at,value);
					}
				}		
				tag = att = null;
				return hd.patch(ele,'node');
			}else if(ele === document && q.match(new RegExp(hd.data.regex.node,'gi'))){
				var x = q.match(new RegExp(hd.data.regex.node,'i'))[0],
				f = x.replace(/\n+|\s{2,}|\t/g,''),
				tag = f.replace(/^<([a-z0-9]+).*/i,'$1'),
				att = f.replace(/^<[a-z0-9]+(.[^>]*)>.*/gi,'$1').match(/(\w\d?)+=".[^"]*"/gi),
				ele = hd.patch(document.createElement(tag), 'node');
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
					if(eles.length<=0) eles = []
				} catch (error) {
					eles=[];
				}
			}
			
			if(eles.length>0){
				hd.patch(eles,'node');
				for(var i=0;i<eles.length;i++){
					hd.patch(eles[i], 'node');
				}				
			}
			return eles.length>0?eles:hd.patch(q,'proto');
		}else if(q.ownerDocument||q===document){
			return hd.patch(q,'node');	
		}
		
		return hd.patch(q,'proto');
	},
	isExists:function(parent){
		if(parent != null && (!$hd.isElement(parent) && parent != document) || parent == this) return;
		return $hd((parent != null?parent:document.body)).contains(this);	
	},
	motion:function(cssStart, cssEnd, duration, tangent, easing, loop, complete){
		if(cssEnd == null || typeof cssEnd !== 'string') return;
		var motion;
		motion = new hd.classes.motion(this,cssStart, cssEnd, duration, tangent, easing, loop, function(e){
			if(e)e.call(this);
			var m = $hd(this.data.animations).inspectData(motion);
			for(var i=0;i<m.length;i++){
				this.data.animations.splice(m[i],1)
			}
		}.bind(this),complete);
		if(motion == null) return;
		this.data.animations.push(motion);
		motion.start();
		return motion;
	},
	rectangle:function(){
		var rect = this.getBoundingClientRect();
		return {
			left:rect.left,
			top:rect.top,
			width:typeof rect.width!=='undefined'?rect.width:typeof this.offsetWidth ==='undefined'?0:this.offsetWidth,
			height:typeof rect.height!='undefined'?rect.height:typeof this.offsetHeight ==='undefined'?0:this.offsetHeight
		}
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
		return this[this.length-1];
	},
	items:function(i){
		if(typeof i === 'number') return this[i];	
	},
	visible:function(v){
		if(v !=null && typeof v !=='boolean') return;
		if(v !=null){
			this.displayMode = !v?this.getcss('display'):this.displayMode;
			this.css('display:'+(v?this.displayMode!=''?this.displayMode:'block':'none')+' !important');
		}else{
			return this.rectangle().width>0
		}
	},
	clone:function(){
		return hd.patch(this.cloneNode(true),'node');
	},
	addChild:function(e,index){
		if(e==null || this === document) return;
		e = typeof e === 'string'? !$hd.isElement(e) ?null:$hd(e):!$hd.isElement(e)?null:e;
		if(e==null) return;
		
		index = index === 0?'first':index >= this.childs().length?'end':index;
		if(typeof index ==='string'){
			if(index=='first'){
				this.insertBefore(e, this.childs(0));
			}else{
				this.appendChild(e);
			}
		}else if(typeof index ==='number'){
			index = e.isExists(this)?this.childs(index+1)===e?index:(index+1):index;
			this.insertBefore(e, this.childs(index));
		}else{
			this.appendChild(e);
		}
	},
	childs:function(idx){
		// get child element of an element
		if(idx !=null && typeof idx !== 'number') return null;
		var ele =this instanceof NodeList || this instanceof Array?this[0]:this;
		if(!ele.style) return [];
		var q = ele.query('*'),
		ch = [];
		if(q.length<=0) return [];
		q.each(function(i,e){
			if(q[i].parentNode == ele) ch.push(q[i]);
		}.bind(ele));
		
		for(var a=0;a<ch.length;a++){
			hd.patch(ch[a],'node')
		}
		
		return hd.patch((idx!=null?ch[idx]:ch),'node');
	},
	remove:function(){
		if(this.parentNode == null) return;
		hd.clearPatches(this);
		this.parentNode.removeChild(this);
	},
	atb:function(e,v){
	// e = attribute name, v = value
	/* if value is not give then this will return the current value */
		if(e == null || typeof e !== 'string') return null;
		if(v !=null){
		  this.setAttribute(e,v);
		}else{
		  return this.getAttribute(e);
		}
	},
	isSeen:function(){
		var p = this.rectangle(),
		j = $hd.supports.documentRect;
		return ((p.top)>0 && p.top<=j.windowHeight&&p.left>=0 && p.left<= j.windowWidth);
	},
	onSeen:function(fn,fn2){
		if(fn ==null||typeof fn2==null) return false;
		hd.data.seenElements.push(this);
		this.data.events.push({
			name:'seen',
			fn:fn
		});
		this.data.events.push({
			name:'unseen',
			fn:fn2
		});
	},
	getcss:function(name){
		if(window.getComputedStyle){
			return window.getComputedStyle(this)[name];
		}else{
			name = name.charAt(0).toLowerCase()+name.replace(/[a-z]*-?/ig, function(a,b){
				return a.charAt(0).toUpperCase()+a.substr(1,a.length).replace(/-/g,'')
			}).substr(1,name.length);
			
			var rnum = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$/i;
			var t = 'left', l, rs, rsL, c = this.currentStyle, 
				r = c ? c[ name ] : undefined, s = this.style;
			if( r == null && s && s[ name ] ){ r = s[ name ]; }
			if( rnum.test( r ) && !/^(top|right|bottom|left)$/.test( name ) ){
				l = s[t]; rs = this.runtimeStyle; rsL = rs && rs[t]; 
				if( rsL ){ rs[t] = this.currentStyle[t]; } 
				s[t] = name === 'fontSize' ? '1em' : r; r = s.pixelLeft + 'px'; 
				s[t] = l; if( rsL ){ rs[t] = rsL; }
			}
			return r;
		}
	},
	alignTo:function(ele,v,h,o,m){
	/* 
		ele = the current target of an element
		v = vertical alignment ['top','center','bottom']
		h = horizontal alignment ['left', 'center', 'right'];
		o = offset(x y). you can add gaps to left,right,top or bottom.
		m = mode. you can choose between inner or outer
	*/
	if(!ele || (!$hd.isElement(ele) && ele != document)) return false;
	ele = hd.patch(ele,'node');
	if(!this.visible()||!ele.visible()) return false;
	document.body.appendChild(this);
	
	this.css('position:absolute;');
		var v = v==null?'center':v.match(/^center|top|bottom$/i)?v:'center',
		h = h==null?'center':h.match(/^center|left|right/i)?h:'center',
		eBound = this.rectangle(),
		tBound = ele.rectangle(),
		result = {x:null, y:null},
		o = typeof o ==='object'?(typeof o.x !=='undefined' && typeof o.y !=='undefined')?o:{x:0,y:0}:{x:0,y:0};

	m=m==null?'inner':!m.match(/^inner|outer$/i)?'inner':m;
		// determining vertical value
		switch (v) {
			case 'top':
				result.y =m=='inner'?tBound.top:tBound.top-eBound.height;
			break;
			case 'center':
				result.y = ((tBound.height/2)-(eBound.height/2))+tBound.top;
			break;
			case 'bottom':
				result.y = m=='inner'?(tBound.top+tBound.height)-eBound.height:(tBound.top+tBound.height);
			break;
			default:
				break;
		}
		
		// determining horizontal value
		switch (h) {
			case 'left':
				result.x =m=='inner'?tBound.left:tBound.left-eBound.width;
			break;
			case 'center':
				result.x = ((tBound.width/2)-(eBound.width/2))+tBound.left;
			break;
			case 'right':
				result.x = m=='inner'?(tBound.left+tBound.width)-eBound.width:(tBound.left+tBound.width);
			break;
			default:
				break;
		}
		
		
		this.css('position:absolute;left:'+(result.x+o.x+window.scrollX)+'px;top:'+(result.y+o.y+window.scrollY)+'px');
	},
	css:function (u){
		if (typeof(u) !== "string" || u == "") return;
		var x = /(-|)[a-z-A-Z-0-9]*(\s|)\:(\s|){1,}[a-z-0-9"':\.()=,%\s_#/+?&!]*/gi;
		var A = /^[a-z-0-9]*:/i;
		var m = this.atb("style") != null ? this.atb("style").match(x) : null;
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
			this.atb("style", t.join(';'));
			e, u,t, o, m, z, y = null
		}
	},
	on:function(name,fn,capture){ // add event handler
		if('function' !== typeof fn || typeof name !== 'string') return false;
		capture = typeof capture === 'boolean'?capture:false;
		this.data.events.push({name:name,fn:fn});		
		this.addEventListener(name,fn,capture)
	},
	off:function(name, fn){ // remove an event handler
		if('function' !== typeof fn || typeof name !== 'string') throw TypeError();
		for(var i=0;i<this.data.events.length;i++){
			if(this.data.events[i].name == name && this.data.events[i].fn ==fn){
				this.removeEventListener(name,fn);
				this.data.events.splice(i,1)
			}
		}
		
		if(name.match(/^seen|unseen$/i)){
			this.clearListeners('seen');
			this.clearListeners('unseen');
			var seens = $hd(hd.data.seenElements).inspectData(this,true);
			for(var i=0;i<seens.length;i++){
				hd.data.seenElements.splice(seens[i],1)
			}
			seens =null
		}
	},
	clearEvents:function(){
		if(!this.data.events) return;
		for(var i=0;i<this.data.events.length;i++){
			this.removeEventListener(this.data.events[i].name,this.data.events[i].fn)
		}
		this.data.events = [];
		var seens = $hd(hd.data.seenElements).inspectData(this,true);
		for(var i=0;i<seens.length;i++){
			hd.data.seenElements.splice(seens[i],1)
		}
		seens =null
	},
	clearListeners:function(name){
		if(!this.data.events || name==null || typeof name !=='string') return;
		for(var i=0;i<this.data.events.length;i++){
			if(this.data.events[i].name == name) {
				this.removeEventListener(name,this.data.events[i].fn);
				this.data.events.splice(i,1);
			}
		}
		var seens = $hd(hd.data.seenElements).inspectData(this,true);
		for(var i=0;i<seens.length;i++){
			hd.data.seenthisments.splice(seens[i],1)
		}
		seens =null
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
hd.patch = function(e,tipo){
	if(!e) return null;
	if(e.isHD) return e;
	if(tipo == 'node'){
		for(var i in hd.jql){
			if((i.match(/^isExists|motion|getcss|css|on|alignTo|off|clearEvents|clearListeners|query|html|atb|text|remove|addChild|childs|rectangle|visible|isseen|onseen|clone$/i) && 
				(e instanceof NodeList||e instanceof Array)) || // skip item for NodeList and array
				(i.match(/^isExists|motion|getcss|css|alignTo|items|last|first|each|css|query|html|atb|text|remove|addChild|childs|rectangle|visible|isseen|onseen|clone$/i) && e === document) || //skip items for document 
				(i.match(/^items|last|first|each$/i) && (e instanceof Element))) // skip item for Element
				continue;
			e[i] = hd.jql[i];
		}
		if(e.style||e==document){
			e.displayMode = e==document?'block':e.getcss('display');
			e.data = {
				events:[],
				animations:[]
			};
		}
		e.isHD = true;
	}else{
		// patching non html node prototypes
		if(typeof e === 'string'){
			e = new hd.classes._string(e);
		}else if(typeof e === 'number'){
			e = new hd.classes._number(e);
		}else if(e instanceof Array){
			e = new hd.classes._array(e);
		}else if(e instanceof Object && typeof e.length === 'undefined'){
			e = new hd.classes._object(e);
		}
	}
	
	return e;
};
hd.clearPatches = function(e){
	if(!e.isHD) return;
	e.clearEvents();
	for(var i in hd.jql){
		if(e[i]) delete e[i];	
	}
	if(e.displayMode) delete e.displayMode;
	delete e.data
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
		// add ready listeners into hd.data.readyListeners which will be executed when document has finished render the elements
		if(typeof fn !== 'function') return;
		hd.data.readyListeners.push(fn);
	},
	complete:function(fn){
		// add complete handler into hd.data.completeListeners which will be executed when the page has completely loaded
		if(typeof fn !== 'function') return;
		hd.data.completeListeners.push(fn);
	},
	setCookie:function(prop,value, exp){
		var d = new Date();
		d.setTime(d.getTime() + (exp*24*60*60*1000));
		var expires = "expires="+d.toUTCString();
		document.cookie = prop + "=" + value + "; " + exp;
	},
	getCookie:function(prop){
		var reg = prop+'\s?=(.[^;]*)(?:(?=;?))';
		return document.cookie.replace(new RegExp(reg,'i'),'$1')
	},
	isElement:function(v){
		return v instanceof Element	
	}	
};

// check compabilities of the browser(collecting data)
var _checker = function(){
	var supports = hd.supports = {};
	// getting url variables and store them
	var params = window.location.href.match(new RegExp(hd.data.regex.urlVar,'gi')),
	vars = null;
	if(params){
		for(var i=0;i<params.length;i++){
			var param = params[i].replace(/&|\?/gi,'').split('=');
			if(vars ==null)vars={};
			vars[param[0]] = decodeURIComponent(param[1]);
		}
	}
	supports.urlVars = vars;
	// is css 3 supported by current browser
	supports.css3 = ('text-shadow' in document.documentElement.style);
	supports.doctype=document.doctype == null?null:{
		name: document.doctype.name,
		systemId:document.doctype.systemId,
		textContent:document.doctype.textContent,
		publicId:document.doctype.publicId
	};
	
	supports.addEventListener = typeof Element.prototype.addEventListener !=='undefined' || Element.prototype.attachEvent !== 'undefined';
	
	supports.documentRect = {
		windowWidth:window.innerWidth || document.documentElement.clientWidth,
		windowHeight:window.innerHeight || document.documentElement.clientHeight,
		bodyWidth:document.body ? document.body.clientWidth || document.body.getBoundingClientRect().width : null,
		bodyHeight:document.body ? document.body.clientHeight || document.body.getBoundingClientRect().height:null
	};
	
	// creating JSON polyfill for old browsers
	
	if (!window.JSON) {
		window.JSON = {
			parse: function(sJSON) { return eval('(' + sJSON + ')'); },
			stringify: (function () {
			var toString = Object.prototype.toString;
			var isArray = Array.isArray || function (a) { return toString.call(a) === '[object Array]'; };
			var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
			var escFunc = function (m) { return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1); };
			var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
			return function stringify(value) {
				if (value == null) {
				return 'null';
				} else if (typeof value === 'number') {
				return isFinite(value) ? value.toString() : 'null';
				} else if (typeof value === 'boolean') {
				return value.toString();
				} else if (typeof value === 'object') {
				if (typeof value.toJSON === 'function') {
					return stringify(value.toJSON());
				} else if (isArray(value)) {
					var res = '[';
					for (var i = 0; i < value.length; i++)
					res += (i ? ', ' : '') + stringify(value[i]);
					return res + ']';
				} else if (toString.call(value) === '[object Object]') {
					var tmp = [];
					for (var k in value) {
					if (value.hasOwnProperty(k))
						tmp.push(stringify(k) + ': ' + stringify(value[k]));
					}
					return '{' + tmp.join(', ') + '}';
				}
				}
				return '"' + value.toString().replace(escRE, escFunc) + '"';
			};
			})()
		};
		}

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
		Function.prototype.bind = Function.prototype.bind || function(){
			var fn = this, args = Array.prototype.slice.call(arguments),
			  object = args.shift();
			return function(){
			return fn.apply(object,
			  args.concat(Array.prototype.slice.call(arguments)));
			};
		};
  
		// filter array polyfill
		Array.prototype.filter = Array.prototype.filter || function(f) {
			'use strict';
			if (this === void 0 || this === null)throw new TypeError();
			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof f !== 'function')throw new TypeError();
			var res = [];
			var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
			for (var i = 0; i < len; i++) {
			  if (i in t) {
			    var val = t[i];
			    if (f.call(thisArg, val, i, t))res.push(val);
			  }
			}
			return res;
		};
	supports = null;
}

// initializing HDJS	
_checker();
_checker = null;

// install root functions
window['$hd'] = hd.jql.query;
window['$hd']['supports'] = hd.supports;
for(var i in hd.fn){
	window['$hd'][i] = hd.fn[i]
}
if(typeof window.$ === 'undefined' || window.$==null) window.$ = $hd;
// hndle ready event
$hd.ready(function(){
	var ele = $hd('<div/>'),
	pattern = /rgba/gi;
	$hd(document.body).addChild(ele);
	$hd.supports.rgba = pattern.test(ele.getcss('background-color'));
	ele.remove();
	ele = pattern = null;
});

// handling document ready event
if(document.onreadystatechange == null){
	document.onreadystatechange = hd.data.startup.handler;
}else{
	// alternative way to implement ready event
	hd.data.startup.tm = window.setInterval(hd.data.startup.handler,50);
}

// handling seen event
var handleSeen =function (){
	for(var i=0;i<hd.data.seenElements.length;i++){
		var ele = hd.data.seenElements[i];
		if(ele.isSeen()){
			if(!ele.seen){
				ele.seen = true;
				for(var e=0;e<ele.data.events.length;e++){
					if(ele.data.events[e].name == 'seen'){
						ele.data.events[e].fn.call(ele)
					}
				}
			}
		}else{
			if(ele.seen){
				ele.seen =false;
				for(var e=0;e<ele.data.events.length;e++){
					if(ele.data.events[e].name == 'unseen'){
						ele.data.events[e].fn.call(ele)
					}
				}
			}
		}
	}
};

window.addEventListener('scroll',handleSeen);

// handler handles document resize event
var tmhandler;
window.addEventListener('resize',function(e){
	window.clearTimeout(tmhandler);
	tmhandler = window.setTimeout(function(){
		$hd.supports.documentRect = {
			windowWidth:window.innerWidth || document.documentElement.clientWidth,
			windowHeight:window.innerHeight || document.documentElement.clientHeight,
			bodyWidth:document.body ? document.body.clientWidth || document.body.getBoundingClientRect().width : null,
			bodyHeight:document.body ? document.body.clientHeight || document.body.getBoundingClientRect().height:null
		};
	},100);
});
})();
