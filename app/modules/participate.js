define([
	"app",
	// Libs
	"backbone",
	// submodules
	"modules/submodules/modals"

], function(App, Backbone, Modal) {
	
	var Participate = App.module();

	Participate.Model = Modal.Model.extend({
		defaults: {
			title: 'Participate',
			modalTemplate: 'modal'
		},

		initialize: function() {
			console.log('initialize participate modal modal');
			this.layout = this.getLayout();
			this.layout.setView('.modal-content', new ParticipateView() );
			this.layout.render();
			$('body').append( this.layout.el );
		}
	});

	var ParticipateView = Backbone.LayoutView.extend({
		template: 'participate',
		events: {
			'click .remix-sites-list li' : 'switchContent'
		},
		afterRender : function(){
			$("#soundcloud-record").click(function(e){
				
				SC.record({
					start: function(){
						window.console.log('starting');
						window.setTimeout(function(){
							SC.recordPlay();
						}, 5000);
					},
					progress: function(ms, avgPeak){
						
						console.log(ms);
					}
				});
			
				return false;
			});

			


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