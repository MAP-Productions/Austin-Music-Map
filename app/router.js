define([
	// Application.
	"app",

	// Modules.
	"modules/playlist",
	"modules/participate",
	"modules/about",
	"modules/contact",
	"modules/map"
],

function(App, Playlist, Participate, About, Contact,Map) {

	// Defining the application router, you can attach sub routers here.
	var Router = Backbone.Router.extend({
		routes: {
			"": "index",
			"participate": "participate",
			"about": "about",
			"contact": "contact",

			// these may need to go to a different fxn
			"playlist/:collectionID" : "goToStory",
			"playlist/:collectionID/" : "goToStory",
			// routes to stories
			"playlist/:collectionID/story" : "goToStory",
			"playlist/:collectionID/story/" : "goToStory",
			"playlist/:collectionID/story/:itemID" : "goToStory",
			// routes to remixes
			"playlist/:collectionID/remix" : "goToRemix",
			"playlist/:collectionID/remix/" : "goToRemix",
			"playlist/:collectionID/remix/:itemID" : "goToRemix"

		},

		index: function() {
			App.on('base_layout_ready', function(){
				App.page = new Map.Model();
			});
			initialize('map');
		},

		participate : function() {
			initialize('modal');
			App.modal = new Participate.Model();
			//$('.selected').removeClass('selected'); 
			//$('#nav-participate').addClass('selected');
		},

		about : function() {
			initialize('modal');
			App.modal = new About.Model();
			//$('.selected').removeClass('selected'); 
			//$('#nav-participate').addClass('selected');
		},

		contact : function() {
			initialize('modal');
			App.modal = new Contact.Model();
			//$('.selected').removeClass('selected'); 
			//$('#nav-participate').addClass('selected');
		},

		goToStory : function(collectionID,itemID)
		{
			console.log('go to story', collectionID, itemID);
			initialize('playlist');

		},
		goToRemix : function(collectionID,itemID)
		{
			console.log('go to remix', collectionID, itemID);
			initialize('playlist');

		}

	});

	/*******************  BEGIN PRIMARY   **********************/

	/*

	tasks to take care of before the application can load
	esp inserting the layout into the dom!

	*/



	function initialize(to) {
		initAMM();
		cleanup(to);
	}

	var initAMM = _.once( init ); // ensure this happens only once 

	function init() {
		console.log('initing');
		// render the base layout into the dom
		var baseLayout = new Backbone.Layout({ el: "#main" });
		var baseView = Backbone.LayoutView.extend({
			template: "base",
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
			}
		});
		baseLayout.insertView( new baseView() );

		// insert subviews
		// playlist view - this should be moved to wherever the playlist is initialized
		baseLayout.setView('#controlsLeft .controls-inner', new Playlist.Views.PlaylistView() );

		baseLayout.afterRender=function(){
			App.trigger('base_layout_ready');
		};
		baseLayout.render();
		
	}

	// happens on every router change
	// we must update this with new cases for AMM as we will have the map, player and modals
	function cleanup(to)
	{
		// if going to a modal, make sure the player is paused
		// if going to a grid, exit the player
		// if closing a modal, and a player exists, then make the player play
		// modal, page, return, player 

		/*
		if( App.page && App.page.player )
		{
			switch(to)
			{
				case 'modal':
					App.page.player.pause();
					break;
				case 'page':
					App.page.exit();
					break;
				case 'player':
					App.page.exit();
					break;
				case 'resume':
					App.page.player.play();
					break;
			}
		}
		*/

		// remove modal if it exists
		if(App.modal)
		{
			App.modal.remove();
			App.modal = null;
		}

	}

	// refresh map after window resize

	function refreshMap(){
		if(App.page&&App.page.type=='Map') App.page.mapView.clearItems();
	}
	var refreshMapLayout = _.debounce(refreshMap, 100);
	$(window).resize(refreshMapLayout);
	


	return Router;

});
