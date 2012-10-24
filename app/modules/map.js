define([
	"app",
	// Libs
	"backbone",
	// submodules
	"modules/submodules/zeega-player",

	// plugins
	"libs/leaflet"

], function(App, Backbone, PlayerSlider) {
	
	var Map = App.module();

	Map.Model = Backbone.Model.extend({
		type: 'Map',
		defaults: {
			title: 'Map'
		},

		initialize: function() {
			console.log('init map');
			var mapCollection = new MapCollection();
			var _this=this;
			mapCollection.fetch({success:function(collection,response){
				_this.mapView = new Map.Views.Main({collection:collection});
				$('#appBase').empty().append( _this.mapView.el );
				_this.mapView.render();
			}});

			
		}
	});

	Map.Views = Map.Views || {};

	Map.Views.Featured = Backbone.LayoutView.extend({
		template : 'mapfeatured',
		serialize : function(){ return this.model.toJSON(); },
		fetch: function(path) {
			// Initialize done for use in async-mode
			var done;

			// Concatenate the file extension.
			path = 'app/templates/'+ path + ".html";

			// If cached, use the compiled template.
			if (JST[path]) {
				return JST[path];
			} else {
				// Put fetch into `async-mode`.
				done = this.async();

				// Seek out the template asynchronously.
				return $.ajax({ url: App.root + path }).then(function(contents) {
					done(JST[path] = _.template(contents));
				});
			}
		},

		events : {
			'click .amm-featured-player' : 'goToFeaturedPlayer'
		},

		goToFeaturedPlayer : function()
		{
			console.log('do this');
			App.Player = new PlayerSlider.Model({
				parent: this.model,
				project_url: "http://alpha.zeega.org/api/projects/2259",
				remix_url: "http://alpha.zeega.org/api/items/49217"
			});
		}
	});

	Map.Views.Main  = Backbone.LayoutView.extend({
		id : 'base-map',
		template: 'map',
		fetch: function(path) {
			// Initialize done for use in async-mode
			var done;

			// Concatenate the file extension.
			path = 'app/templates/'+ path + ".html";

			// If cached, use the compiled template.
			if (JST[path]) {
				return JST[path];
			} else {
				// Put fetch into `async-mode`.
				done = this.async();

				// Seek out the template asynchronously.
				return $.ajax({ url: App.root + path }).then(function(contents) {
					done(JST[path] = _.template(contents));
				});
			}
		},

		latLng: new L.LatLng(30.266702991845,-97.745532989502),
		
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
					"id":item.id
				});
			});
			return { "type": "FeatureCollection", "features": p};
		},

		afterRender:function(){
			

			var cloudmade = new L.TileLayer('http://{s}.tiles.mapbox.com/v3/zeega.map-17habzl6/{z}/{x}/{y}.png', {maxZoom: 18, attribution: ''}),
				homemade = new L.TileLayer('assets/img/map.png#{z}/{x}/{y}', {maxZoom: 18, attribution: ''});
				
			this.map = new L.Map(this.el,{
				dragging:false,
				touchZoom:false,
				scrollWheelZoom:false,
				doubleClickZoom:false,
				boxZoom:false,
				zoomControl:false
			});
			this.map.setView(this.latLng, 15).addLayer(cloudmade).addLayer(homemade);
			this.map.featureOn=false;
			this.loadItems();
			
		},
		clearItems:function(){
			$('.map-overlay').remove();
			var map=this.map;
			map.featureOn=false;
			_.each(map._layers,function(layer){
				if(!_.isUndefined(layer.feature))map.removeLayer(layer);
			});
			this.loadItems();
			
		},
		loadItems:function(){
			this.itemsLayer='';
			var map=this.map,
				radius=114,
				diameter=2*radius,
				points = this.createPoints(),
				itemLayer=this.itemLayer;
			
			

			function onEachFeature(feature, layer) {
				layer.on("mouseover", function (e) {
					layer.projectLatlngs();
					var layerPoint=map.latLngToContainerPoint(layer._latlng);
					layer._point=layerPoint;
					var x=layer._point.x-radius;
					var y=layer._point.y-radius-30;
					var height = diameter+30;
					var popup = $("<div></div>", {
						id: "popup-" + feature.id,
						css: {
							position: "absolute",
							top: y+"px",
							left: x+"px",
							zIndex: 12,
							width:diameter+"px",
							height:height+"px",
							cursor: "pointer"
		
						}
					}).addClass('map-overlay');
					
					var hed = $("<div id='wrapper-"+feature.id+"' style='z-index:18; position:absolute; top:30px; opacity:.8'><canvas id='canvas-"+feature.id+"' width='"+diameter+"' height='"+diameter+"'></canvas></div>").appendTo(popup);
					// Add the popup to the map
					popup.appendTo($('body'));
					
					var thumbImg = document.createElement('img');
					thumbImg.src = feature.properties.thumbnail_url;
					var r=0;
					function drawThumb(){
						if(_.isNull(document.getElementById("canvas-"+feature.id))){
							clearInterval(drawThumbAnim);
						} 
						else{
							var tmpCtx=document.getElementById("canvas-"+feature.id).getContext("2d");
							tmpCtx.save();
							tmpCtx.beginPath();
							tmpCtx.arc(radius, radius, radius*r, 0, Math.PI * 2, true);
							tmpCtx.closePath();
							tmpCtx.clip();
							tmpCtx.drawImage(thumbImg, 0, 0, diameter, diameter);
							tmpCtx.restore();
							if(r>=1)clearInterval(drawThumbAnim);
							r=parseFloat(r)+0.05;
						}
					}
					var drawThumbAnim=setInterval(drawThumb,20);


					popup.on('mousemove',function(e){
						if(!map.featureOn){
							var d= Math.sqrt((e.pageX-layer._point.x)*(e.pageX-layer._point.x)+(e.pageY-layer._point.y)*(e.pageY-layer._point.y));
									if(d>20){
										clearInterval(drawThumbAnim);
										$("#popup-" + feature.id).fadeOut('fast',function(){$(this).remove(); });
								}
							}
						})
						.on('click',function(e){
							if(!map.featureOn){

								var featuredView = new Map.Views.Featured({model:new Backbone.Model(feature.properties)});
								featuredView.render();
								$('#popup-'+feature.id).append(featuredView.el);

								map.featureOn=true;
								var overlay = $("<div></div>", {
									id: "overlay-" + feature.id,
									css: {
										cursor: "pointer",
										position: "absolute",
										top: "0px",
										left: "0px",
										zIndex: 11,
										width:"100%",
										height:"100%"
					
									}
								}).addClass('map-overlay');
								
								var hedd = $("<div id='overlay-wrapper-"+feature.id+"' style='opacity:1'><canvas id='overlay-canvas-"+feature.id+"' width='"+window.innerWidth+"' height='"+window.innerHeight+"'></canvas></div>").appendTo(overlay);
								overlay.appendTo($('body'));
								var largeImg = document.createElement('img');
		
								largeImg.src = feature.properties.uri;
								largeImg.onload = function() {
										
									var i=0;
									var k = Math.sqrt(window.innerHeight*window.innerHeight+window.innerWidth*window.innerWidth);
						
								//Want animation radius to be large enough such that begins at farthest corner of the screen
									var d =2*Math.max( Math.sqrt(window.innerHeight*window.innerHeight+window.innerWidth*window.innerWidth)-Math.sqrt(layer._point.x*layer._point.x+layer._point.y*layer._point.y),
												Math.sqrt(layer._point.x*layer._point.x+layer._point.y*layer._point.y));
						
								
							
								var drawLargeImageAnim=setInterval(drawLargeImage,20);
								var shrinkAnim;
								var expandAnim; 
								
								function drawLargeImage(){
									if(_.isNull(document.getElementById("overlay-canvas-"+feature.id))) clearInterval(drawThumbAnim);
									else
									{
										var tmpCtx=document.getElementById("overlay-canvas-"+feature.id).getContext("2d");
										tmpCtx.globalCompositeOperation = 'destination-over';
										
										tmpCtx.save();
										tmpCtx.beginPath();
										tmpCtx.arc(layer._point.x, layer._point.y,d, 0, Math.PI * 2, true);
										tmpCtx.arc(layer._point.x, layer._point.y, (radius+20) + (1-i)*(d-(radius+20)), 0, Math.PI * 2, false);
										tmpCtx.closePath();
										tmpCtx.clip();
										tmpCtx.drawImage(largeImg, 0, 0, window.innerWidth, window.innerWidth);
										tmpCtx.restore();
										
										var thumbctx=document.getElementById("canvas-"+feature.id).getContext("2d");
										thumbctx.globalCompositeOperation = 'destination-over';
										thumbctx.clearRect(0,0,diameter,diameter);

										thumbctx.save();
										thumbctx.beginPath();
										thumbctx.arc(radius, radius, radius, 0, Math.PI * 2, true);
										thumbctx.arc(radius, radius, i*radius, 0, Math.PI * 2, false);
										thumbctx.closePath();
										thumbctx.clip();
										if(i<1) thumbctx.drawImage(thumbImg, 0, 0, diameter, diameter);
									
										thumbctx.restore();

										if(i>=1) {
											clearInterval(drawLargeImageAnim);
											$('#wrapper-'+feature.id).remove();
											$('#marker-container').addClass('marker').fadeIn('fast');
											var shrinkGapAnim,expandGapAnim,
												gapState = 'small';

												
											$('.map-overlay').on('mousemove',function(e){
												var i=0;
												var d= Math.sqrt((e.pageX-layer._point.x)*(e.pageX-layer._point.x)+(e.pageY-layer._point.y)*(e.pageY-layer._point.y));
												function expandGap(){
													if(_.isNull(document.getElementById("overlay-canvas-"+feature.id))){
														clearInterval(expandGapAnim);
													}
													else{	
														var tmpCtx=document.getElementById("overlay-canvas-"+feature.id).getContext("2d");
														tmpCtx.globalCompositeOperation = 'destination-over';
														tmpCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
													
														tmpCtx.save();
														tmpCtx.beginPath();
														tmpCtx.arc(layer._point.x, layer._point.y,10000, 0, Math.PI * 2, true);
														tmpCtx.arc(layer._point.x, layer._point.y,(radius+20) + i*30, 0, Math.PI * 2, false);
														tmpCtx.closePath();
														tmpCtx.clip();
														tmpCtx.drawImage(largeImg, 0, 0, window.innerWidth, window.innerWidth);
														tmpCtx.restore();
													
														if(i>=1) {
															clearInterval(expandGapAnim);
															expandGapAnim=false;
															gapState='large';
															$('.back-to-map').fadeIn('fast');
															
														}
														i=parseFloat(i)+0.1	;
													}
												}	
												function shrinkGap(){
													if(_.isNull(document.getElementById("overlay-canvas-"+feature.id))){
														clearInterval(expandGapAnim);
													}
													else
													{
														$('.back-to-map').hide();
														var tmpCtx=document.getElementById("overlay-canvas-"+feature.id).getContext("2d");
														tmpCtx.globalCompositeOperation = 'destination-over';
														tmpCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
													
														tmpCtx.save();
														tmpCtx.beginPath();
														tmpCtx.arc(layer._point.x, layer._point.y,10000, 0, Math.PI * 2, true);
														tmpCtx.arc(layer._point.x, layer._point.y,radius+50 - i*30, 0, Math.PI * 2, false);
														tmpCtx.closePath();
														tmpCtx.clip();
														tmpCtx.drawImage(largeImg, 0, 0, window.innerWidth, window.innerWidth);
														tmpCtx.restore();
						
														if(i>=1) {
															clearInterval(shrinkGapAnim);	
															shrinkGapAnim=false;
															gapState='small';
														}
														i=parseFloat(i)+0.1;
													}
												}

												if(d>radius&&d<radius+20&&gapState=='small'){
													clearInterval(shrinkGapAnim);
													if(!expandGapAnim){
														i=0;
														expandGapAnim=setInterval(expandGap,30);
													}
												}

												else if((gapState == 'large'&&d<radius)||(gapState == 'large'&&d>radius+50)){
													clearInterval(expandGapAnim);
													if(!shrinkGapAnim){
														shrinkGapAnim=setInterval(shrinkGap,30);
														i=0;
													}
												}

											});
										
										
											overlay.on('click',function(e){
												var d= Math.sqrt((e.pageX-layer._point.x)*(e.pageX-layer._point.x)+(e.pageY-layer._point.y)*(e.pageY-layer._point.y));
												if(d>radius&&d<radius+50){
													$('.map-overlay').fadeOut('slow',function(){$(this).remove();});
													map.featureOn=false;
												}									
											});
										}
									i=parseFloat(i)+0.015;	
									}
								}
								};
							
							}else{
							
								var d= Math.sqrt((e.pageX-layer._point.x)*(e.pageX-layer._point.x)+(e.pageY-layer._point.y)*(e.pageY-layer._point.y));
								
								if(d>100&&d<150){
									$('.map-overlay').fadeOut('slow',function(){$(this).remove();});
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
		
		}
	});



	var MapCollection = Backbone.Collection.extend({

	
		initialize:function(){
			
		
		},
		
		url:'http://alpha.zeega.org/api/items/49295/items',
		parse: function(response){
			console.log('returned collection');
			return response.items;
		}

	});

	// Required, return the module for AMD compliance
	return Map;

});