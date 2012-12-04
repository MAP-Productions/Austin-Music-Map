define([
	"app",
	// Libs
	"backbone"

], function(App, Backbone) {
	
	var PlaylistMap = App.module();

	PlaylistMap.Model = Backbone.Model.extend({
		type: 'PlaylistMap',
		defaults: {
			title: 'PlaylistMap'
		},

		initialize: function() {
			console.log('init playlist map');
			this.mapView = new PlaylistMap.Views.Main();
			$('#playlist-map-wrapper').empty().append( this.mapView.el );
			this.mapView.render();
		},
		updateMap:function(){
			this.mapView.updateMap();
		}
	});

	PlaylistMap.Views = PlaylistMap.Views || {};

	PlaylistMap.Views.Main  = Backbone.LayoutView.extend({
		id : 'playlist-map',
		template: 'playlist-map',
		latLng: new L.LatLng(30.266702991845,-97.745532989502),
		
		initialize : function(options){
			_.extend(this,options);
		},

		afterRender:function(){
			

			var cloudmade = new L.TileLayer('http://{s}.tiles.mapbox.com/v3/zeega.map-lo6au7ho/{z}/{x}/{y}.png', {maxZoom: 18, attribution: ''}),
				homemade = new L.TileLayer('assets/img/map.png#{z}/{x}/{y}', {maxZoom: 18, attribution: ''});
				
			this.map = new L.Map(this.el,{
				dragging:false,
				touchZoom:false,
				scrollWheelZoom:false,
				doubleClickZoom:false,
				boxZoom:false,
				zoomControl:false
			});
			this.map.setView(this.latLng, 10).addLayer(cloudmade).addLayer(homemade);
			this.map.featureOn=false;
		},
		updateMap:function(){
			var layer =App.players.get('current').getFrameData().layers[0];
			if(!_.isUndefined(this.marker))this.map.removeLayer(this.marker);
			if(!_.isUndefined(layer)&&!_.isUndefined(layer.attr)&&layer.attr.media_geo_latitude>0){

				var latlng = new L.LatLng(layer.attr.media_geo_latitude,layer.attr.media_geo_longitude);
				
				var ico;
					if(_.indexOf(layer.attr.tags,'feature')>-1){
						ico = L.divIcon({
							className : 'custom-icon',
							iconAnchor: new L.Point(10,10),
							html:'<i class="amm-dot-'+ Math.floor(Math.random()*57) +' dot-red"></i>'
						});
						
					}
					else {
						ico = L.divIcon({
							className : 'custom-icon',
							iconAnchor: new L.Point(10,10),
							html:'<i class="amm-dot-'+ Math.floor(Math.random()*57) +'"></i>'
						});
					}
				
				this.map.setView(latlng,16,true);
				this.marker = L.marker(latlng, {icon:ico}).addTo(this.map);
				
			}
			
		}

	});


	// Required, return the module for AMD compliance
	return PlaylistMap;

});