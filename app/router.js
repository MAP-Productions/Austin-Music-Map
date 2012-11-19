define([
	// Application.
	"app",

	// Modules.
	"modules/base",
	"modules/playlist",
	"modules/participate",
	"modules/about",
	"modules/contact",
	"modules/map",
	"modules/scpost",
	"modules/introduction",

	// submodules
	"modules/submodules/player-slider",
	"modules/submodules/fuzz",
	"modules/submodules/soundscape",
	"modules/submodules/helpers"

],

function(App, Base, Playlist, Participate, About, Contact, Map, SCPost, Introduction, PlayerSlider,Fuzz,Soundscape,Helpers) {
	// Defining the application router, you can attach sub routers here.
	var Router = Backbone.Router.extend({
		routes: {
			"": "index",
			"participate": "participate",
			"about": "about",
			"contact": "contact",
			"scpost": "scpost",

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
//			App.on('base_layout_ready', function(){
			if(!App.page || (App.page && App.page.type != 'Map') ) App.page = new Map.Model();

//			});
			initialize('map');
		},

		scpost:function(){
			initialize('modal');
			App.modal = new SCPost.Model();
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

			App.Player = new PlayerSlider.Model({
				collection_id: collectionID,
				item_id: itemID,
				start_frame: itemID
			});
			if(App.page&&App.page.type=='Map') App.page.mapView.clearItems();

		},
		goToRemix : function(collectionID,itemID)
		{

			console.log('go to remix', collectionID, itemID);
			initialize('playlist');
			App.Player = new PlayerSlider.Model({
				collection_id: collectionID,
				item_id: itemID,
				start_frame: itemID
			});
			if(App.page&&App.page.type=='Map') App.page.mapView.clearItems();
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
		if(to=="map")
		{
			App.soundscape.play();
			$(window).bind('resize.amm_map',refreshMapLayout);
			$('#logo img').addClass('map');
		}
		else
		{
			App.soundscape.pause();
			$('#logo img').removeClass('map');
		}
	}

	// ensure this happens only once
	var initAMM = _.once( init );

	function init()
	{

		if(!Modernizr.canvas) window.location="old-browser.html";
		// draw the base layout
		App.BaseLayout = new Base();
		App.BaseLayout.render();

		App.fuzz=Fuzz;
		App.soundscape=Soundscape;
		App.soundscape.initialize();

		if ( Helpers.firstVisit ) {
			var introScreen = new Introduction.View();
			$('#main').append( introScreen.el );
			introScreen.render();
		}

	}

	// happens on every router change
	// we must update this with new cases for AMM as we will have the map, player and modals
	function cleanup(to)
	{
		// hide left controls if any
		App.BaseLayout.hideLeftMenu({
			next: to
		});

		// remove modal if it exists
		if(App.modal)
		{
			App.modal.remove();
			App.modal = null;
		}

		if(App.Player)
		{
			App.Player.exit();
			App.Player = null;
		}

	}

	// refresh map after window resize

	function refreshMap()
	{
		console.log('refresh map');
		if(App.page&&App.page.type=='Map') App.page.mapView.clearItems();
	}
	var refreshMapLayout = _.debounce(refreshMap, 100);

	//$(window).resize(refreshMapLayout);
	


	return Router;

});
