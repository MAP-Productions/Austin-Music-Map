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
		fetch: function(path) {
			// Initialize done for use in async-mode
			var done;

			// Concatenate the file extension.
			path = 'app/templates/'+ path + ".html";

			// If cached, use the compiled template.
			if (JST[path]) {
				return JST[path];
			} else {
				// Put fetch into `async-mode`.
				done = this.async();

				// Seek out the template asynchronously.
				return $.ajax({ url: App.root + path }).then(function(contents) {
					done(JST[path] = _.template(contents));
				});
			}
		},
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
