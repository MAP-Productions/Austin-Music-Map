define([
	"app",
	// Libs
	"backbone"
],

function(App, Backbone) {

	// Create a new module
	var Introduction = Zeega.module();

	Introduction.View = Backbone.LayoutView.extend({
		template : 'introduction',
		initialize : function() {
			_.bindAll(this, 'afterRender');
		},
		afterRender : function() {
			var _this = this;
			this.els = {
				overlay: this.$('.intro-overlay')
			};
			setTimeout(function() {
				_this.exitIntroduction();
			}, 10000);
		},

		exitIntroduction : function()
		{
			this.els.overlay.fadeOut(1000, function() {
				this.remove();
			});
		}
	});


	// Required, return the module for AMD compliance
	return Introduction;
});