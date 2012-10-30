define([
	"app",
	// Libs
	"backbone"
],

function(App, Backbone)
{

	// Create a new module
	var Playlist = App.module();

	Playlist.Views = Playlist.Views || {};

	Playlist.Views.PlaylistView = Backbone.LayoutView.extend({
		initialize: function() {
			_.bindAll(this, 'render', 'togglePlaylist', 'goToTime');

			console.log(App.players,'tester');
			App.players.on('remix_toggle', this.onChangePlayer, this);
			App.players.on('update_title', this.updateItemTitle, this);
		},
		template : 'playlist',

		serialize : function()
		{
			console.log('serialize this', this.model);
			return this.model.toJSON();
		},
		
		events : {
			'click .toggle-playlist' : 'togglePlaylist',
			'click .progress-bar' : 'goToTime',
			'click .remix-toggle' : 'remixToggle',
			'click .back' : 'playerPrev',
			'click .forward' : 'playerNext',
			'click .play-pause' : 'playPause'
		},
		togglePlaylist: function(e) {
			$(e.target).toggleClass('open');

			$('.playlist-container').stop().slideToggle();
		},
		goToTime: function(e) {
			// for now this just updates the progress bar
			var progressBar = $(e.currentTarget);
			var percentClicked = ( (e.pageX - progressBar.offset().left) / progressBar.width() ) * 100;
			this.$('.elapsed').css('width',percentClicked + '%');
		},
		remixToggle : function()
		{
			console.log('toggle remix', App);
			if( App.players.get('story') && App.players.get('remix') )
			{
				App.players.get('current').pause();
				$('.player-slider').toggleClass('view-remix');
				if( $('.player-slider').hasClass('view-remix') ) App.players.set('current', App.players.get('remix'));
				else App.players.set('current', App.players.get('story'));
				App.players.trigger('remix_toggle');
				App.players.get('current').play();
			}
			return false;
		},
		playerPrev : function()
		{
			App.players.get('current').cuePrev();
		},
		playerNext : function()
		{
			App.players.get('current').cueNext();
		},
		playPause : function()
		{
			App.players.get('current').playPause();
		},

		onChangePlayer : function()
		{
			this.render();
			console.log('########  on change player',App.players.get('current') );
			//App.players.get('current').on('all', function(e){if(e!='media_timeupdate') console.log('$$$$$$$$$ ',e)});
			App.players.get('current').on('frame_rendered', this.updateItemTitle, this);
			//this.updateItemTitle( this.players.get('current').currentFrame.toJSON() )
			//if(this.players.get('current').currentFrame) this.initProjectPlaylistTitle( this.players.get('current').currentFrame );
		},

		updateItemTitle : function( info )
		{
			console.log('****** update item title', info);
			this.$('.playing-subtitle').text( info.layers[0].attr.title + ' by ' + info.layers[0].attr.media_creator_username );
		},
		initProjectPlaylistTitle : function( model )
		{
			this.$('.playing-subtitle').text( model.layers.at(0).get('attr').title + ' by ' + model.layers.at(0).get('attr').media_creator_username );
		}

	});

	// Required, return the module for AMD compliance
	return Playlist;
});
