define([
	"app",
	// Libs
	"backbone"
],

function(app, Backbone)
{

	// Create a new module
	var MapFeatured = app.module();

	MapFeatured.Views = MapFeatured.Views || {};

	MapFeatured.Views.MapFeaturedView = Backbone.LayoutView.extend({
		template : 'mapfeatured'
	});

	// Required, return the module for AMD compliance
	return MapFeatured;
});
