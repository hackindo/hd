<!DOCTYPE html>
<html>
	<head>
		<meta content="text/html; charset=UTM-8" http-equiv="content-type" />
		<title>Motion</title>
		<script src="js/hd.js"></script>
		<script>
		var motion;
		$.ready(function(doc){
			var box = $('#box').items(0);
			document.addEventListener('click',function(e){
				if(motion!=null)motion.stop();
				var color = 'rgba('+($._number.randomize(0,255)+',')+
									($._number.randomize(0,255)+',')+
									($._number.randomize(0,255)+',')+
									'1)';
				var bcolor = 'rgb('+($._number.randomize(0,255)+',')+
									($._number.randomize(0,255)+',')+
									($._number.randomize(0,255)+',')+
									')';
				motion = new hd.classes.motion(box,'',('height:'+($._number.randomize(10,50))+'px;border-color:'+bcolor+';background-color:'+color+';left:'+e.x+';top:'+e.y+';border-top-width:'+($._number.randomize(0,50))),2,'circle','easeinout',1);
				motion.start();			
			});
			
			
		});
		</script>
		<style type="text/css">
		div#box{
			background: rgb(255,0,0); 
			width:50px; 
			height: 50px; 
			border:1px solid #444;
		}
		</style>
	</head>
	<body>
		<div id="box"></div>
	</body>
</html>
