define([
	"app",
	// Libs
	"backbone",


], function(App, Backbone) {
	
	var Map = App.module();

	Map.Model = Backbone.Model.extend({
		defaults: {
			title: 'Map',
		},

		initialize: function() {
			this.layout = new MapView();
			this.layout.render();
			console.log($('#appBas'));
			$('#appBase').append( this.layout.el );
		}
	});

	var MapView = Backbone.LayoutView.extend({
		template: 'map',
		afterRender : function(){

			console.log('afterrender');

		}
	});

	// Required, return the module for AMD compliance
	return Map;

});