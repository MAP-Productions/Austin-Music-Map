define([
	// Application.
	"app",
	"backbone"
],

function(App, Backbone )
{

	var SSSlider = {};

	SSSlider.View = Backbone.LayoutView.extend({

		className : 'slideshow-slider',

		template : 'slideshow-slider',

		initialize : function()
		{
		},

		serialize : function()
		{
			return this.model.toJSON();
		},

		events : {
			'click a' : 'onClickThumb'
		},

		onClickThumb : function(e)
		{
			console.log('clicked thumb', $(e.target).closest('a').data('slidenum') );
			var slideNum = $(e.target).closest('a').data('slidenum');
			this.highlightThumb(slideNum);
			return false;
		},

		highlightThumb : function(num)
		{
			this.$('li').removeClass('active');
			$(this.$('li')[num]).addClass('active');
		}
		

	});

	return SSSlider;
});
