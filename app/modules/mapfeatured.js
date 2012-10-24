define([
	"app",
	// Libs
	"backbone"
],

function(app, Backbone)
{

	// Create a new module
	var MapFeatured = app.module();

	MapFeatured.Views.MapFeaturedView = Backbone.LayoutView.extend({
		template : 'mapfeatured',
		
		initialize : function()
		{
			console.log('delegate events',this.events);
			this.delegateEvents();
		}

	});

	// Required, return the module for AMD compliance
	return MapFeatured;
});
