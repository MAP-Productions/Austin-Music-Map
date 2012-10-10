define([
	"app",
	// Libs
	"backbone"
],

function(app, Backbone)
{

	// Create a new module
	var App = app.module();

	App.Views = App.Views || {};

	App.Views.PlaylistView = Backbone.LayoutView.extend({
		template : 'playlist'
	});

	// Required, return the module for AMD compliance
	return App;
});
