define([
	// Application.
	"app",
	"backbone",
	"modules/playlist",
	"modules/submodules/search-menu",
	"modules/submodules/all-playlists",

	//plugins
	"plugins/jquery-ui"

],

function(App, Backbone, Playlist, Search, AllPlaylists )
{

	var BaseLayout = Backbone.Layout.extend({

		manage: true,
		el: "#main",

		initialize : function()
		{
			this.insertView( new baseView() );
		},

		afterRender : function()
		{
			App.trigger('base_layout_ready');
		},

		hideLeftMenu : function(opts)
		{
			if( this.$('#controlsLeft .controls-inner').is(':visible') )
			{

				if($.browser.msie)
				{
					this.$('#controlsLeft').hide();
					this.drawLeftMenu(opts.next);
				}
				else
				{
					var _this = this;
					this.$('#controlsLeft').hide('slide',{direction:'left'}, function(){
						_this.drawLeftMenu(opts.next);
					});
				}
			}
			else if(opts.next)
			{
				this.drawLeftMenu(opts.next);
			}
		},

		drawLeftMenu : function( next )
		{
			switch(next)
			{
				case 'map':
					//this.showSearchMenu();
					this.showAllPlaylists();
					break;
				case 'playlist':
					//this.showPlaylistMenu();
					break;
			}
		},

		showSearchMenu : function()
		{
			var searchView = new Search.View();
			this.setView('#controlsLeft .controls-inner', searchView );
            if($.browser.msie) this.$('#controlsLeft').hide();
            else this.$('#controlsLeft').hide('slide',{direction:'right'});
			searchView.render();
			this.expandLeftMenu();
		},

		showAllPlaylists: function()
		{
			var allPlaylistsView = new AllPlaylists.View();
			this.setView('#controlsLeft .controls-inner', allPlaylistsView );
			if($.browser.msie) this.$('#controlsLeft').hide();
			else this.$('#controlsLeft').hide('slide',{direction:'right'});
			allPlaylistsView.render();
			this.expandLeftMenu();
		},

		showPlaylistMenu : function( model )
		{
			this.playlistView = new Playlist.Views.PlaylistView({model:model});
			this.setView('#controlsLeft .controls-inner', this.playlistView );
			if($.browser.msie) this.$('#controlsLeft').hide();
			else this.$('#controlsLeft').hide('slide',{direction:'right'},1000);
			this.playlistView.render();
			this.expandLeftMenu();
		},

		expandLeftMenu : function()
		{
			if($.browser.msie) this.$('#controlsLeft').show('slide');
			else this.$('#controlsLeft').show('slide');
		}

	});

	var baseView = Backbone.LayoutView.extend({ template: "base" });

	return BaseLayout;
});
