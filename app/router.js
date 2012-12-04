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
	"modules/mini-intro",

	// submodules
	"modules/submodules/player-slider",
	"modules/submodules/fuzz",
	"modules/submodules/soundscape",
	"modules/submodules/helpers"

],

function(App, Base, Playlist, Participate, About, Contact, Map, SCPost, Introduction, MiniIntro, PlayerSlider,Fuzz,Soundscape,Helpers) {
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
			"playlist/:collectionID/remix/:itemID" : "goToRemix",

			"playlist/:collectionID/remix/:itemID/slide/:slideID" : "goToRemixSlide"

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
			this.playerType = 'story';
			this.collection_id = collectionID;
			this.item_id = itemID;
			initialize('playlist');

			App.Player = new PlayerSlider.Model({
				collection_id: collectionID,
				item_id: itemID,
				start_frame: itemID
			});
			//if(App.page&&App.page.type=='Map') App.page.mapView.resetPoints();

		},
		goToRemix : function(collectionID,itemID)
		{
			this.playerType = 'remix';
			this.collection_id = collectionID;
			this.item_id = itemID;
			initialize('playlist');
			App.Player = new PlayerSlider.Model({
				collection_id: collectionID,
				item_id: itemID,
				start_frame: itemID
			});
			//if(App.page&&App.page.type=='Map') App.page.mapView.resetPoints();
		},
		goToRemixSlide : function(collectionID,itemID, slideID)
		{
			this.playerType = 'remix';
			this.collection_id = collectionID;
			this.item_id = itemID;
			this.slide_id = slideID;
			initialize('playlist');
			App.Player = new PlayerSlider.Model({
				collection_id: collectionID,
				item_id: itemID,
				start_frame: itemID,
				start_slide_id: parseInt(slideID,10)
			});
			//if(App.page&&App.page.type=='Map') App.page.mapView.resetPoints();
		}

	});

	/*******************  BEGIN PRIMARY   **********************/

	/*

	tasks to take care of before the application can load
	esp inserting the layout into the dom!

	*/

	function initialize(to) {
		initAMM(to);
		cleanup(to);
		if(to=="map") {
			App.soundscape.play();
			$(window).bind('resize.amm_map',refreshMapLayout);
			$('#logo img').addClass('map');

			// show small intro circle if:
			// a) this is not the first visit and this is your first time at the map
			// b) this is your first visit, but you came in via something other than map
			if ( (!Helpers.firstVisit && !App.mapVisited) || (Helpers.firstVisit && App.entryPoint !== 'map') ) {
				var miniIntro = new MiniIntro.View();
				$('#main').append( miniIntro.el );
				miniIntro.render();
			}
			App.mapVisited = true;
			_.delay( function() {
				$('.map-extras').fadeIn();
			}, 10);
		} else {
			App.soundscape.pause();
			$('#logo img').removeClass('map');
			_.delay( function() {
				$('.map-extras').hide();
			}, 10);
		}
	}

	// ensure this happens only once
	var initAMM = _.once( init );

	function init(to)
	{
		App.mapVisited = false;
		App.entryPoint = to;

		if(!Modernizr.canvas) window.location="old-browser.html";
		// draw the base layout
		App.BaseLayout = new Base();
		App.BaseLayout.render();

		App.fuzz=Fuzz;
		App.soundscape=Soundscape;
		App.soundscape.initialize();

		if ( to === 'map' && Helpers.firstVisit ) {
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
		if(App.page&&App.page.type=='Map') App.page.mapView.resetPoints();
	}
	var refreshMapLayout = _.debounce(refreshMap, 100);

	//$(window).resize(refreshMapLayout);
	


	return Router;

});
