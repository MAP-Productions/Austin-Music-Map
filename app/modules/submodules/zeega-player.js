define([
	"app",
	// Libs
	"backbone",

	"zeegaplayer"
],

function(App, Backbone)
{
	console.log('zp');

	// Create a new module
	var ProjectPlayer = App.module();
	console.log('zp',App, Backbone, ProjectPlayer);

	ProjectPlayer.Model = Backbone.Model.extend({

		defaults : {
			project_url: null,
			remix_url: null
		},

		initialize : function()
		{
			this.layout = new ProjectPlayerLayout({ model:this });
			$('body').append(this.layout.el);
			this.layout.render();
		},

		remove : function()
		{
			this.layout.remove();
		}
	});

	var ProjectPlayerLayout = Backbone.Layout.extend({

		template : 'player-slider',
		fetch: function(path) {
			// Initialize done for use in async-mode
			var done;

			// Concatenate the file extension.
			path = 'app/templates/layouts/'+ path + ".html";

			// If cached, use the compiled template.
			if (JST[path]) {
				return JST[path];
			} else {
				// Put fetch into `async-mode`.
				done = this.async();

				// Seek out the template asynchronously.
				return $.ajax({ url: App.root + path }).then(function(contents) {
					done(JST[path] = _.template(contents));
				});
			}
		},
		className : 'player-slider',

		initialize: function()
		{
			console.log('init', this);
/*
			if(this.model.get('project_url'))
			{
				var projectID = 'player-project-'+ this.model.get('parent').id;
				this.insertView( new PlayerTargetView({
					args: {
						div_id: projectID,
						project_url: this.model.get('project_url')
					},
					attributes:{
						class: 'player-window player-project',
						id: projectID
					}
				}));
			}
			if(this.model.get('remix_url'))
			{
				var remixID = 'player-remix-'+ this.model.get('parent').id;
				this.insertView( new PlayerTargetView({
					args: {
						div_id: remixID,
						collection_url: this.model.get('remix_url'),
						collection_mode: 'slideshow' // standard, slideshow
					},
					attributes:{
						class: 'player-window player-remix',
						id: remixID
					}
				}));
			}
			*/
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
		fetch: function(path) {
			// Initialize done for use in async-mode
			var done;

			// Concatenate the file extension.
			path = 'app/templates/'+ path + ".html";

			// If cached, use the compiled template.
			if (JST[path]) {
				return JST[path];
			} else {
				// Put fetch into `async-mode`.
				done = this.async();

				// Seek out the template asynchronously.
				return $.ajax({ url: App.root + path }).then(function(contents) {
					done(JST[path] = _.template(contents));
				});
			}
		},
		initialize : function()
		{
			console.log('target view', this, this.options);
		},

		initPlayer : function()
		{
			// console.log('initplayer', this, Zeega);

			// var project = new Zeega.player({window_fit:true});
			// project.on('all', function(e, obj){ if(e!='media_timeupdate') console.log('e:',e,obj);});
			// project.load(this.options.args);
			// console.log('project', project);
		}
	});

	// Required, return the module for AMD compliance
	return ProjectPlayer;
});
