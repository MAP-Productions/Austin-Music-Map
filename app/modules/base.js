define([
	// Application.
	"app",
	"backbone",
	"modules/playlist",
	//plugins
	"plugins/jquery-ui"

],

function(App, Backbone, Playlist ) {

console.log('Bb', Backbone);



	var BaseLayout = Backbone.Layout.extend({

		manage: true,
		el: "#main",

		initialize : function()
		{
			this.insertView( new baseView() );
		},

		afterRender : function()
		{
			var playlistView = new Playlist.Views.PlaylistView();
			this.setView('#controlsLeft .controls-inner', playlistView );
			playlistView.render();
			App.trigger('base_layout_ready');	
		},

		hideLeftMenu : function()
		{
			if( this.$('#controlsLeft .controls-inner').is(':visible') )
			{
				console.log('hide left menu');
				this.$('#controlsLeft .controls-inner').hide('slide',{direction:'left'},500 );
			}
		}

	});

	var baseView = Backbone.LayoutView.extend({ template: "base" });

	return BaseLayout;
});
