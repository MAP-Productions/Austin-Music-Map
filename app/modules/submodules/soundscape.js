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
		var audio = $('<audio>').attr({'id':'amm-soundscape'});
		audio.on('canplay',function(){console.log('soundscape can play');});
		audio.on('canplaythrough',function(){
			if(App.page&&App.page.type=='Map') {
				this.play();
			}
			_this.loaded=true;
		});
		
		var codec;
		if(Modernizr.audio.mp3 === '') codec ='ogg';
		else codec ='mp3';

		audio.attr({'src':'assets/audio/soundscape.'+codec}).appendTo('body');

		for(var i=1;i<=4;i++){

			var j=4+i;
			
			
			$('body').append($('<audio>').attr({'src':'assets/audio/static'+i+'.'+codec,'id':'amm-static-'+i}));
			$('body').append($('<audio>').attr({'src':'assets/audio/ding'+i+'.'+codec,'id':'amm-ding-'+i}));
			$('body').append($('<audio>').attr({'src':'assets/audio/ding'+i+'.'+codec,'id':'amm-ding-'+j}));
			


		}


	};

	Soundscape.play=function(){

		if(this.loaded)document.getElementById('amm-soundscape').play();
	};

	Soundscape.pause=function(){

		if(this.loaded)document.getElementById('amm-soundscape').pause();
	};

	Soundscape.ding = function(){
		/*
		var dingNo=Math.floor(1+Math.random()*8);
		var ding=document.getElementById('amm-ding-'+dingNo);
		ding.currentTime=0;
		ding.play();
		*/
	};



	// Required, return the module for AMD compliance
	return Soundscape;
});
