define([
	"app",
	// Libs
	"backbone",
	

	// plugins
	"libs/leaflet"

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
			this.map.setView(this.latLng, 11).addLayer(cloudmade).addLayer(homemade);
			this.map.featureOn=false;
		},
		updateMap:function(){
			var layer =App.players.get('current').getFrameData().layers[0];
			if(!_.isUndefined(layer)&&!_.isUndefined(layer.attr)&&layer.attr.media_geo_latitude>0){
				var latlng = new L.LatLng(layer.attr.media_geo_latitude,layer.attr.media_geo_longitude);

				this.marker = L.circleMarker(latlng, {
						radius: 8,
						fillColor: "blue",
						color: "#000",
						weight: 1,
						opacity: 1,
						fillOpacity: 0.8
					}).addTo(this.map);
			}
		}

	});


	// Required, return the module for AMD compliance
	return PlaylistMap;

});