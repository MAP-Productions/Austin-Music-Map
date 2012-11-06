define([
	// Application.
	"app",
	"backbone"
],

function(App, Backbone )
{

	var AllPlaylists = {};

	AllPlaylists.View = Backbone.LayoutView.extend({

		template : 'all-playlists',
		events : {
			'click .toggle-playlists' : 'togglePlaylists'
		},
		togglePlaylists : function() {
			this.$('.all-playlists-container').slideToggle();
		}

	});

	return AllPlaylists;
});
