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

		initialize : function()
		{
			App.playlistCollection.on('reset', this.onSync, this);
		},

		onSync : function()
		{
			this.render();
		},

		serialize : function()
		{
			return {playlists:App.playlistCollection.toJSON()};
		},

		events : {
			'click .toggle-playlists' : 'togglePlaylists'
		},
		togglePlaylists : function()
		{
			this.$('.all-playlists-container').slideToggle();
		}

	});

	return AllPlaylists;
});
