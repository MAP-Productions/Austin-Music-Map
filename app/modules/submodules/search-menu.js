define([
	// Application.
	"app",
	"backbone"
],

function(App, Backbone )
{

	var Search = {};

	Search.View = Backbone.LayoutView.extend({

		template : 'search-menu'

	});

	return Search;
});
