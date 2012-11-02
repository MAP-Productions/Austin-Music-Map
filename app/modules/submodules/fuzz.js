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
		var overlay = $("<div></div>").addClass('fuzz');
		document.getElementById('amm-static').play();
		overlay.appendTo($('body')).fadeIn('slow',function(){$(this).fadeOut('slow');});
	};

	// Required, return the module for AMD compliance
	return Fuzz;
});
