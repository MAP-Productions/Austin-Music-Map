define([
	"app",
	// Libs
	"backbone"
],

function(App, Backbone) {

	// Create a new module
	var MiniIntro = Zeega.module();

	MiniIntro.View = Backbone.LayoutView.extend({
		template : 'mini-intro',
		initialize: function() {
			var _this = this;
			_.bindAll(this, 'removeMiniIntro');
			$('body').on('click', function() {
				_this.remove();
				$('body').off('click');
			});
		},
		afterRender: function() {
			setTimeout(this.removeMiniIntro, 8500);
		},
		removeMiniIntro : function()
		{
			var _this = this;
			this.$('.mini-intro').fadeOut(1000, function() {
				_this.remove();
			});
		}
	});


	// Required, return the module for AMD compliance
	return MiniIntro;
});