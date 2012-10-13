define([
  // Application.
  "app",

  // Modules.
  "modules/playlist",
  "modules/participate",
  "modules/about",
  "modules/contact"
],

function(App, Playlist, Participate, About, Contact) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "participate": "participate",
      "about": "about",
      "contact": "contact"
    },

    index: function() {
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
  };

  var initAMM = _.once( init ); // ensure this happens only once 

  function init() {
    console.log('initing');
    // render the base layout into the dom
    var baseLayout = new Backbone.Layout({ el: "#main" });
    var baseView = Backbone.LayoutView.extend({ template: "base" });
    baseLayout.insertView( new baseView() );

    // insert subviews
    // playlist view - this should be moved to wherever the playlist is initialized
    baseLayout.setView('#controlsLeft .controls-inner', new Playlist.Views.PlaylistView() );

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

  return Router;

});
