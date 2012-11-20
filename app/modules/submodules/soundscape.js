define([
	"app",
	// Libs
	"backbone"

],

function(App, Backbone)
{

	// Create a new module
	var Soundscape = Zeega.module();

	Soundscape.initialize=function(){
	
		var _this=this;
		this.loaded=false;
		this.muted=false;
		var audio = $('<audio>').attr({'id':'amm-soundscape'});
		var codec;
		if(Modernizr.audio.mp3 === '') codec ='ogg';
		else codec ='mp3';


		if(codec=='mp3'){
			audio.on('canplay',function(){console.log('soundscape can play');});
			audio.on('canplaythrough',function(){
				if(App.page&&App.page.type=='Map') {
					this.play();
				}
				_this.loaded=true;
			});
		}
		else{
			audio.on('canplay',function(){
				console.log('canplay');

				if(App.page&&App.page.type=='Map'&&_this.loaded) {
					console.log('canplaythrough');
					this.play();
				}
				_this.loaded=true;
			});

		}
		

		audio.attr({'src':'assets/audio/soundscape.'+codec}).appendTo('body');

		for(var i=1;i<=5;i++){

			var j=5+i;
			
			
			$('body').append($('<audio>').attr({'src':'assets/audio/static'+i+'.'+codec,'id':'amm-static-'+i}));
			$('body').append($('<audio>').attr({'src':'assets/audio/ding'+i+'.'+codec,'id':'amm-ding-'+i}));
			$('body').append($('<audio>').attr({'src':'assets/audio/ding'+i+'.'+codec,'id':'amm-ding-'+j}));
			


		}

		_.delay(function(){$('#mute-button').click(function(){console.log('cliocked');_this.muteToggle();});},100);

	};

	Soundscape.play=function(){

		if(this.loaded&&!this.muted)document.getElementById('amm-soundscape').play();
	};

	Soundscape.muteToggle=function(){
		if(this.muted){
			$('#mute-button').removeClass('muted').addClass('audible');
			this.muted=false;
			if(this.loaded)document.getElementById('amm-soundscape').play();
		}else{
			$('#mute-button').removeClass('audible').addClass('muted');
			this.muted=true;
			this.pause();
		}
	};

	Soundscape.pause=function(){

		if(this.loaded)document.getElementById('amm-soundscape').pause();
	};

	Soundscape.ding = function(){
		if(!this.muted){
			var dingNo=Math.floor(1+Math.random()*10);
			var ding=document.getElementById('amm-ding-'+dingNo);
			if(ding.duration>0){
				ding.currentTime=0;
				ding.play();
			}
		}
	};



	// Required, return the module for AMD compliance
	return Soundscape;
});
