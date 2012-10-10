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
			_.bindAll(this, 'render', 'togglePlaylist');
		},
		template : 'playlist',
		events : {
			'click .toggle-playlist' : 'togglePlaylist'
		},
		togglePlaylist: function(e) {
			$(e.target).toggleClass('open');

			$('.playlist-container').stop().slideToggle();
		}
	});

	// Required, return the module for AMD compliance
	return App;
});
