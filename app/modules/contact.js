define([
	"app",
	// Libs
	"backbone",
	// submodules
	"modules/submodules/modals"

], function(App, Backbone, Modal) {
	
	var Contact = App.module();

	Contact.Model = Modal.Model.extend({
		defaults: {
			title: 'Contact',
			modalTemplate: 'modal'
		},

		initialize: function() {
			console.log('initialize participate modal modal');
			this.layout = this.getLayout();
			this.layout.setView('.modal-content', new ContactView() );
			this.layout.render();
			$('body').append( this.layout.el );
		}
	});

	var ContactView = Backbone.LayoutView.extend({
		template: 'contact',
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
	return Contact;

});