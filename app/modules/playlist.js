define([
	"app",
	// Libs
	"backbone"
],

function(app, Backbone)
{

	// Create a new module
	var App = app.module();

	App.Views = App.Views || {};

	App.Views.PlaylistView = Backbone.LayoutView.extend({
		initialize: function() {
			_.bindAll(this, 'render', 'togglePlaylist', 'goToTime');
		},
		template : 'playlist',
		events : {
			'click .toggle-playlist' : 'togglePlaylist',
			'click .progress-bar' : 'goToTime'
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
		}
	});

	// Required, return the module for AMD compliance
	return App;
});
