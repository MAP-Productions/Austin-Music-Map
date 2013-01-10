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

		url : function() {
			var url;
			if(this.get('playlist_title')=="Recently Added") url = localStorage.api+"/items/search?exclude_content=Collection&sort=date-desc&content=all&page=1&r_itemswithcollections=1&user=1311&limit=50";
			else url = localStorage.api+"/items/"+ this.get('collection_id') +"/items?limit=200";
			return url;
		},

		initialize : function() {
			var _this = this;

			// render loader view
			this.loaderView = new Loader.View({ model: this });
			$('body').append( this.loaderView.el );
			this.loaderView.render();

			this.initEvents();
			this.collectionModel = new FeaturedCollectionModel(this.toJSON());

			this.collectionModel.fetch().success(function( response ) {
				_this.updatePlaylistTitle(_this.collectionModel);
				_this.superFetch();
			});
			
		},

		initEvents : function() {
			var _this = this;
			
			$(window).bind('keyup.playerSlider', function(e){
				if(e.which == 27) App.router.navigate('/',{trigger:true});
			});
			var lazyResize = _.debounce(function(){ _this.resizeWindow(); }, 300);
			$(window).bind('resize.amm_players',lazyResize);

			$(window).resize(lazyResize);

			App.players.on('frame_updated', this.frameUpdated, this);

		},

		resizeWindow: function() {
			App.players.get('current').project.fitWindow();
		},

		endEvents: function() {
			$(window).unbind('keyup.playerSlider');
		},

		superFetch : function() {
			var _this = this,
				key = this.url();
console.log('	super fetch', this, key );
			this.on('change:remixItems', this.onProjectDataLoaded, this);
			if( sessionStorage.getItem( this.url() )) {
				this.set( JSON.parse(sessionStorage[key] ) );
					console.log('	cached response:', JSON.parse(sessionStorage[key])) ;
				parseResponse( this );
			} else {
				this.fetch().success(function(res){
					console.log('	response:', res);
					sessionStorage[ key ] = JSON.stringify(res);
					parseResponse( _this );
				});
			}
		},

		renderPlaylist : function() {
			if(this.ready)
			{
				App.BaseLayout.showPlaylistMenu( this );
			}
		},

		updatePlaylistTitle : function() {
			this.set('playlist_title', this.collectionModel.get('title'));
		},

		onProjectDataLoaded : function() {
			var _this = this;
			this.off('change:remixItems');

console.log('	on project data loaded', App,App.players )

			App.players.clear({ silent: true });

			// updateLoader
			App.players.on('current_ready', function(){
				console.log('	on current ready', App.players.get('current') );
				_this.loaderView.listenToPlayer( App.players.get('current') );
			});
			
			// render player layout
			this.layout = new ProjectPlayerLayout({ model: this });
			$('body').append( this.layout.el );
			this.layout.render();
			this.layout.generateZeegas();
		},

		exit : function() {

			if(this.loaderView) this.loaderView.exit();

			$(window).unbind('resize.amm_players');

			this.endEvents();
			App.players.get('current').project.pause();
			if(App.players.get('story')) App.players.get('story').project.destroy();
			if(App.players.get('remix')) App.players.get('remix').project.destroy();
			this.layout.remove();
		},

		frameUpdated : function(info) {
			var height = $('.visual-element-slideshow').closest(".ZEEGA-player").height();
			console.log('		--frame updated', height)
			$('.visual-element-slideshow').css({
				height:  height + "px"
			});
		}
		
	});

	// I need this model for the title only really
	var FeaturedCollectionModel = Backbone.Model.extend({
		url : function() {
			return localStorage.api+"/items/"+ this.get('collection_id');
		},
		parse : function(res) {
			return res.items[0];
		}
	});

	var ProjectPlayerLayout = Backbone.Layout.extend({

		template : 'player-slider',
		className : 'player-slider-wrapper',

		generateZeegas: function() {
			// init project and/or remix players and register them in App
			// default to project
			this.model.projectPlayers = {};

			if( this.model.get('storyItems').items.length ) {
				var projectID = _.uniqueId('player-project-'),
					args = {
						autoplay: false,
						data: this.model.get('storyItems'),
						id: this.model.get('collection_id'),
						preloadRadius: 4,
						startFrame: 1,

						//url: 'http://alpha.zeega.org/api/items/49217',
						target: "#" + projectID,
						keyboard: false
					};
				if(this.model.get('start_frame')) {
					args.start_frame = parseInt(this.model.get('start_frame'),10);
				}

				var projectView = new PlayerTargetView({
					args: args,
					attributes:{
						'class': 'player-window player-project',
						id: projectID
					}
				});

				console.log('PROJECT VIEW', projectView );

				this.insertView('.player-slider', projectView );

				App.players.set('story', projectView );
				//this.model.players.story = projectView.project;
			}
			if( this.model.get('remixItems').items.length ) {
				var remixID = 'player-remix';
				var remixArgs = {
					autoplay: false,
					data: this.model.get('remixItems'),
					target: "#" + remixID,
					keyboard: false,
					startFrame: 1,
					preloadRadius: 4,

					layerOptions: {
						slideshow: {
							display: true,
							start: null,
							start_id: this.model.get('start_slide_id'),
							bleed: false
						}
					}
				};
				if(this.model.get('start_frame')) {
					remixArgs.start_frame = parseInt(this.model.get('start_frame'),10);
				}
				// check to see if frame exists
				var audioItemIDArray = _.map( remixArgs.data.items[0].child_items, function(item){
					if(item.media_type == 'Audio') {
						return item.id;
					}
				});
				// redirects player if the id passed into remix is not a frame
				if( !_.contains(audioItemIDArray, remixArgs.start_frame) ) {
					// if id is not contained in frame array, then it must be an image slide
					remixArgs.start_slide_id = remixArgs.start_frame;
					// set start_frame
					remixArgs.start_frame = _.compact(audioItemIDArray)[0];
				}

				var remixView = new PlayerTargetView({
					args: remixArgs,
					attributes:{
						'class': 'player-window player-remix',
						id: remixID
					}
				});
				this.insertView( '.player-slider', remixView );
				App.players.set('remix', remixView );
				//this.model.players.remix = remixView.project;
			}

			App.players.set('current', App.router.playerType == 'story' && App.players.get('story') ? App.players.get('story') : App.players.get('remix') );
console.log('	current ready', App.players.get('current'), App.players.get('remix'), App.players.get('story'));

			var _this = this;

			App.players.get('current').on('frame_rendered', function(frameData){
				App.players.trigger('update_title', App.players.get('current').getFrameData() );
			});

		},

		afterRender: function() {
			this.getViews(function(view){
				view.initPlayer();
				App.players.trigger('current_ready');
			});
			if( App.router.playerType == 'remix' && App.players.get('story') ) {
				$('.player-slider').addClass('view-remix');
			}
		},

		serialize : function() {
			return this.model.toJSON();
		}

	});

	var PlayerTargetView = Backbone.LayoutView.extend({
		template : 'single-player',

		initPlayer : function() {
			var _this = this;
			//this.project.on('data_loaded', function(){ _this.project.play(); });

			//this.project.load(this.options.args);
			this.project = new Zeega.player( _.extend({ window_fit: true }, this.options.args ) );

			// this.project.on('all', function(e, obj){
			// 	if(e!='media_timeupdate') console.log('e:', this.cid,e,obj);
			// }.bind( this ));

			this.project.on('frame_rendered window_resized', this.updateYoutubeSize, this);
			this.project.on('slideshow_update', this.updateSlideshowURL, this);
			
		},

		afterRender: function() {
			// this.project = new Zeega.player( _.extend({ window_fit: true }, this.options.args ) );

			// this.project.on('all', function(e, obj){
			// 	if(e!='media_timeupdate') console.log('e:', this.cid,e,obj);
			// }.bind( this ));

			// this.project.on('frame_rendered window_resized', this.updateYoutubeSize, this);
			// this.project.on('slideshow_update', this.updateSlideshowURL, this);
		},


		updateYoutubeSize : function() {
			var width = window.innerHeight*16/9;
			var left = (window.innerWidth-width)/2;
			this.$('.visual-element-youtube').css({
				'height': window.innerHeight,
				'width' : width,
				'left' : left
			});
		},

		updateSlideshowURL : function(slideInfo) {
			if( slideInfo.frame == this.project.currentFrame.id && slideInfo.data) {
				App.router.slide_id = slideInfo.data.id;
				App.router.navigate('playlist/'+ App.router.collection_id +'/remix/'+ slideInfo.frame +'/slide/'+ slideInfo.data.id);
			}
		}
	});

	var parseResponse  = function( model ) {
		var storyItems = [];
		var remixItems = [];
		_.each( model.get('items'), function(item){
			if( _.contains(item.tags, 'story') ) storyItems.push(item);
			else remixItems. push( item);
		});

		var wrappedItems = {
			storyItems: { items: storyItems },
			remixItems: { items: remixItems }
		};
		console.log("	parse res", wrappedItems, storyItems,remixItems);


		model.set( wrappedItems );
	};

	return ProjectPlayer;
});
