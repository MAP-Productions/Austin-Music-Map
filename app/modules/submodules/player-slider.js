define([
	"app",
	// Libs
	"backbone",
	//submodules
	"modules/submodules/player-loader"
],

function(App, Backbone, Loader )
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
			var url;
			if(this.get('playlist_title')=="Recently Added") url = localStorage.api+"/search?exclude_content=Collection&sort=date-desc&content=all&page=1&r_itemswithcollections=1&user=1311&limit=50";
			else url = localStorage.api+"/items/"+ this.get('collection_id') +"/items?limit=200";
			console.log(url);
			return url;
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
			this.collectionModel.fetch().success(function(response){
				console.log(response.items[0].title);
				_this.updatePlaylistTitle(_this.collectionModel);
				_this.superFetch();
			});
			
		},

		initEvents : function()
		{
			var _this = this;
			
			$(window).bind('keyup.playerSlider', function(e){
				if(e.which == 27) App.router.navigate('/',{trigger:true});
			});
			var lazyResize = _.debounce(function(){ _this.resizeWindow(); }, 300);
			$(window).bind('resize.amm_players',lazyResize);

			$(window).resize(lazyResize);

			App.players.on('frame_updated', this.frameUpdated, this);

		},

		resizeWindow : function()
		{
			App.players.get('current').fitWindow();
		},

		endEvents : function()
		{
			$(window).unbind('keyup.playerSlider');
		},

		superFetch : function()
		{
			var _this = this;
			var key = this.url();
			this.on('change:remixItems', this.onProjectDataLoaded, this);
			if( sessionStorage.getItem( this.url() ))
			{
				this.set( JSON.parse(sessionStorage[key] ) );
				parseResponse(this);
			}
			else
			{
				this.fetch().success(function(res){
					sessionStorage[ key ] = JSON.stringify(res);
					parseResponse(_this);
				});
			}
		},

		renderPlaylist : function()
		{
			if(this.ready)
			{
				App.BaseLayout.showPlaylistMenu( this );
			}
		},

		updatePlaylistTitle : function()
		{
			this.set('playlist_title', this.collectionModel.get('title'));
		},

		onProjectDataLoaded : function()
		{
			var _this = this;
			this.off('change:remixItems');

			App.players.clear({silent:true});

			// updateLoader
			App.players.on('current_ready', function(){
				_this.loaderView.listenToPlayer( App.players.get('current') );
			});
			
			// render player layout
			this.layout = new ProjectPlayerLayout({model:this});
			$('body').append( this.layout.el );
			this.layout.render();
		},

		exit : function()
		{

			if(this.loaderView) this.loaderView.exit();

			$(window).unbind('resize.amm_players');

			this.endEvents();
			App.players.get('current').pause();
			if(App.players.get('story')) App.players.get('story').destroy();
			if(App.players.get('remix')) App.players.get('remix').destroy();
			this.layout.remove();
		},

		frameUpdated : function(info)
		{
			
		}
		
	});

	// I need this model for the title only really
	var FeaturedCollectionModel = Backbone.Model.extend({
		url : function()
		{
			return localStorage.api+"/items/"+ this.get('collection_id');
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
				var args = {
					autoplay: false,
					collection_mode: 'slideshow',
					data: this.model.get('storyItems'),
					id: this.model.get('collection_id'),
					//url: 'http://alpha.zeega.org/api/items/49217',
					div_id: projectID,
					keyboard: false
				};
				if(this.model.get('start_frame')) args.start_frame = parseInt(this.model.get('start_frame'),10);

				var projectView = new PlayerTargetView({
					args: args,
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
				var remixArgs = {
					autoplay: false,
					collection_mode: 'slideshow', // standard, slideshow,
					data: this.model.get('remixItems'),
					div_id: remixID,
					keyboard: false
				};
				if(this.model.get('start_frame')) remixArgs.start_frame = parseInt(this.model.get('start_frame'),10);

				var remixView = new PlayerTargetView({
					args: remixArgs,
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
			App.players.trigger('current_ready');

			var _this = this;

			App.players.get('current').on('frame_rendered', function(frameData){
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
			this.project.on('frame_rendered window_resized', this.updateYoutubeSize, this);
		},

		updateYoutubeSize : function()
		{
			var width = window.innerHeight*16/9;
			var left = (window.innerWidth-width)/2;
			console.log('@@@ update youtube size', width, left);
			this.$('.visual-element-youtube').css({
				'height': window.innerHeight,
				'width' : width,
				'left' : left
			});
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
