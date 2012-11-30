define([
	"app",
	// Libs
	"backbone"

],

function(App, Backbone)
{

	// Create a new module
	var Fuzz = Zeega.module();

	Fuzz.show = function(loadingText) {
		var duration = 1000,
			overlay = $("<div></div>").addClass('fuzz'),
			soundId=Math.floor(1+5*Math.random());

		$('.fuzz').remove();
		document.getElementById('amm-static-'+soundId).play();
		overlay.appendTo($('body')).fadeIn(duration,function(){$(this).fadeOut(duration);});
	};

	// Required, return the module for AMD compliance
	return Fuzz;
});
