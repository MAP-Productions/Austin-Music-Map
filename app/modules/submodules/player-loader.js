define([
	"app",
	// Libs
	"backbone"
],

function(App, Backbone)
{
	// Create a new module
	var Loader = App.module();


	Loader.View = Backbone.LayoutView.extend({
		template : 'player-loader',
		className : 'player-loader',

		listening: false,
		hasPlayed : false,
		minDuration: 4000,
		delay : 2000,

		initialize : function() {
			_.bindAll(this, 'updateLoaderTitle');
			console.log('!!!!!!!!!	init player loader', this);
		},

		afterRender: function() {
			this.model.on('change:playlist_title', this.updateLoaderTitle);

			this.startTime = new Date();
		},

		listenToPlayer : function( player ) {
			if ( !this.listening ) {
				this.player = player.project;

				this.$('.layer-loading').empty();
				this.player.on('all', function(e, obj){ if(e!='media_timeupdate') console.log('		e: loader: ',e,obj);});

				this.player.on('layer_loading', this.addLoadingItem, this);
				this.player.on('layer_ready', this.onLayerLoaded, this);
				this.player.on('frame_ready', this.onPlayerReady, this);
				this.listening = true;
			}
		},

		updateLoaderTitle : function(){

			console.log('UPDATELOADERTITLE',this.model.get('playlist_title'));

			if ( this.model.get('playlist_title') == 'Recently Added' ) {
				//$('.col-right.standard').hide();
				$('.col-right.recent').fadeIn('fast');
			}
			else{
				$('.loader-title').html( this.model.get('playlist_title') );
				//$('.col-right.recent').hide();
				$('.col-right.standard').fadeIn('fast');
			}

		},

		addLoadingItem : function( layerdata ) {
			if(layerdata.type != 'SlideShow') this.$('.layer-loading').append('<li class="unloaded" data-id="'+ layerdata.id +'"><div class="col-left"><i class="zicon-'+ layerdata.attr.media_type.toLowerCase() +' loader-media-icon"></i></div>'+ layerdata.attr.title + ' by '+ htmlDecode(layerdata.attr.media_creator_username) +'</li>');
			console.log('------player', this.player.getProjectData() );
		},

		onLayerLoaded : function( layerdata ) {
			this.$(".layer-loading").find("[data-id='" + layerdata.id + "']").removeClass('unloaded');
		},

		onPlayerReady : function() {
			if ( !this.hasPlayed ) {

				var elapsed = new Date() - this.startTime,
					remaining = this.minDuration - elapsed < 0 ? this.delay : this.delay + this.minDuration - elapsed;

				var _this = this;
				_.delay(function(){
					_this.model.ready = true;
					_this.exit();
					_this.player.play();
					_this.model.renderPlaylist();
					App.players.trigger('play');
				}, remaining );

				
				this.hasPlayed = true;
			}
		},

		exit : function() {
			var _this = this;
			this.remove();
		}
	});

	function htmlDecode(input){
		return $("<div/>").html(input).text();
	}

	return Loader;
});
