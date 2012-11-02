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
			this.recordedLength = 0;
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
							title: "Austin Music Map Story",
							sharing: "public",
							tag_list: "austinmusicmap"
						}
					}, function(track){
						App.track=track;
						App.router.navigate('scpost',true);
						console.log('TRACK',track);
						//$("#sc-upload-status").html("Uploaded: <a href='" + track.permalink_url + "'>" + track.permalink_url + "</a>");
					});
				}
			});

			return false;
		},
		scRecord: function(){
			var view = this;
		
			if(this.state=='waiting'){
				SC.record({
					start: function(){
						view.updateProgress(0);
						view.updateState('recording');
					},
					progress: function(ms){
						view.updateProgress(ms);

					}
				});
				
				
				$('#recorderFlashContainer').css({"z-index":10000});

			}
			else if(this.state=="recording"){
				this.updateState('recorded');
				SC.recordStop();
			}
			else if(this.state=="recorded"){
				this.updateState('playing');
				SC.recordPlay({
					start: function(){
						
					},
					progress: function(ms){
						view.updateProgress(ms);

					},
					finished:function(){
						if(this.state!='waiting') {
							view.updateState('recorded');
						}
					}
				});
				
			}
			else if(this.state == "playing"){
				SC.recordStop();
			}

			return false;
		
		},
		scCancelRecord: function(){
			this.updateState('waiting');
		},
		updateProgress: function(ms){
			$("#sc-record-progress").text( SC.Helper.millisecondsToHMS(ms).replace('.',':') );
		},
		updateState: function(newState){
			var oldState = this.state;
			this.state = newState;

			if (newState == 'waiting') {
				this.$('#sc-record').removeClass('play').removeClass('stop');
				this.$('#recording-options').hide();
				this.$("#sc-record-status").text('ready to record');
			}
			else if (newState == 'recording'){
				this.$('#sc-record').removeClass('play').addClass('stop');
				this.$('#recording-options').hide();
				this.$("#sc-record-status").text('recording');
			}
			else if (newState == 'recorded'){
				this.$('#sc-record').removeClass('stop').addClass('play');
				this.$('#recording-options').show();
				if (oldState == 'recording') {
					this.recordedLength = this.$("#sc-record-progress").text();
				}
				$("#sc-record-status").text(this.recordedLength + ' recorded');
				this.updateProgress(0);
			}
			else if (newState == 'playing'){
				this.$('#sc-record').removeClass('play').addClass('stop');
				this.$('#recording-options').hide();
				$("#sc-record-status").text('playing');
			}
		}
		
	});

	return SoundUpload;

});