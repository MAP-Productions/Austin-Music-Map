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

		hasPlayed : false,
		delay : 2000,

		initialize : function()
		{

			console.log('!!!!!!!!!	init player loader', this);
		},

		listenToPlayer : function( player )
		{
			this.player = player;
			this.updateLoaderTitle( player );
			this.$('.layer-loading').empty();
			// player.on('all', function(e, obj){ if(e!='media_timeupdate') console.log('e: loader: ',e,obj);});

			player.on('layer_loading', this.addLoadingItem, this);
			player.on('layer_ready', this.onLayerLoaded, this);
			player.on('visual_ready', this.onPlayerReady, this);
		},

		updateLoaderTitle : function( player )
		{
			var _this = this;
			this.model.on('change:playlist_title', function(){
					if(_this.model.get('playlist_title')=='Recently Added'){
						$('.col-right.standard').hide();
						$('.col-right.recent').show();
					}
					else{
						$('.loader-title').html(_this.model.get('playlist_title'));
						$('.col-right.recent').hide();
						$('.col-right.standard').show();
					}
			});
			if( this.model.get('playlist_title') )this.model.trigger('change:playlist_title');

		},

		addLoadingItem : function( layerdata )
		{
			if(layerdata.type != 'SlideShow') this.$('.layer-loading').append('<li class="unloaded" data-id="'+ layerdata.id +'"><div class="col-left"><i class="zicon-'+ layerdata.attr.media_type.toLowerCase() +' loader-media-icon"></i></div>'+ layerdata.attr.title + ' by '+ htmlDecode(layerdata.attr.media_creator_username) +'</li>');
			console.log('------player', this.player.getProjectData() );

		},

		onLayerLoaded : function( layerdata )
		{
			this.$(".layer-loading").find("[data-id='" + layerdata.id + "']").removeClass('unloaded');
		},

		onPlayerReady : function()
		{
			if(!this.hasPlayed)
			{
				var _this = this;
				_.delay(function(){
					_this.model.ready = true;
					_this.exit();
					_this.player.play();
					_this.model.renderPlaylist();
					App.players.trigger('play');
				}, this.delay );

				
				this.hasPlayed = true;
			}
		},

		exit : function()
		{
			var _this = this;
			this.remove();

			/*
			if (jQuery.browser.msie) {
				this.remove();
			} else {
				_this.$el.fadeOut(500, function(){
					_this.remove();
				});	
			}
			*/
		}
	});

	function htmlDecode(input){
		return $("<div/>").html(input).text();
	}

	return Loader;
});
