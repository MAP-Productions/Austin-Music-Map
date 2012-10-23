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
		template : 'mapfeatured',
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

	// Required, return the module for AMD compliance
	return MapFeatured;
});
