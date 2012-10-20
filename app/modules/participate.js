define([
	"app",
	// Libs
	"backbone",
	// submodules
	"modules/submodules/modals",
	"modules/submodules/soundupload"
	

], function(App, Backbone, Modal, SoundUpload) {
	
	var Participate = App.module();

	Participate.Model = Modal.Model.extend({
		defaults: {
			title: 'Participate',
			modalTemplate: 'modal'
		},

		initialize: function() {
			console.log('initialize participate modal');
			this.layout = this.getLayout();
			this.layout.setView('.modal-content', new ParticipateView() );
			
			$('body').append( this.layout.el );
			this.layout.render();
		}
	});

	var ParticipateView = Backbone.LayoutView.extend({
		template: 'participate',
		initialize: function() {
			this.setView('.sc-upload', new SoundUpload.View() );
		},
		events: {
			'click .remix-sites-list li' : 'switchContent'
		},
		switchContent: function(e) {
			var clicked = $(e.currentTarget);
			clicked.addClass('active').siblings().removeClass('active');
			$('.remix-sites-info > div').eq( clicked.index() ).show().siblings().hide();
		}
	});

	// Required, return the module for AMD compliance
	return Participate;

});