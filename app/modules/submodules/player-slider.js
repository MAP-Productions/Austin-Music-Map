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

			if( this.model.get('storyItems').items[0].child_items.length )
			{
				console.log('-- story items',this.model.get('storyItems'));
				var projectID = _.uniqueId('player-project-');
				var projectView = new PlayerTargetView({
					args: {
						autoplay: true,
						collection_mode: 'slideshow',
						//data: this.model.get('storyItems'),
						url: 'http://alpha.zeega.org/api/items/49217',
						div_id: projectID,
						keyboard: false
					},
					attributes:{
						'class': 'player-window player-project',
						id: projectID
					}
				});
				this.insertView('.player-slider', projectView );

				this.model.players.story = projectView.project;
			}
			if( this.model.get('remixItems').items[0].child_items.length )
			{
				// console.log('-- remix items',this.model.get('remixItems'));

				// var remixID = 'player-remix';
				// var remixView = new PlayerTargetView({
				// 	args: {
				// 		autoplay: true,
				// 		collection_mode: 'slideshow', // standard, slideshow,
				// 		data: this.model.get('remixItems'),
				// 		div_id: remixID,
				// 		keyboard: false
				// 	},
				// 	attributes:{
				// 		'class': 'player-window player-remix',
				// 		id: remixID
				// 	}
				// });
				// this.insertView( '.player-slider', remixView );

				// this.model.players.remix = remixView.project;
			}

			this.model.currentPlayer = this.model.players.story ? this.model.players.story : this.model.players.remix;
			
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
			this.project.on('all', function(e, obj){ if(e!='media_timeupdate') console.log('e:', _this.cid,e,obj);});
			this.project.on('data_loaded', function(){ _this.project.play(); });
			console.log('--------visible:', $('#player-project').is(':visible'));
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
			// I have to wrap this stuff for now until the api is updated
			storyItems: {items:[{child_items:storyItems}]},
			remixItems: {items:[{child_items:remixItems}]}
		});
	};

	return ProjectPlayer;
});
