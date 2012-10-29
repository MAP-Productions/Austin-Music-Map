define([
	"app",
	// Libs
	"backbone",
	// submodules
	"modules/submodules/modals"

], function(App, Backbone, Modal) {
	"use strict";
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
		template: 'about'
	});

	// Required, return the module for AMD compliance
	return About;

});