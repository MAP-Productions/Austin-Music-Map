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
			window.history.back();
			//window.location = "/";
			//App.router.navigate("", { trigger: true } );
			return false;
		},

		serialize : function(){ return this.model.toJSON(); }

	});

	// Required, return the module for AMD compliance
	return Modal;
});
