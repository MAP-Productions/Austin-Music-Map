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
			'click .forward' : 'playerNext'
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
			if(Object.keys(App.projectPlayers).length == 2)
			{
				$('.player-slider').toggleClass('view-remix');
				if( $('.player-slider').hasClass('view-remix') ) App.currentPlayer = App.projectPlayers.remix;
				else App.currentPlayer = App.projectPlayers.project;
			}
		},
		playerPrev : function()
		{
			App.currentPlayer.cuePrev();
		},
		playerNext : function()
		{
			App.currentPlayer.cueNext();
		}
	});

	// Required, return the module for AMD compliance
	return Playlist;
});
