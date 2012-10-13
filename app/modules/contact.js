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
		template: 'contact'
	});

	// Required, return the module for AMD compliance
	return Contact;

});