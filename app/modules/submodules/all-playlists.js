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
			console.log('all playlists // sync', App.playlistCollection, App.playlistCollection.length, App.playlistCollection.toJSON() );
			this.render();
		},

		serialize : function()
		{
			console.log('serialize ', App.playlistCollection.toJSON());
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
