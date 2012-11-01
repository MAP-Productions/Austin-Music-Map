define([
	"app",
	// Libs
	"backbone",
	//submodules
	"modules/submodules/player-loader"

],

function(App, Backbone, Loader)
{
	// Create a new module
	var ProjectPlayer = App.module();

	ProjectPlayer.Model = Backbone.Model.extend({

		loaded : false,

		players : {},

		defaults : {
			collection_id: null,
			item_id: null
		},

		url : function()
		{
			return "http://alpha.zeega.org/api/items/"+ this.get('collection_id') +"/items";
		},

		initialize : function()
		{
			var _this = this;

			// render loader view
			this.loaderView = new Loader.View({model:this});
			$('body').append(this.loaderView.el);
			this.loaderView.render();

			this.initEvents();
			this.collectionModel = new FeaturedCollectionModel(this.toJSON());
			this.collectionModel.fetch().success(function(){
				_this.updatePlaylistTitle(_this.collectionModel);
			});
			this.superFetch();
		},

		initEvents : function()
		{
			var _this = this;
			$(window).bind('keyup.playerSlider', function(e){
				if(e.which == 27) App.router.navigate('/',{trigger:true});
			});
		},

		endEvents : function()
		{
			$(window).unbind('keyup.playerSlider');
		},

		superFetch : function()
		{
			var _this = this;
			var key = this.url();
			this.on('change:remixItems', this.onProjectLoaded, this);
			if( sessionStorage.getItem( this.url() ))
			{
				this.set( JSON.parse(sessionStorage[key] ) );
				parseResponse(this);
				//this.renderPlaylist();
			}
			else
			{
				this.fetch().success(function(res){
					sessionStorage[ key ] = JSON.stringify(res);
					parseResponse(_this);
					//_this.renderPlaylist();
				});
			}
		},

		renderPlaylist : function()
		{
			if(this.ready) App.BaseLayout.showPlaylistMenu( this );
			this.ready = true;
		},

		updatePlaylistTitle : function()
		{
			this.set('playlist_title', this.collectionModel.get('title'));
			if(this.ready) App.BaseLayout.showPlaylistMenu( this );
			this.ready = true;
		},

		onProjectLoaded : function()
		{
			var _this = this;
			this.off('change:remixItems');

			// updateLoader
			App.players.on('change:current', function(){
				_this.loaderView.listenToPlayer( App.players.get('current') );
			});
			
			// render player layout
			this.layout = new ProjectPlayerLayout({model:this});
			$('body').append( this.layout.el );
			this.layout.render();
		},

		exit : function()
		{
			this.endEvents();
			App.players.get('current').pause();
			if(App.players.get('story')) App.players.get('story').destroy();
			if(App.players.get('remix')) App.players.get('remix').destroy();
			this.layout.remove();
		}
	});

	// I need this model for the title only really
	var FeaturedCollectionModel = Backbone.Model.extend({
		url : function()
		{
			return "http://alpha.zeega.org/api/items/"+ this.get('collection_id');
		},
		parse : function(res)
		{
			return res.items[0];
		}
	});

	var ProjectPlayerLayout = Backbone.Layout.extend({

		template : 'player-slider',
		className : 'player-slider-wrapper',

		initialize: function()
		{
			// init project and/or remix players and register them in App
			// default to project
			this.model.projectPlayers = {};

			if( this.model.get('storyItems').items[0].child_items.length )
			{
				var projectID = _.uniqueId('player-project-');
				var projectView = new PlayerTargetView({
					args: {
						autoplay: false,
						collection_mode: 'slideshow',
						data: this.model.get('storyItems'),
						//url: 'http://alpha.zeega.org/api/items/49217',
						div_id: projectID,
						keyboard: false
					},
					attributes:{
						'class': 'player-window player-project',
						id: projectID
					}
				});
				this.insertView('.player-slider', projectView );

				App.players.set('story', projectView.project );
				//this.model.players.story = projectView.project;
			}
			if( this.model.get('remixItems').items[0].child_items.length )
			{
				var remixID = 'player-remix';
				var remixView = new PlayerTargetView({
					args: {
						autoplay: false,
						collection_mode: 'slideshow', // standard, slideshow,
						data: this.model.get('remixItems'),
						div_id: remixID,
						keyboard: false
					},
					attributes:{
						'class': 'player-window player-remix',
						id: remixID
					}
				});
				this.insertView( '.player-slider', remixView );
				App.players.set('remix', remixView.project );
				//this.model.players.remix = remixView.project;
			}

			App.players.set('current', App.players.get('story') || App.players.get('remix') );

			var _this = this;

			App.players.get('current').on('frame_rendered', function(){
				App.players.trigger('update_title', App.players.get('current').getFrameData() );
			});
			
		},

		afterRender: function()
		{
			this.getViews(function(view){
				view.initPlayer();
			});
		},

		serialize : function(){ return this.model.toJSON(); }

	});

	var PlayerTargetView = Backbone.LayoutView.extend({
		template : 'single-player',

		initialize : function()
		{
			this.project = new Zeega.player({window_fit:true});
		},

		initPlayer : function()
		{
			var _this = this;
			//this.project.on('all', function(e, obj){ if(e!='media_timeupdate') console.log('e:', _this.cid,e,obj);});
			//this.project.on('data_loaded', function(){ _this.project.play(); });
			this.project.load(this.options.args);
		}
	});

	var parseResponse = function(model)
	{
		var storyItems = [];
		var remixItems = [];
		_.each( model.get('items'), function(item){
			if( _.contains(item.tags, 'story') ) storyItems.push(item);
			else remixItems.push(item);
		});
		model.set({
			// I have to wrap this stuff for now until the api is updated
			storyItems: {items:[{child_items:storyItems}]},
			remixItems: {items:[{child_items:remixItems}]}
		});
	};

	return ProjectPlayer;
});
