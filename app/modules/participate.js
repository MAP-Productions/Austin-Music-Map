define([
	"app",
	// Libs
	"backbone",
	// submodules
	"modules/submodules/modals",
	

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
			
			$('body').append( this.layout.el );
			this.layout.render();
		}
	});

	var ParticipateView = Backbone.LayoutView.extend({
		template: 'participate',
		events: {
			'click .remix-sites-list li' : 'switchContent'
		},
		afterRender : function(){
			SC.initialize({
						client_id: "3b1730e670b204fc2bc9611a88461ee2",
						redirect_uri: "http://dev.zeega.org/ammcallback/callback.html"
			});
			function updateProgress(ms){
				$("#sc-record-progress").text(SC.Helper.millisecondsToHMS(ms));
			}

			var state='waiting';

			$("#sc-upload").click(function(){
				SC.connect({
					connected: function(){
						$("#sc-upload-status").html("Uploading...");
						SC.recordUpload({
							track: {
								title: "Untitled Recording",
								sharing: "private"
							}
						}, function(track){
							$("#sc-upload-status").html("Uploaded: <a href='" + track.permalink_url + "'>" + track.permalink_url + "</a>");
						});
					}
				});

				return false;
			});

			$("#sc-record").click(function(){
				
				if(state=='waiting'){
					updateProgress(0);
					updateState('recording');
					SC.record({
						start: function(){
							
						},
						progress: function(ms){
							updateProgress(ms);

						}
					});
					
					
					$('#recorderFlashContainer').css({"z-index":10000});

				}
				else if(state=="recording"){
					updateState('recorded');
					SC.recordStop();
				}
				else if(state=="recorded"){
					updateState('playing');
					SC.recordPlay({
						start: function(){
							
						},
						progress: function(ms){
							updateProgress(ms);

						},
						finished:function(){
							if(state!='waiting') updateState('recorded');
						}
					});
					
				}


				return false;

				
				
			});
			$('#sc-cancel-record').click(function(){
				
				updateState('waiting');
				SC.recordStop();
			});

			function updateState(newState){
				state=newState;
				if(newState=='recorded'){
					$("#sc-record-total").text($("#sc-record-progress").text());
					updateProgress(0);
				}
				

			}

			


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