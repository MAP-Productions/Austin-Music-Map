define([
	"app",
	// Libs
	"backbone",
	// submodules
	"modules/submodules/modals"

], function(App, Backbone, Modal) {
	
	var About = App.module();

	About.Model = Modal.Model.extend({
		defaults: {
			title: 'About',
			modalTemplate: 'modal'
		},

		initialize: function() {
			console.log('initialize about modal');
			this.layout = this.getLayout();
			this.layout.setView('.modal-content', new AboutView() );
			this.layout.render();
			$('body').append( this.layout.el );
		}
	});

	var AboutView = Backbone.LayoutView.extend({
		template: 'about',
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
	return About;

});