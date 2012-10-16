define([
	"app",
	// Libs
	"backbone",
	"libs/leaflet"


], function(App, Backbone) {
	
	var Map = App.module();

	Map.Model = Backbone.Model.extend({
		defaults: {
			title: 'Map',
		},

		initialize: function() {
			
			var mapCollection = new MapCollection();
			
			mapCollection.fetch({success:function(collection,response){
				console.log(collection,response);
				var mapView = new MapView({collection:collection});
				mapView.render();
				$('#appBase').empty().append( mapView.el );
			}})

			
		}
	});

	var MapView = Backbone.LayoutView.extend({
		id : 'base-map',
		template: 'map',
		latLng: new L.LatLng(42.365520169045,-71.106262207031),
		
		initialize : function(options){
			_.extend(this,options);
		},
		
		createPoints:function(){

			var p =[];	
  		
	  		_.each(_.toArray(this.collection), function(item){
	  		
	  			p.push({ 
	  				"type": "Feature", 
	  				"geometry": {
	  					"type": "Point", 
	  					"coordinates": [item.get('media_geo_longitude'), item.get('media_geo_latitude')]
	  				}, 
	  				"properties":item.attributes,
	  				"id":item.id,
	  			});
	  		
	  		});
			return { "type": "FeatureCollection", "features": p}
		},

		afterRender:function(){
			var cloudmade = new L.TileLayer('http://{s}.tiles.mapbox.com/v3/zeega.map-6q59zzty/{z}/{x}/{y}.png', {maxZoom: 18, attribution: ''}),
				homemade = new L.TileLayer('assets/img/map.png#{z}/{x}/{y}', {maxZoom: 18, attribution: ''}),
				points = this.createPoints();
			var map = new L.Map(this.el,{
				dragging:false,
				touchZoom:false,
				scrollWheelZoom:false,
				doubleClickZoom:false,
				boxZoom:false,
				zoomControl:false,
			});
			map.setView(this.latLng, 15).addLayer(cloudmade).addLayer(homemade);
			map.featureOn=false;
		
			function onEachFeature(feature, layer) {
				layer.on("mouseover", function (e) {

					var x=layer._point.x-100;
					var y=layer._point.y-100;
					var popup = $("<div></div>", {
					id: "popup-" + feature.id,
					
					css: {
						position: "absolute",
						top: y+"px",
						left: x+"px",
						zIndex: 102,
						width:"200px",
						height:"200px",
						cursoer: "pointer",
	
					}
				});
		
				var hed = $("<div id='wrapper-"+feature.id+"' style='opacity:.8'><canvas id='canvas-"+feature.id+"' width='200' height='200'></canvas></div>").appendTo(popup);
				// Add the popup to the map
				popup.appendTo($('body'))
				
				var thumbImg = document.createElement('img');

				thumbImg.src = feature.properties.thumbnail_url;
				var r=0;
				function drawThumb(){

					var tmpCtx=document.getElementById("canvas-"+feature.id).getContext("2d");
					 	tmpCtx.save();
						tmpCtx.beginPath();
						tmpCtx.arc(100, 100, 100*r, 0, Math.PI * 2, true);
						tmpCtx.closePath();
						tmpCtx.clip();
						tmpCtx.drawImage(thumbImg, 0, 0, 200, 200);
						tmpCtx.restore();
						if(r>=1)clearInterval(drawThumbAnim);
						r=parseFloat(r)+0.025;
				}
				var drawThumbAnim=setInterval(drawThumb,20);


				
				
				popup.on('mousemove',function(e){
					if(!map.featureOn){
						var d= Math.sqrt((e.pageX-layer._point.x)*(e.pageX-layer._point.x)+(e.pageY-layer._point.y)*(e.pageY-layer._point.y));
								if(d>20){
									console.log(d,e);
									$("#popup-" + feature.id).fadeOut('fast',function(){$(this).remove(); });
							}
						}
					})
					.on('click',function(e){
					
						if(!map.featureOn){
							popup.css({'background':'url("circle.png")'});
						
							map.featureOn=true;
							var overlay = $("<div></div>", {
								id: "overlay-" + feature.id,
								css: {
									cursor: "pointer",
									position: "absolute",
									top: "0px",
									left: "0px",
									zIndex: 100001,
									width:"100%",
									height:"100%",
				
								}
							});
							
							var hedd = $("<div id='overlay-wrapper-"+feature.id+"' style='opacity:1'><canvas id='overlay-canvas-"+feature.id+"' width='"+window.innerWidth+"' height='"+window.innerHeight+"'></canvas></div>").appendTo(overlay);
							overlay.appendTo($('body'));
							var largeImg = document.createElement('img');
	
							largeImg.src = feature.properties.uri;
							largeImg.onload = function() {
								
							
							var i=.01;
							
							var k = Math.sqrt(window.innerHeight*window.innerHeight+window.innerWidth*window.innerWidth);
					
							//Want animation radius to be large enough such that begins at farthest corner of the screen
							var d =Math.max( Math.sqrt(window.innerHeight*window.innerHeight+window.innerWidth*window.innerWidth)-Math.sqrt(layer._point.x*layer._point.x+layer._point.y*layer._point.y),
											Math.sqrt(layer._point.x*layer._point.x+layer._point.y*layer._point.y))+100;
					
							
						
							var anim=setInterval(draw,30);
							var shrinkAnim;
							var expandAnim; 
							
							function draw(){
								
								var tmpCtx=document.getElementById("overlay-canvas-"+feature.id).getContext("2d");
								tmpCtx.globalCompositeOperation = 'destination-over';
								//tmpCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
								
								
							
								tmpCtx.save();
								tmpCtx.beginPath();
								tmpCtx.arc(layer._point.x, layer._point.y,d, 0, Math.PI * 2, true);
								tmpCtx.arc(layer._point.x, layer._point.y,120 + (1-i)*(d-120), 0, Math.PI * 2, false);
								tmpCtx.closePath();
								tmpCtx.clip();
								tmpCtx.drawImage(largeImg, 0, 0, window.innerWidth, window.innerWidth);
								tmpCtx.restore();
								
								
								
								var thumbctx=document.getElementById("canvas-"+feature.id).getContext("2d");
								thumbctx.globalCompositeOperation = 'destination-over';
								thumbctx.clearRect(0,0,200,200);
								
								
								
								thumbctx.save();
								thumbctx.beginPath();
								thumbctx.arc(100, 100, 100, 0, Math.PI * 2, true);
								thumbctx.arc(100, 100, i*100, 0, Math.PI * 2, false);
								thumbctx.closePath();
								thumbctx.clip();
								if(i<1)thumbctx.drawImage(thumbImg, 0, 0, 200, 200);
							
								thumbctx.restore();
							
							
									
								if(i>=1) {
									clearInterval(anim);

									var shrunk =true;
									
									popup.on('mousemove',function(e){
										var i=0;
										var d= Math.sqrt((e.pageX-layer._point.x)*(e.pageX-layer._point.x)+(e.pageY-layer._point.y)*(e.pageY-layer._point.y));
										
										if(d>100&&d<140&&shrunk){
											function shrink(){
												clearInterval(expandAnim);
												var tmpCtx=document.getElementById("overlay-canvas-"+feature.id).getContext("2d");
												tmpCtx.globalCompositeOperation = 'destination-over';
												tmpCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
												
												
											
												tmpCtx.save();
												tmpCtx.beginPath();
												tmpCtx.arc(layer._point.x, layer._point.y,10000, 0, Math.PI * 2, true);
												tmpCtx.arc(layer._point.x, layer._point.y,120 + i*30, 0, Math.PI * 2, false);
												tmpCtx.closePath();
												tmpCtx.clip();
												tmpCtx.drawImage(largeImg, 0, 0, window.innerWidth, window.innerWidth);
												tmpCtx.restore();
												
				
											
											
												if(i>=1) {
													clearInterval(shrinkAnim);
													shrinkAnim=false;
													shrunk=false;
												}
												i=parseFloat(i)+0.1	;	

											}	
											if(!shrinkAnim)shrinkAnim=setInterval(shrink,30);
										}else if(!shrunk){
										
											function expand(){
												clearInterval(shrinkAnim);
												var tmpCtx=document.getElementById("overlay-canvas-"+feature.id).getContext("2d");
												tmpCtx.globalCompositeOperation = 'destination-over';
												tmpCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
												
												
											
												tmpCtx.save();
												tmpCtx.beginPath();
												tmpCtx.arc(layer._point.x, layer._point.y,10000, 0, Math.PI * 2, true);
												tmpCtx.arc(layer._point.x, layer._point.y,150 - i*30, 0, Math.PI * 2, false);
												tmpCtx.closePath();
												tmpCtx.clip();
												tmpCtx.drawImage(largeImg, 0, 0, window.innerWidth, window.innerWidth);
												tmpCtx.restore();
												
				
											
											
												if(i>=1) {
													clearInterval(expandAnim);	
													expandAnim=false;
													shrunk=true;
												}
												i=parseFloat(i)+0.1;	

											}	
											if(!expandAnim)expandAnim=setInterval(expand,30);
										
										
										}
									});
									
									overlay.on('click',function(e){
										var d= Math.sqrt((e.pageX-layer._point.x)*(e.pageX-layer._point.x)+(e.pageY-layer._point.y)*(e.pageY-layer._point.y));
										if(d>100&&d<140){
											overlay.fadeOut('fast').remove();
											popup.fadeOut('fast').remove();
											map.featureOn=false;
										}									
									}).on('mousemove',function(e){
										var i=0;
										var d= Math.sqrt((e.pageX-layer._point.x)*(e.pageX-layer._point.x)+(e.pageY-layer._point.y)*(e.pageY-layer._point.y));
										
										if(d>100&&d<140&&shrunk){
											function shrink(){
												clearInterval(expandAnim);
												var tmpCtx=document.getElementById("overlay-canvas-"+feature.id).getContext("2d");
												tmpCtx.globalCompositeOperation = 'destination-over';
												tmpCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
												
												
											
												tmpCtx.save();
												tmpCtx.beginPath();
												tmpCtx.arc(layer._point.x, layer._point.y,10000, 0, Math.PI * 2, true);
												tmpCtx.arc(layer._point.x, layer._point.y,120 + i*30, 0, Math.PI * 2, false);
												tmpCtx.closePath();
												tmpCtx.clip();
												tmpCtx.drawImage(largeImg, 0, 0, window.innerWidth, window.innerWidth);
												tmpCtx.restore();
												
				
											
											
												if(i>=1) {
													clearInterval(shrinkAnim);
													shrinkAnim=false;
													shrunk=false;
												}
												i=parseFloat(i)+0.1	;	

											}	
											if(!shrinkAnim)shrinkAnim=setInterval(shrink,30);
										}else if(!shrunk){
										
											function expand(){
												clearInterval(shrinkAnim);
												var tmpCtx=document.getElementById("overlay-canvas-"+feature.id).getContext("2d");
												tmpCtx.globalCompositeOperation = 'destination-over';
												tmpCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
												
												
											
												tmpCtx.save();
												tmpCtx.beginPath();
												tmpCtx.arc(layer._point.x, layer._point.y,10000, 0, Math.PI * 2, true);
												tmpCtx.arc(layer._point.x, layer._point.y,150 - i*30, 0, Math.PI * 2, false);
												tmpCtx.closePath();
												tmpCtx.clip();
												tmpCtx.drawImage(largeImg, 0, 0, window.innerWidth, window.innerWidth);
												tmpCtx.restore();
												
				
											
											
												if(i>=1) {
													clearInterval(expandAnim);	
													expandAnim=false;
													shrunk=true;
												}
												i=parseFloat(i)+0.1;	

											}	
											if(!expandAnim)expandAnim=setInterval(expand,30);
										
										
										}
									});
								
									
								}
								i=parseFloat(i)+0.015;	
								
							
							
							
							
							
							}
							
							
							
							
							}
						
						}else{
						
							var d= Math.sqrt((e.pageX-layer._point.x)*(e.pageX-layer._point.x)+(e.pageY-layer._point.y)*(e.pageY-layer._point.y));
							
								if(d>100&&d<150){
									$('#overlay-'+feature.id).fadeOut('fast').remove();
									popup.fadeOut('fast').remove();
									map.featureOn=false;
								}
						}
					});
				
				
				
				
				
				
				
				return false;
			  });
			  
			  

		}

		
		L.geoJson([points], {

			
			onEachFeature:onEachFeature,
			

			pointToLayer: function (feature, latlng) {
				return L.circleMarker(latlng, {
					radius: 8,
					fillColor: "blue",
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.8
				});
			}
		}).addTo(map);
		
		this.markers = new Array();
		var that =this;
		var circleOptions = {
        	color: 'red', 
        	fillColor: '#f03', 
        	fillOpacity: 0.5
   		 };

	},
	});
	var MapCollection = Backbone.Collection.extend({

	
		initialize:function(){
			
		
		},
		
		url:'http://alpha.zeega.org/api/items/41366/items',
		parse: function(response){
			console.log(response);
			return response.items;
		
		}

	});

	// Required, return the module for AMD compliance
	return Map;

});