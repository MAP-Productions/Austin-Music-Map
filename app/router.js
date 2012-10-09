define([
  // Application.
  "app",

  // Modules.
  "modules/playlist"
],

function(app, Playlist) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index"
    },

    index: function() {
      initialize('map');
    }
  });

  /*******************  BEGIN PRIMARY   **********************/

  /*

  tasks to take care of before the application can load
  esp inserting the layout into the dom!

  */

  function initialize(to) {
    initAMM();
    //cleanup(to);
  };

  var initAMM = _.once( init ); // ensure this happens only once 

  function init() {
    console.log('initing');
    // render the base layout into the dom
    var baseLayout = new Backbone.Layout({ el: "#main" });
    var baseView = Backbone.LayoutView.extend({ template: "base" });
    baseLayout.insertView( new baseView() );

    console.log(app);
    // insert subviews. move this?
    var playlist = new Playlist.Views.PlaylistView();
    baseLayout.setView('#controlsLeft', playlist );

    baseLayout.render();
    //nav.render();
  }

  // happens on every router change
  // we must update this with new cases for AMM as we will have the map, player and modals
  function cleanup(to)
  {
    // if going to a modal, make sure the player is paused
    // if going to a grid, exit the player
    // if closing a modal, and a player exists, then make the player play
    // modal, page, return, player 

    if( Zeega.page && Zeega.page.player )
    {
      switch(to)
      {
        case 'modal':
          Zeega.page.player.pause();
          break;
        case 'page':
          Zeega.page.exit();
          break;
        case 'player':
          Zeega.page.exit();
          break;
        case 'resume':
          Zeega.page.player.play();
          break;
      }
    }

    // remove modal if it exists
    if(Zeega.modal)
    {
      Zeega.modal.remove();
      Zeega.modal = null;
    }

  }

  return Router;

});
