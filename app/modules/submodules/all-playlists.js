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
		events: {
			'click .toggle-playlists' : 'togglePlaylists',
			'click .playlist .show-on-map' : 'showPlaylistOnMap'
		},

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
		togglePlaylists : function()
		{
			this.$('.all-playlists-container').slideToggle();
		},
		showPlaylistOnMap: function(e) {
			var id = $(e.currentTarget).parent().attr('href').split('/')[1];
			e.preventDefault();
			e.stopPropagation();
			App.page.mapView.loadPlaylist(id);
		}

	});

	return AllPlaylists;
});
