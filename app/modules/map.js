define([
	"app",
	// Libs
	"backbone",
	"modules/submodules/helpers"
	

], function(App, Backbone, Helpers) {
	
	var Map = App.module();




	Map.recentCollectionId = 62472;
	Map.featuredCollectionId = 53567;
	Map.defaultCenter = new L.LatLng(30.266702991845,-97.745532989502);
		
	

	Map.Model = Backbone.Model.extend({
		type: 'Map',
		collectionId: Map.featuredCollectionId,
		defaults: {
			title: 'Map'
		},

		initialize: function() {
			
			var mapCollection = new Map.Collection({id:this.collectionId});
			var _this=this;
			App.playlistCollection = new Map.PlaylistCollection();
			App.playlistCollection.fetch({success:function(collection,response){
				App.playlistCollection.createKeys();
				App.playlistCollection.getMatches(['Blues']);
				mapCollection.fetch({success:function(collection,response){
					_this.mapView = new Map.Views.Main({collection:collection});
					$('#appBase').empty().append( _this.mapView.el );
					_this.mapView.render();
				}});
			}});

			
		}
	});

	Map.Views = Map.Views || {};

	Map.Views.Featured = Backbone.LayoutView.extend({
		template : 'mapfeatured',
		serialize : function(){ return this.model.toJSON(); }
	});

	Map.Views.SpotlightShelf = Backbone.LayoutView.extend({
		template: 'spotlight-shelf',
		events : {
			'click .shelf-tab' : 'slideShelf',
			'mouseenter .region' : 'showPlaylists',
			'mouseleave .region' : 'hidePlaylists'
		},
		slideShelf : function(e) {
			$(e.target).toggleClass('active');
			if ( $(e.target).hasClass('active') ) {
				this.$('.shelf-content').stop().animate({ top: -330, opacity: 1 }, 1000, this.fadeMetaIn);
			} else {
				this.$('.shelf-content').stop().animate({ top: 0, opacity: 0 }, 1000, this.hideMeta);
			}
		},
		showPlaylists : function(e) {
			$(e.currentTarget)
				.find('.spotlight-featured').fadeIn(300)
				.siblings().find('h2, h3').fadeOut(300);
		},
		hidePlaylists : function(e) {
			$(e.currentTarget)
				.find('.spotlight-featured').fadeOut(300)
				.siblings().find('h2, h3').fadeIn(300);
		},
		fadeMetaIn : function(e) {
			$(this).find('.rollover-info').each( function(i,v) {
				var _this = this;
				_.delay( function() {
					console.log(this);
					$(_this).fadeIn(500 * (i + 1));
				}, 1000);
			});
		},
		hideMeta : function(e) {
			$(this).find('.rollover-info').hide();
		}
	});

	Map.Views.Main  = Backbone.LayoutView.extend({
		id : 'base-map',
		template: 'map',
		latLng: Map.defaultCenter,
		featureCollection: { "type": "FeatureCollection", "features": []},

		initialize : function(options){
			_.extend(this,options);
			this.addFeatures(this.collection);
		},
		
		afterRender:function(){
			
			var southWest = new L.LatLng(30.06708702605154, -98.14959352154544),
				northEast = new L.LatLng(30.567750855154863, -97.43685548443608),
				bounds = new L.LatLngBounds(southWest, northEast);
			var cloudmade = new L.TileLayer('http://{s}.tiles.mapbox.com/v3/zeega.map-17habzl6/{z}/{x}/{y}.png', {maxZoom: 18, attribution: ''}),
				homemade = new L.TileLayer('http://dev.zeega.org/paper/_tiles/paper_{x}_{y}.png', {
				//homemade = new L.TileLayer('http://dev.zeega.org/paper/paper.php?x={x}&y={y}', {
					maxZoom: 18,
					attribution: ''
				});

			this.map = new L.Map(this.el,{
				// dragging:false,
				touchZoom:false,
				scrollWheelZoom:false,
				doubleClickZoom:false,
				boxZoom:false,
				zoomControl:true,
				attribution:'',
				maxBounds:bounds,
				maxZoom:17,
				minZoom:13,
				layers: [cloudmade,homemade]
			});
			this.map.setView(this.latLng, 14);
			this.map.featureOn=false;
			this.animateMap();
			//this.resetPoints();
			//This loads neighborhood polygons
			//this.loadNeighborhoods();
			this.loadSpotlightShelf();
		
		},
		
		addFeatures:function(collection,reset){
			
			var features;
			if(!_.isUndefined(reset)&&reset)features=[];
			else features=this.featureCollection.features;

			var newFeatures = this.parseFeatures(collection,features);
			this.featureCollection.features = _.union(features,newFeatures);
			
			return { "type": "FeatureCollection", "features": newFeatures};

		},

		parseFeatures:function(collection,features){
			var p=[];
			_.each(_.toArray(collection), function(item){
				if(!_.isNull(item.get('media_geo_longitude')))
				{
					
					if(collection.id == Map.recentCollectionId){
						var newTags = item.get('tags');
						newTags[newTags.length]="recent";
						item.set('tags',newTags);
					}
					item.attributes.playlists=App.playlistCollection.getMatches(item.get('tags'));
					if(_.isUndefined(_.find(features,function(obj){return item.get('media_geo_latitude')==obj.geometry.coordinates[1];}))){
						features.push({
							"type": "Feature",
							"geometry": {
								"type": "Point",
								"coordinates": [item.get('media_geo_longitude'), item.get('media_geo_latitude')]
							},
							"properties":item.attributes,
							"id":item.id
						});
						p.push({
							"type": "Feature",
							"geometry": {
								"type": "Point",
								"coordinates": [item.get('media_geo_longitude'), item.get('media_geo_latitude')]
							},
							"properties":item.attributes,
							"id":item.id
						});
					}
				}
			});
			return p;

		},

		loadPlaylist:function(id){
			var _this=this,
				collection = new Map.Collection({id:id});
			
			collection.fetch({success:function(collection,response){
				_this.addFeatures(collection,true);
				_this.resetPoints();
			}});

		},

		animateMap:function(){
			
			this.drawIntroPoints(this.featureCollection);

			var map=this.map,
				counter=0,
				_this=this,
				layerArray=_.shuffle(_.filter(_.toArray(map._layers),function(layer){return !_.isUndefined(layer.feature);}));


			//console.log(map._layers[Math.floor(Math.rand()*map._layers.length)]);
			function animatePoint(){
				var layer = layerArray[counter];
				
				layer.fire('animate');
				_.delay(function(){
					$('#popup-'+layer.feature.properties.id).trigger('mousemove');
				},250);
				
				if(counter>3){
					clearInterval(_this.introAnimation);
					_.delay(function(){_this.resetPoints();},3000);
				}
				counter++;
			}
			//animatePoint();

			this.introAnimation = setInterval(animatePoint,1200);
			
		},

		loadRecent:function(){
			var _this=this,
				collection = new Map.Collection({id:Map.recentCollectionId});
			
			collection.fetch({success:function(collection,response){
				var recentPoints=_this.addFeatures(collection,false);
				_this.resetPoints();
			}});
		},

		resetPoints:function(){
			if(this.introAnimation)clearInterval(this.introAnimation);
			if(this.dotAnimate)clearInterval(this.dotAnimate);
			$('.map-overlay').remove();
			var map=this.map;
			map.featureOn=false;
			_.each(map._layers,function(layer){
				if(!_.isUndefined(layer.feature))map.removeLayer(layer);
			});
			this.drawPoints(this.featureCollection);
		},

		resetMap:function(){

			this.addFeatures(this.collection,true);
			this.resetPoints();
		},

		drawPoints:function(features){
			
			this.itemsLayer='';
			var map=this.map,
				radius=108,
				diameter=2*radius,
				itemLayer=this.itemLayer;
			var _this = this;
			

			function onEachFeature(feature, layer) {
			
				layer.on("mouseover", function (e) {
					console.log(Helpers);
					
					var isFeature = _.contains(feature.properties.tags,'feature');

					App.soundscape.ding();

					//layer.projectLatlngs();
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
							height:height+"px"
						}
					}).addClass('map-overlay');

					if(isFeature) popup.addClass('featured-popup');

					var popupTemplate =
						"<div id='wrapper-"+feature.id+"' style='z-index:18; position:absolute; top:30px; opacity:.8'>"+
							""+
							"<div class='rollover-title-wrapper'>"+
								"<div class='marker-container'></div>"+
								"<div class='rollover-title'>"+
									"<h2>"+
										feature.properties.title +
									"</h2>"+
								"</div>"+
								"<div class='rollover-meta'>"+
									"<h3>"+
										'by '+ feature.properties.media_creator_username +
									"</h3>"+
									"<h3>"+
										'added '+ Helpers.formatDateCreated(feature.properties.date_created) +
									"</h3>"+
								"</div>"+
							"</div>"+
							"<canvas id='canvas-"+feature.id+"' width='"+diameter+"' height='"+diameter+"'></canvas>"+
						"</div>";

					var popupContent = $(popupTemplate).appendTo(popup);
					// Add the popup to the map
					popup.appendTo($('body'));

					_.delay(function(){ $(popupContent).find('.rollover-title-wrapper').fadeIn(); },500);
					
					var thumbImg = document.createElement('img');
					if(feature.properties.media_type=="Audio"){
						thumbImg.src = "assets/img/audio-icon.png";
					} else {
						thumbImg.src = feature.properties.thumbnail_url;
					}
					var r=0;
					drawThumb = function(){
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
					};
					drawThumbAnim=setInterval(drawThumb,20);


					popup.on('mousemove',function(e){
						
						if(!map.featureOn){
							if(_.isUndefined(e.which)){
								clearInterval(drawThumbAnim);
								$("#popup-" + feature.id).fadeOut('fast',function(){$(this).remove(); });
							}
							else{
								var d= Math.sqrt((e.pageX-layer._point.x)*(e.pageX-layer._point.x)+(e.pageY-layer._point.y)*(e.pageY-layer._point.y));
										if(d>20){
											clearInterval(drawThumbAnim);
											$("#popup-" + feature.id).fadeOut('fast',function(){$(this).remove(); });
									}
								}
							}
						})
						.on('click',function(e){
							
							
							if(!map.featureOn){


								


								$('#wrapper-'+feature.id).remove();

								$(window).bind('keyup.playerSlider', function(e){
									if(e.which == 27){
										$('.map-overlay').fadeOut('slow',function(){$(this).remove();});
										map.featureOn=false;
									}
								});


							
								var featuredView = new Map.Views.Featured({model:new Backbone.Model(feature.properties)});
								featuredView.render();
								$('#popup-'+feature.id).append(featuredView.el);

								map.featureOn=true;
								var overlay = $("<div></div>", {
									id: "overlay-" + feature.id,
									css: {
										
										position: "absolute",
										top: "0px",
										left: "0px",
										zIndex: 11,
										width:"100%",
										height:"100%"
					
									}
								}).addClass('map-overlay');
								
								$("<div id='overlay-wrapper-"+feature.id+"' style='opacity:1'><canvas id='overlay-canvas-"+feature.id+"' width='"+window.innerWidth+"' height='"+window.innerHeight+"' style='position: absolute; left: 0; top: 0;'></canvas></div>").appendTo(overlay);
								overlay.appendTo($('body'));
								
								
								var largeImg = document.createElement('img');
		

								if(feature.properties.media_type=="Image"){
									largeImg.src = feature.properties.uri;
								} else if(feature.properties.media_type=="Audio"){
									largeImg.src ="assets/img/audio"+Math.floor(Math.random()*5)+".png";
								} else {
									largeImg.src =feature.properties.thumbnail_url;
								}
								
								largeImg.onload = function()
								{
									
									var largeImgW, largeImgH;
									if(largeImg.height/largeImg.width>window.innerHeight/window.innerWidth){
										largeImgW=window.innerWidth;
										largeImgH=largeImg.height*window.innerWidth/largeImg.width;
									}else{
										largeImgW=largeImg.width*window.innerHeight/largeImg.height;
										largeImgH=window.innerHeight;
									}
										
									var i=0;
									var k = Math.sqrt(window.innerHeight*window.innerHeight+window.innerWidth*window.innerWidth);
						
									//Want animation radius to be large enough such that begins at farthest corner of the screen
									var d =2*Math.max( Math.sqrt(window.innerHeight*window.innerHeight+window.innerWidth*window.innerWidth)-Math.sqrt(layer._point.x*layer._point.x+layer._point.y*layer._point.y),
												Math.sqrt(layer._point.x*layer._point.x+layer._point.y*layer._point.y));
						
								
							
									var drawLargeImageAnim=setInterval(drawLargeImage,20);
									var shrinkAnim;
									var expandAnim;
									


									function drawLargeImage()
									{
										
										if(_.isNull(document.getElementById("overlay-canvas-"+feature.id))) clearInterval(drawThumbAnim);
										else
										{

											if(i<1) {
												var f;
												if(i<0.7){
													f = 1-(0.7-i)*(0.7-i);
												}
												else{
													f=1;
												}

												var tmpCtx=document.getElementById("overlay-canvas-"+feature.id).getContext("2d");
												tmpCtx.globalCompositeOperation = 'destination-over';
												
												tmpCtx.save();
												tmpCtx.beginPath();
												tmpCtx.arc(layer._point.x, layer._point.y,d, 0, Math.PI * 2, true);
												tmpCtx.arc(layer._point.x, layer._point.y, (radius+50) + (1-f)*(d-(radius+50)), 0, Math.PI * 2, false);
												tmpCtx.closePath();
												tmpCtx.clip();
												tmpCtx.drawImage(largeImg, 0, 0, largeImgW, largeImgH);
												tmpCtx.restore();
											}
											else if(i>=1){
												
												clearInterval(drawLargeImageAnim);
												$('.back-to-map').fadeIn('fast');
												var shrinkGapAnim,expandGapAnim,
													gapState = 'small';

											
												
												$('#item-playlist .p-link').click(function(){
													$(this).unbind();
													
													$('#popup-'+feature.id).remove();
													var ii=0;
													function drawFullImage(){
														if(_.isNull(document.getElementById("overlay-canvas-"+feature.id))){
															clearInterval(drawFullImageAnim);
															drawFullImageAnim=false;
														}
														else
														{
															//$('.back-to-map').hide();
															var tmpCtx=document.getElementById("overlay-canvas-"+feature.id).getContext("2d");
															tmpCtx.globalCompositeOperation = 'destination-over';
															tmpCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
														
															tmpCtx.save();
															tmpCtx.beginPath();
															tmpCtx.arc(layer._point.x, layer._point.y,10000, 0, Math.PI * 2, true);
															tmpCtx.arc(layer._point.x, layer._point.y,(radius+50)*(1-ii), 0, Math.PI * 2, false);
															tmpCtx.closePath();
															tmpCtx.clip();
															tmpCtx.drawImage(largeImg, 0, 0, largeImgW, largeImgH);
															tmpCtx.restore();
							
															if(ii>=0.9) {
															
																clearInterval(drawFullImageAnim);
																drawFullImageAnim=false;
															}
															ii=parseFloat(ii)+0.1;
														}
													}
													drawFullImageAnim=setInterval(drawFullImage,30);
											
												});
											
												if(window.location.hash.indexOf('playlist')>-1){
													$('#item-playlist').trigger('click');
												}

												

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
															tmpCtx.arc(layer._point.x, layer._point.y,(radius+50) + i*8, 0, Math.PI * 2, false);
															tmpCtx.closePath();
															tmpCtx.clip();
															
															tmpCtx.drawImage(largeImg, 0, 0, largeImgW, largeImgH);
															tmpCtx.restore();
														
															if(i>=1) {
																clearInterval(expandGapAnim);
																expandGapAnim=false;
																gapState='large';
																//$('.back-to-map').fadeIn('fast');
																
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
															//$('.back-to-map').hide();
															var tmpCtx=document.getElementById("overlay-canvas-"+feature.id).getContext("2d");
															tmpCtx.globalCompositeOperation = 'destination-over';
															tmpCtx.clearRect(0,0,window.innerWidth,window.innerHeight);
														
															tmpCtx.save();
															tmpCtx.beginPath();
															tmpCtx.arc(layer._point.x, layer._point.y,10000, 0, Math.PI * 2, true);
															tmpCtx.arc(layer._point.x, layer._point.y,radius+58 - i*8, 0, Math.PI * 2, false);
															tmpCtx.closePath();
															tmpCtx.clip();
															tmpCtx.drawImage(largeImg, 0, 0, largeImgW, largeImgH);
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
								$(window).unbind('keyup.mapOverlay');
								if(d>100&&d<150){
									$('.map-overlay').fadeOut('slow',function(){$(this).remove();});
									map.featureOn=false;
								}
							}
						});
				

				return false;
				});
				
			}

			function pointToLayer(feature, latlng) {
					

					//create arbitrary but consistent point classes for each feature
					var k=0;
					for(var i=0;i<feature.properties.title.length;i++){
						k+= feature.properties.title.charCodeAt(i);
					}
					k=k%57;
					
				
					var ico;
					if(_.indexOf(feature.properties.tags,'feature')>-1){
						ico = L.divIcon({
							className : 'custom-icon',
							iconAnchor: new L.Point(10,10),
							html:'<i class="amm-dot-'+ k +' dot-red"></i>'
						});
						
					}
					else {
						ico = L.divIcon({
							className : 'custom-icon',
							iconAnchor: new L.Point(10,10),
							html:'<i class="amm-dot-'+ k +'"></i>'
						});
					}
					return L.marker(latlng,{icon:ico});

				
			}
			L.geoJson([features], {
				onEachFeature:onEachFeature,
				pointToLayer: pointToLayer
			}).addTo(map);

		},

		drawIntroPoints:function(features,intro){
			
			this.itemsLayer='';
			var map=this.map,
				radius=108,
				diameter=2*radius,
				itemLayer=this.itemLayer;
			var _this = this;
			

			function onEachFeature(feature, layer) {
				layer.on("animate",function(){
					
							App.soundscape.ding();
							var layerPoint=map.latLngToContainerPoint(layer._latlng);
					layer._point=layerPoint;
					var x=layer._point.x-radius;
					var y=layer._point.y-radius-30;
					var height = diameter+30;
					var popup = $("<div></div>", {
						id: "animate-popup-" + feature.id,
						css: {
							position: "absolute",
							top: y+"px",
							left: x+"px",
							zIndex: 12,
							width:diameter+"px",
							height:height+"px"
						}
					}).addClass('map-overlay');

					
					var popupTemplate =
						"<div id='wrapper-"+feature.id+"' style='z-index:18; position:absolute; top:30px; opacity:.8'>"+
							""+
							"<div class='rollover-title-wrapper'>"+
								"<div class='marker-container'></div>"+
								"<div class='rollover-title'>"+
									"<h2>"+
										feature.properties.title +
									"</h2>"+
								"</div>"+
								"<div class='rollover-meta'>"+
									"<h3>"+
										'by '+ feature.properties.media_creator_username +
									"</h3>"+
								"</div>"+
							"</div>"+
							"<canvas id='canvas-"+feature.id+"' width='"+diameter+"' height='"+diameter+"'></canvas>"+
						"</div>";

					$(popupTemplate).appendTo(popup);
					
					// Add the popup to the map
					popup.appendTo($('body'));
					
					var thumbImg = document.createElement('img');
					thumbImg.src = feature.properties.thumbnail_url;
					var r=0;
					//var limit = Math.random()*0.7+0.3;
					var limit =1;
					animThumb = function(){
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
							if(r>=limit){
								clearInterval(drawThumbAnim);
								_.delay(function(){$("#animate-popup-" + feature.id).fadeOut('slow',function(){$(this).remove(); });},2000);
							}
							r=parseFloat(r)+0.05;
						}
					};
					drawThumbAnim=setInterval(animThumb,30);
				
					return false;
				});
			}

			function pointToLayer(feature, latlng) {
					
				
				//create arbitrary but consistent point classes for each feature
				var k=0;
				for(var i=0;i<feature.properties.title.length;i++){
					k+= feature.properties.title.charCodeAt(i);
				}
				k=k%57;
				
			
				var ico;
				if(_.indexOf(feature.properties.tags,'feature')>-1){
					ico = L.divIcon({
						className : 'custom-icon',
						iconAnchor: new L.Point(10,10),
						html:'<i class="amm-dot-'+ k +' dot-red"></i>'
					});
					
				}
				else {
					ico = L.divIcon({
						className : 'custom-icon',
						iconAnchor: new L.Point(10,10),
						html:'<i class="amm-dot-'+ k +'"></i>'
					});
				}
				return L.marker(latlng,{icon:ico});
			}

			L.geoJson([features], {
				onEachFeature:onEachFeature,
				pointToLayer: pointToLayer
			}).addTo(map);

		},

		loadNeighborhoods:function(){
		
			var map=this.map;

			L.geoJson.prototype.getCenter=function(){
				var feature =this.feature;
				var lat=0,lng=0,counter=0;
				_.each(feature.geometry.coordinates[0],function(coord){
					
					//if(lat!=0) lat=Math.min(coord[1],lat);
					//else lat=coord[1];
					lat+=coord[1];
					lng+=coord[0];
					counter++;
				});
				return new L.LatLng(lat/counter,lng/counter);
			};

			L.geoJson.prototype.getBounds=function(){
				var feature=this.feature;
				var nelat=0,nelng=0,swlat=0,swlng=0,counter=0;
				_.each(feature.geometry.coordinates[0],function(coord){

					if(swlng!==0) swlng=Math.min(coord[0],swlng);
					else swlng=coord[0];

					if(nelng!==0) nelng=Math.max(coord[0],nelng);
					else nelng=coord[0];

					if(swlat!==0) swlat=Math.min(coord[1],swlat);
					else swlat=coord[1];

					if(nelat!==0) nelat=Math.max(coord[1],nelat);
					else nelat=coord[1];

				});
				var southWest = new L.LatLng(swlat, swlng),
				northEast = new L.LatLng(nelat, nelng);
				return new L.LatLngBounds(southWest, northEast);
			};

				var onEachFeature=function(feature,layer){
					var uniq=Math.floor(Math.random()*1000);
					
					layer.on("mouseover",function(e){
						layer.setStyle({fillOpacity:0.5});
					/*
						
						var latlng = this.getCenter();
						var layerPoint=map.latLngToContainerPoint(latlng);
						var popup = $("<div></div>", {
							id: "popup-" + uniq,
							css: {
								position: "absolute",
								top: (layerPoint.y-50)+"px",
								left: (layerPoint.x-50)+"px",
								zIndex: -1,
								cursor: "pointer"
			
							}
						});
						// Insert a headline into that popup
						var hed = $("<div></div>", {
						text: feature.properties.title,
						css: {fontSize: "25px", marginBottom: "3px",color:feature.properties.color}
						}).appendTo(popup);
						
						// Add the popup to the map
						popup.appendTo(".leaflet-overlay-pane");
						*/

				});
				layer.on("click",function(){
					map.fitBounds(layer.getBounds());

				});
				layer.on("mouseout",function(e){
					
						layer.setStyle({fillOpacity:0.2});
						//$('#popup-'+uniq).remove();
					
				});


			};
			//_.each(AustinNeighborhoods.geojson,function(poly){
			//console.log(poly.properties.color);


				var layer = L.geoJson(Neighborhoods.geojson,{
					style: function(feature){
						return {
							color:feature.properties.color,
							//color: 'black',
							weight: 1,
							opacity: 0,
							fillOpacity: 0.2
						};
					},
					onEachFeature:onEachFeature
				}).addTo(map);
				this.drawPoints(this.featureCollection);
			//});
		},

		loadSpotlightShelf : function() {
			var spotlightItems = this.collection.filter( function(item) {
					return (_.contains( item.get('tags'), 'kutfeature' ));
				}),
				shelf = new Map.Views.SpotlightShelf();

			shelf.render();
			$('#appBase').append( shelf.el );

			if (spotlightItems[0]) {
				var itemOne = new Map.Views.SpotlightItem( { model : spotlightItems[0] } );
				shelf.setView(".spotlight-one", itemOne);
				itemOne.render();
			}

			if (spotlightItems[1]) {
				var itemTwo = new Map.Views.SpotlightItem( { model : spotlightItems[1] } );
				shelf.setView(".spotlight-two", itemTwo);
				itemTwo.render();
			}
			
			if (spotlightItems[2]) {
				var itemThree = new Map.Views.SpotlightItem( { model : spotlightItems[2] } );
				shelf.setView(".spotlight-three", itemThree);
				itemThree.render();
			}

		}

	});

	Map.Views.SpotlightItem = Backbone.LayoutView.extend({
		template: 'spotlight-item',
		serialize : function(){ return this.model.toJSON(); }
	});


	Map.Collection = Backbone.Collection.extend({

	
		initialize:function(options){
			this.id=options.id;
		
		},
		
		url: function(){
			if(this.id == Map.recentCollectionId) return localStorage.api+"/items/search?exclude_content=Collection&sort=date-desc&content=all&page=1&r_itemswithcollections=1&user=1311&limit=200";
			return localStorage.api+'/items/'+this.id+'/items';
		},

		parse: function(response){
			return response.items;
		}

	});

	Map.PlaylistCollection = Backbone.Collection.extend({

	
		initialize:function(){
			
		
		},
		
		url:function(){
			return localStorage.api+'/items/50264/items';
		},

		createKeys:function(){
			var keys=[];
			_.each(this.models,function(model){
				if(!_.isUndefined(model.get('attributes').tags))keys.push(model.get('attributes').tags.toLowerCase());

			});
			this.keys=keys;
		},

		getMatches:function(candidates){
			var matches = [];
			var models = this.models;
			_.each(_.intersection(this.keys,candidates),function(key){
				matches.push(_.find(models, function(model){
                                if(!_.isUndefined(model.get('attributes').tags)) return key == model.get('attributes').tags.toLowerCase();

else return false;
 }));

			});

			return matches;
		},
		
		parse: function(response){
			return response.items;
		},

		comparator: function(playlist1,playlist2) {
			// always on top if it has tag 'hotplaylist'
			if ( _.contains(playlist1.get('tags'), 'hotplaylist' ) && !_.contains(playlist2.get('tags'), 'hotplaylist' ) ) {
				return -1;
			} else if (_.contains(playlist2.get('tags'), 'hotplaylist' ) && !_.contains(playlist1.get('tags'), 'hotplaylist' )) {
				return 1;
			} else {
				// if not sort alphabetically
				if ( playlist1.get('title') < playlist2.get('title') ) {
					return -1;
				} else if ( playlist1.get('title') > playlist2.get('title') ) {
					return 1;
				} else {
					return 0;
				}
			}
		}

	});

	// Required, return the module for AMD compliance
	return Map;


});



