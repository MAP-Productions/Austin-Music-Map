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
		audio = $('<audio>').attr({'id':'amm-soundscape'});
		audio.on('canplay',function(){console.log('soundscape can play');});
		audio.on('canplaythrough',function(){
			if(App.page&&App.page.type=='Map') {
				this.play();
			}
			_this.loaded=true;
		});
		audio.attr({'src':'assets/audio/soundscape.mp3'}).appendTo('body');


	};

	Soundscape.play=function(){

		if(this.loaded)document.getElementById('amm-soundscape').play();
	};

	Soundscape.pause=function(){

		if(this.loaded)document.getElementById('amm-soundscape').pause();
	};



	// Required, return the module for AMD compliance
	return Soundscape;
});
