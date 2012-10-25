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
		},
		template : 'playlist',
		
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
			if( App.Player.players.story && App.Player.players.remix )
			{
				$('.player-slider').toggleClass('view-remix');
				if( $('.player-slider').hasClass('view-remix') ) App.Player.currentPlayer = App.Player.players.remix;
				else App.Player.currentPlayer = App.Player.players.story;
			}
			return false;
		},
		playerPrev : function()
		{
			App.Player.currentPlayer.cuePrev();
		},
		playerNext : function()
		{
			App.Player.currentPlayer.cueNext();
		},
		playPause : function()
		{
			App.Player.currentPlayer.playPause();
		}
	});

	// Required, return the module for AMD compliance
	return Playlist;
});
