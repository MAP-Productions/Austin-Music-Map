define([
	"app",
	// Libs
	"backbone"
],

function(App, Backbone)
{

	// Create a new module
	var Modal = App.module();

	Modal.Model = Backbone.Model.extend({

		defaults : {
			title : 'Austin Music Map',
			modalTemplate : 'modal'
		},

		// returns a new modalLayout with model set to this
		getLayout : function()
		{
			console.log('getLayout');
			var layout = new modalLayout( {
				model: this,
				template: this.get('modalTemplate')
			} );
			//layout.template = this.get('modalTemplate');
			return layout;
		},

		remove : function()
		{
			this.layout.remove();
		}
	});

	var modalLayout = Backbone.Layout.extend({
		fetch: function(path) {
			// Initialize done for use in async-mode
			var done;

			// Concatenate the file extension.
			path = 'app/templates/layouts/'+ path + ".html";

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
		},

		className : 'modal-overlay',

		events : {
			'click .close' : 'closeModal'
		},

		initialize: function() {
			//loadingSpinner.show( this.model.get('title') );
		},

		afterRender: function() {
			//loadingSpinner.hide();
		},

		closeModal : function()
		{
			//window.history.back();
			//window.location = "/";
			App.router.navigate("", { trigger: true } );
			return false;
		},

		serialize : function(){ return this.model.toJSON(); }

	});

	// Required, return the module for AMD compliance
	return Modal;
});
