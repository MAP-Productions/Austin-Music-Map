define([
	"app",
	// Libs
	"backbone"
],

function(App, Backbone)
{
	// Create a new module
	var ProjectPlayer = App.module();

	ProjectPlayer.Model = Backbone.Model.extend({

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
			this.superFetch();
		},

		superFetch : function()
		{
			var key = this.url();
			this.on('change:remixItems', this.renderSlider, this);
			if( sessionStorage.getItem( this.url() ))
			{
				this.set( JSON.parse(sessionStorage[key] ) );
				parseResponse(this);
			}
			else
			{
				this.fetch().success(function(res){
					sessionStorage[ key ] = JSON.stringify(res);
					console.log('fetched and stored:',sessionStorage[key], res, JSON.parse(sessionStorage[key] ) );
					parseResponse(_this);
				});
			}
		},

		renderSlider : function()
		{
			this.off('change:remixItems');
			this.layout = new ProjectPlayerLayout({model:this});
			$('body').append( this.layout.el );
			this.layout.render();
		},

		remove : function()
		{
			this.layout.remove();
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
			console.log('slider init', this);

			if( this.model.get('remixItems').length )
			{

			}
			if( this.model.get('storyItems').length )
			{

			}
/*
			if(this.model.get('project_url'))
			{
				var projectID = 'player-project-'+ this.model.get('parent').id;
				var projectView = new PlayerTargetView({
					args: {
						div_id: projectID,
						url: this.model.get('project_url'),
						keyboard: false
						//autoplay: false
					},
					attributes:{
						'class': 'player-window player-project',
						id: projectID
					}
				});
				this.insertView('.player-slider', projectView );

				this.projectPlayer = App.currentPlayer = projectView.project;
				App.projectPlayers.project = this.projectPlayer;
			}

			if(this.model.get('remix_url'))
			{
				var remixID = 'player-remix-'+ this.model.get('parent').id;
				var remixView = new PlayerTargetView({
					args: {
						div_id: remixID,
						url: this.model.get('remix_url'),
						collection_mode: 'slideshow', // standard, slideshow,
						keyboard: false
						//autoplay: false

					},
					attributes:{
						'class': 'player-window player-remix',
						id: remixID
					}
				});
				this.insertView( '.player-slider', remixView );

				this.remixPlayer = remixView.project;
				if( !this.model.get('project_url') ) App.currentPlayer = this.remixPlayer;
				App.projectPlayers.remix = this.remixPlayer;
			}
	*/		
			
			
		},

		afterRender: function()
		{
			// this.getViews(function(view){
			// 	view.initPlayer();
			// });
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
			console.log('initplayer', this, Zeega);
			var _this = this;
			this.project.on('all', function(e, obj){ if(e!='media_timeupdate') console.log('e:', _this.project.id,e,obj);});
			this.project.on('data_loaded', function(){ _this.project.play(); });
			this.project.load(this.options.args);
			console.log('project', this.project);
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
			storyItems: storyItems,
			remixItems: remixItems
		});
	};

	return ProjectPlayer;
});
