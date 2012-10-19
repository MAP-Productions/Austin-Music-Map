define([
	"app",
	// Libs
	"backbone"
], function(App, Backbone) {

	var SoundUpload = App.module();

	SoundUpload.View = Backbone.LayoutView.extend({
		template: 'soundupload',
		initialize: function() {
			_.bindAll(this, 'afterRender', 'scUpload', 'scRecord', 'scCancelRecord', 'updateProgress', 'updateState');
		},
		events: {
			'click #sc-upload': 'scUpload',
			'click #sc-record': 'scRecord',
			'click #sc-cancel-record': 'scCancelRecord'
		},
		afterRender : function(){
			this.state = 'waiting';
			SC.initialize({
				client_id: "3b1730e670b204fc2bc9611a88461ee2",
				redirect_uri: "http://dev.zeega.org/ammcallback/callback.html"
			});

		},
		scUpload: function(){
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
		},
		scRecord: function(){
			var view = this;
		
			if(this.state=='waiting'){
				this.updateProgress(0);
				this.updateState('recording');
				SC.record({
					start: function(){
						
					},
					progress: function(ms){
						view.updateProgress(ms);

					}
				});
				
				
				$('#recorderFlashContainer').css({"z-index":10000});

			}
			else if(state=="recording"){
				this.updateState('recorded');
				SC.recordStop();
			}
			else if(state=="recorded"){
				this.updateState('playing');
				SC.recordPlay({
					start: function(){
						
					},
					progress: function(ms){
						view.updateProgress(ms);

					},
					finished:function(){
						if(state!='waiting') {
							view.updateState('recorded');
						}
					}
				});
				
			}

			return false;
		
		},
		scCancelRecord: function(){
			this.updateState('waiting');
			SC.recordStop();
		},
		updateProgress: function(ms){
			$("#sc-record-progress").text(SC.Helper.millisecondsToHMS(ms));
		},
		updateState: function(newState){
			this.state=newState;
			if(newState=='recorded'){
				$("#sc-record-total").text($("#sc-record-progress").text());
				this.updateProgress(0);
			}
		}
		
	});

	return SoundUpload;

});