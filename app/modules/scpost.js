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

		initialize: function() {
			
			this.layout = this.getLayout();
			this.layout.setView('.modal-content', new SCPostView() );
			this.layout.render();
			$('body').append( this.layout.el );

		}
	});

	var SCPostView = Backbone.LayoutView.extend({
		template: 'scpost',
		latLng: new L.LatLng(30.266702991845,-97.745532989502),
		submitted:false,
		events:{
			'click #modal-btn':'onSubmit'
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

		onSubmit:function(){
			if(this.submitted||_.isUndefined(App.track)){
				App.router.navigate('',true);
			}
			else{
				var audio = new SCAudio();
				console.log('posting audio',this,audio);
				var tag_array=[];
				if(this.$el.find('#tags').val().length>0) tag_array=this.$el.find('#tags').val().split(",");
				tag_array.push('austinmusicmap');
				tag_array.push('web_recording');
				audio.save({
					media_geo_latitude:this.marker.getLatLng().lat,
					media_geo_longitude:this.marker.getLatLng().lng,
					tags:tag_array,
					title:this.$el.find('#title').val(),
					uri:App.track.stream_url,
					attribution_uri: App.track.permalink_url,
					thumbnail_url:App.track.waveform_url,
					license:App.track.license,
					media_creator_username:App.track.user.username,
					media_creator_realname:App.track.user.username
				});
				
				$('.sc-details').remove();
				$('.sc-thanks').show();
				this.submitted=true;
			}
			
			return false;
		}
	});

	var SCAudio = Backbone.Model.extend({
		type:'Audio',
		url:'soundcloud.php',
		defaults : {
			media_type:'Audio',
			layer_type:'Audio',
			child_items_count:0,
			archive:'SoundCloud',
			enabled: 1,
			published:1,
			user_id:1311
			
		},
		intialize:function(){}

	});

	// Required, return the module for AMD compliance
	return SCPost;

});