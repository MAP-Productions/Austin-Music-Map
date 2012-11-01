define([
	"app",
	// Libs
	"backbone",
	// submodules
	"modules/submodules/modals"

], function(App, Backbone, Modal) {
	
	var SCPost = App.module();

	SCPost.Model = Modal.Model.extend({
		defaults: {
			title: 'Contact',
			modalTemplate: 'modal'
		},

		initialize: function(options) {
			_.extend(this,options);
			this.layout = this.getLayout();
			this.layout.setView('.modal-content', new SCPostView(options) );
			this.layout.render();
			$('body').append( this.layout.el );

		}
	});

	var SCPostView = Backbone.LayoutView.extend({
		template: 'scpost',
		latLng: new L.LatLng(30.266702991845,-97.745532989502),
		
		events:{
			'click .btn-submit':'postAudio'
		},
		afterRender:function(){
			
			var _this=this;
			_.delay(function(){
				$('.close-modal').hide();
				var cloudmade = new L.TileLayer('http://{s}.tiles.mapbox.com/v3/zeega.map-17habzl6/{z}/{x}/{y}.png', {maxZoom: 18, attribution: ''}),
				div =document.getElementById('scpost-map');
				_this.map = new L.Map(div,{
					touchZoom:false,
					scrollWheelZoom:false,
					doubleClickZoom:false,
					boxZoom:false
				});
				_this.map.setView(_this.latLng, 11).addLayer(cloudmade);
				_this.map.featureOn=false;

				_this.marker=L.marker(_this.latLng,{draggable:true}).addTo(_this.map);
				_this.map.on('dragend', function(e) {
					_this.marker.setLatLng(_this.map.getCenter());
				});
				_this.map.on('zoomend', function(e) {
					_this.marker.setLatLng(_this.map.getCenter());
				});
			},100);

		},

		postAudio:function(){
			
			var audio = new SCAudio();
			console.log('posting audio',this,audio);
			audio.save({
				media_geo_lat:this.marker.getLatLng().lat,
				media_geo_lng:this.marker.getLatLng().lng,
				tags:this.$el.find('#tags').val().split(","),
				title:this.$el.find('#title').val()
				//author attr etc

			});
			return false;
		}
	});

	var SCAudio = Backbone.Model.extend({
		type:'Audio',
		url:'scpost.php',
		defaults : {
			media_type:'Audio',
			layer_type:'Audio',
			attribution_uri: 'default',
			child_items_count:0,
			archive:'Soundcloud',
			//user_id:760,
			uri:"default"
		},
		intialize:function(){}

	});

	// Required, return the module for AMD compliance
	return SCPost;

});