define([
	"app",
	// Libs
	"backbone"
],

function(App, Backbone)
{

	// Create a new module
	var Playlist = App.module();

	Playlist.Views = Playlist.Views || {};

	Playlist.Views.PlaylistView = Backbone.LayoutView.extend({
		initialize: function()
		{
			App.players.on('update_title', this.onFrameChange, this);
		},
		template : 'playlist',

		serialize : function(){ return this.model.toJSON(); },
		
		events : {
			'click .toggle-playlist' : 'togglePlaylist',
			'click .progress-bar' : 'goToTime',
			'click .remix-toggle' : 'remixToggle',
			'click .back' : 'playerPrev',
			'click .forward' : 'playerNext',
			'click .play-pause' : 'playPause'
		},
		togglePlaylist: function(e) {
			$(e.target).toggleClass('open');

			$('.playlist-container').stop().slideToggle();
		},
		goToTime: function(e)
		{
			//disabled for now
			// for now this just updates the progress bar
			console.log('go to time', this.template );
			var progressBar = $(e.currentTarget);
			var percentClicked = ( (e.pageX - progressBar.offset().left) / progressBar.width() ) * 100;
			this.$('.elapsed').css('width',percentClicked + '%');
			
		},
		remixToggle : function()
		{
			console.log('toggle remix', App);
			if( App.players.get('story') && App.players.get('remix') )
			{
				// close off old player
				console.log('pause old player?',App.players, App.players.get('current') );
				App.players.get('current').pause();
				this.endPlayerEvents();
	
				// slide player into view
				$('.player-slider').toggleClass('view-remix');

				// update current player
				if( $('.player-slider').hasClass('view-remix') ) App.players.set('current', App.players.get('remix'));
				else App.players.set('current', App.players.get('story'));
				
				// start new player events
				this.startPlayerEvents();
				this.clearElapsed();
				this.onFrameChange(App.players.get('current').getFrameData() );

				App.players.get('current').play();
			}
			return false;
		},

		startPlayerEvents : function()
		{
			if(App.players.get('current'))
			{
				App.players.get('current').on('frame_rendered', this.onFrameChange, this);
				App.players.get('current').on('media_timeupdate', this.onTimeUpdate, this);
			}
		},

		endPlayerEvents : function()
		{
			if(App.players.get('current'))
			{
				App.players.get('current').off('frame_rendered', this.onFrameChange, this);
				App.players.get('current').off('media_timeupdate', this.onTimeUpdate, this);
			}
		},

		playerPrev : function()
		{
			App.players.get('current').cuePrev();
		},
		playerNext : function()
		{
			App.players.get('current').cueNext();
		},
		playPause : function()
		{
			App.players.get('current').playPause();
		},

		onFrameChange : function( info )
		{
			if(info)
			{
				this.$('.playing-subtitle').text( info.layers[0].attr.title + ' by ' + info.layers[0].attr.media_creator_username );
				this.updateControlsState( info );
				this.updatePlaylistDropdown();
			}
		},

		updateControlsState : function( info )
		{
			// updates the visual status of the the prev / next buttons on the controller
			var next = this.$('.transport .forward');
			var prev = this.$('.transport .back');
			if(info.next)
			{
				if(next.hasClass('disabled')) next.removeClass('disabled');
			}
			else if( !next.hasClass('disabled')) next.addClass('disabled');
			if(info.prev)
			{
				if(prev.hasClass('disabled')) prev.removeClass('disabled');
			}
			else if( !prev.hasClass('disabled')) prev.addClass('disabled');
			
			if (App.players.get('current').get('div_id') == 'player-remix') $('.remix-toggle').addClass('remix');
			else $('.remix-toggle').removeClass('remix');
		},

		updatePlaylistDropdown : function()
		{
			console.log('***** on frame change', App.players.get('current').getProjectData() );
			this.$('.playlist-container .playlist').empty();
			_.each( App.players.get('current').getProjectData().frames, function(frame){
				var LIView = new PlaylistItemView({model: new Backbone.Model(frame) });
				this.$('.playlist-container .playlist').append( LIView.el );
				LIView.render();
			});
		},

		onTimeUpdate : function( info )
		{
			this.$('.progress-bar .elapsed').css( 'width', (info.current_time/info.duration *100) +'%' );
		},

		clearElapsed : function()
		{
			this.$('.progress-bar .elapsed').css( 'width', '0' );
		}

	});

	var PlaylistItemView = Backbone.LayoutView.extend({
		tagName : 'li',
		template : 'playlist-item',
		serialize : function(){ return this.model.toJSON(); }
	});

	// Required, return the module for AMD compliance
	return Playlist;
});
