define([
	"app",
	// Libs
	"backbone"
],

function(App, Backbone) {


	var WAIT_DURATION = 30000; // the length of time to wait after the animation is complete and before the intro fades out

	// Create a new module
	var Introduction = Zeega.module();

	Introduction.View = Backbone.LayoutView.extend({
		template : 'introduction',
		events: {
			'click .next': 'exitIntroduction'
		},
		initialize : function() {
			_.bindAll(this, 'afterRender');
		},
		afterRender : function() {
			var animLength = 7000,
				_this = this;

			this.els = {
				overlay: this.$('.intro-overlay'),
				toFade: this.$('.fade')
			};

			this.els.toFade.each(function(i,v) {
				$(this).delay( ( ( animLength / (_this.els.toFade.length + 1 ) ) * i ) + 500 ).fadeIn(500);
			});

			setTimeout(function() {
				_this.exitIntroduction();
			}, animLength + WAIT_DURATION);
		},

		exitIntroduction : function()
		{
			var _this = this;
			this.els.overlay.fadeOut(1000, function() {
				_this.remove();
			});
		}
	});


	// Required, return the module for AMD compliance
	return Introduction;
});