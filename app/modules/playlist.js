define([
	"app",
	// Libs
	"backbone",
	"modules/playlistmap",
	"modules/map",
	// submodules
	"modules/submodules/helpers",
	
	"modules/submodules/fuzz"

	
],

function(App, Backbone, PlaylistMap,Map, Helper,Fuzz )

{

	// Create a new module
	var Playlist = App.module();

	Playlist.Views = Playlist.Views || {};

	Playlist.Views.PlaylistView = Backbone.LayoutView.extend({

		amm_player_type : 'story',

		template : 'playlist',

		initialize: function() {
			console.log('	initialize playlist')
			App.players.on('play', this.onPlay, this);
			App.players.on('update_title', this.onFrameChange, this);
		},

		serialize: function() {
			return this.model.toJSON();
		},

		afterRender: function() {
			var _this=this;
			_.delay(function() {
				_this.playlistMap = new PlaylistMap.Model();
			}, 500 );
			this.updatePlaylistToggle();
		},

		updatePlaylistToggle : function() {
			var flag = false;

			if ( _.isUndefined(App.players.get('remix')) ) {
				this.$('.remix-toggle .remix').addClass('disabled');
				flag = true;
			}
			if ( _.isUndefined(App.players.get('story')) ) {
				this.$('.remix-toggle .stories').addClass('disabled');
				flag = true;
			}
			if ( flag ) {
				this.$('.slider-track').css('background','#444');
				this.$('.slider').css('opacity',0.25);
				this.undelegateEvents();
				this.delegateEvents(this.ev2);
			}
		},

		ev2 : {
			'click .toggle-playlist' : 'togglePlaylist',
			'click .progress-bar' : 'goToTime',
			'click .remix-toggle' : 'doNothing',
			'click .back' : 'playerPrev',
			'click .forward' : 'playerNext',
			'click .play-pause' : 'playPause',
			'mouseenter .stories-remix-slider' : 'onMouseoverSlider',
			'mouseleave .stories-remix-slider' : 'onMouseoutSlider'
		},

		events : {
			'click .toggle-playlist' : 'togglePlaylist',
			'click .progress-bar' : 'goToTime',
			'click .remix-toggle' : 'remixToggle',
			'click .back' : 'playerPrev',
			'click .forward' : 'playerNext',
			'click .play-pause' : 'playPause',
			'mouseenter .stories-remix-slider' : 'onMouseoverSlider',
			'mouseleave .stories-remix-slider' : 'onMouseoutSlider'
		},

		onMouseoverSlider : function(e) {
			var POPUP_DELAY = 1000;
			var popuptext = '<span class="popup">click to switch between KUT produced stories and remixed community audio and visuals</span>';
			var self = $(e.target);
			var css = {
				'left' : '10px',
				'top' : (self.offset().top + self.height() +10) +'px'
			};
			var pu = $(popuptext).css(css);
			this.timeout = setTimeout(function() {
				$('body').append(pu);
			}, POPUP_DELAY);
		},

		onMouseoutSlider : function() {
			if($('.popup')) $('.popup').remove();
			clearTimeout(this.timeout);
		},

		doNothing : function() {
			return false;
		},

		togglePlaylist: function(e) {
			this.$('.toggle-playlist').toggleClass('open');
			$('.playlist-container').stop().slideToggle();
		},

		goToTime: function(e) {
			//disabled for now
			// for now this just updates the progress bar
			var progressBar = $(e.currentTarget),
				percentClicked = ( (e.pageX - progressBar.offset().left) / progressBar.width() ),
				mediaLayer = App.players.get("current").project.status.get("current_frame_model").layers.at(0),
				duration = mediaLayer ? mediaLayer.visualElement.mediaPlayer.getDuration() : null;

			if ( mediaLayer ) {
				mediaLayer.visualElement.mediaPlayer.setCurrentTime( duration * percentClicked );
			}
			
			this.$('.elapsed').css('width', ( percentClicked * 100 ) + '%');
			
		},

		remixToggle : function() {

			Fuzz.show();

			if( App.players.get('story') && App.players.get('remix') ) {
				// close off old player
				App.players.get('current').project.pause();
				this.endPlayerEvents();
	
				// slide player into view
				$('.player-slider').toggleClass('view-remix');

				// update current player
				if( $('.player-slider').hasClass('view-remix') ) {
					this.amm_player_type = 'remix';
					App.players.set('current', App.players.get('remix'));
				} else {
					this.amm_player_type = 'story';
					App.players.set('current', App.players.get('story'));
				}

				// start new player events
				this.startPlayerEvents();
				this.clearElapsed();
				this.onFrameChange(App.players.get('current').project.getFrameData() );

				App.players.get('current').project.play();

				this.updateURL();
			}
			return false;
		},

		updateURL : function() {
			this.amm_player_type = App.router.playerType;
			App.router.item_id = App.players.get('current').project.getFrameData().id;
//			App.router.navigate('playlist/'+ App.Player.get('collection_id') +'/'+ this.amm_player_type +'/'+ App.players.get('current').getFrameData().id );
			if( this.amm_player_type == 'story') {
				App.router.navigate('playlist/'+ App.router.collection_id +'/story/'+ App.router.item_id );
			} else if ( App.router.slide_id ) {
				App.router.navigate('playlist/'+ App.router.collection_id +'/remix/'+ App.router.item_id +'/slide/'+ App.router.slide_id );
			} else {
				App.router.navigate('playlist/'+ App.router.collection_id +'/remix/'+ App.router.item_id );
			}
		},

		startPlayerEvents : function() {
			if ( App.players.get('current') ) {
				App.players.get('current').project.on('frame_rendered', this.onFrameChange, this);
				App.players.get('current').project.on('media_timeupdate', this.onTimeUpdate, this);
				//auto advance
				App.players.get('current').project.on('playback_ended', this.playerNext, this);
			}
		},

		endPlayerEvents : function() {
			if(App.players.get('current')) {
				App.players.get('current').project.off('frame_rendered', this.onFrameChange, this);
				App.players.get('current').project.off('media_timeupdate', this.onTimeUpdate, this);
				App.players.get('current').project.off('playback_ended', this.playerNext, this);
			}
		},

		playerPrev : function() {
			App.players.get('current').project.cuePrev();
		},
		playerNext : function() {
			App.players.get('current').project.cueNext();
			if( _.isNull( App.players.get('current').project.getFrameData().next ) ) this.remixToggle();
		},
		playPause : function() {
			App.players.get('current').project.playPause();
			this.$('.play-pause').toggleClass('paused');
		},

		onPlay : function() {
			var _this = this;
			App.players.off('update_title', this.onFrameChange, this);
			this.startPlayerEvents();

			console.log('	++ frame data', App.players.get('current') )
			// needs a delay I guess
			_.delay(function(){
				App.BaseLayout.playlistView.onFrameChange( App.players.get('current').project.getFrameData() );
			},1000);
			_.delay(function(){
				_this.togglePlaylist();
			},5000);
		},

		onFrameChange : function( info ) {

			if ( info ) {
				
				//check if necessary to fetch master playlist collection
				if ( _.isUndefined( App.playlistCollection ) ) {
					var _this=this;
					App.playlistCollection = new Map.PlaylistCollection();
					App.playlistCollection.fetch({success:function(collection,response){
						App.playlistCollection.createKeys();
						_this.updateRelatedPlaylists(info);
					}});
				} else {
					this.updateRelatedPlaylists(info);
				}

				App.players.trigger('frame_updated', info);
				this.updateURL();
				this.$('.playing-subtitle').text( info.layers[0].attr.title + ' by ' + info.layers[0].attr.media_creator_username );
				this.updateControlsState( info );
				this.updateShareLinks( info );
				this.updatePlaylistDropdown();
				this.scrollTitles();
			}
		},
		updateRelatedPlaylists: function(info){

			$('#related-playlists').empty();
			var playlists=App.playlistCollection.getMatches(info.layers[0].attr.tags);
			if( playlists.length>0){
				_.each(playlists,function(playlist){
					if(playlist.id!=App.players.get('current').id) $('#related-playlists').append('<li><a href="#playlist/'+playlist.id+'">'+playlist.get('title')+'</a></li>');
				});
			}
			if( playlists.length<4){
				$('#related-playlists').append('<li><a href="#playlist/'+Map.recentCollectionId+'">Recently Contributed</a></li>');
			}

		},

		updateControlsState : function( info ) {
			// updates the visual status of the the prev / next buttons on the controller
			var next = this.$('.transport .forward'),
				prev = this.$('.transport .back');

			if ( info._next ) {
				if(next.hasClass('disabled')) next.removeClass('disabled');
			} else if( !next.hasClass('disabled')) {
				next.addClass('disabled');
			}

			if ( info._prev ) {
				if(prev.hasClass('disabled')) {
					prev.removeClass('disabled');
				}
			} else if( !prev.hasClass('disabled')) {
				prev.addClass('disabled');
			}
			if (App.players.get('current').project.get('div_id') == 'player-remix') {
				$('.remix-toggle').addClass('remix');
			} else {
				$('.remix-toggle').removeClass('remix');
			}
		},

		updatePlaylistDropdown : function() {

			this.$('.playlist-container .playlist').empty();
			_.each( App.players.get('current').project.getProjectData().frames, function(frame){

				var isActive = frame.id == App.players.get('current').project.getFrameData().id;
				var LIView = new PlaylistItemView({
					model: new Backbone.Model( _.extend(frame, {is_active:isActive? 'pause':''}) ),
					attributes : { 'class': isActive? 'active':'' }
				});
				this.$('.playlist-container .playlist').append( LIView.el );
				LIView.render();
			});

			//Map Update
			if(!_.isUndefined(this.playlistMap)) this.playlistMap.updateMap();
		},

		onTimeUpdate : function( info )
		{
			this.$('.progress-bar .elapsed').css( 'width', (info.current_time/info.duration *100) +'%' );
			this.$('.time-elapsed').text( Helper.convertTime(info.current_time) );
			this.$('.time-duration').text( Helper.convertTime(info.duration) );
		},

		clearElapsed : function()
		{
			this.$('.progress-bar .elapsed').css( 'width', '0' );
		},

		scrollTitles : function() {
			var areaWidth = this.$('.now-playing').width();

			this.$('.scroll-view').each( function(i,v) {
				var textElem = $(this),
					textWidth = textElem.children('span').width();

				if (textWidth > areaWidth) {
					sideScroll();
				}

				function sideScroll() {
					if (textElem.css('left') == '0px') {
						$(textElem).animate({
							left: areaWidth - textWidth
						}, 7000, sideScroll);
					} else {
						$(textElem).animate({
							left: 0
						}, 7000, sideScroll);
					}
				}

			});
		},

		updateShareLinks: function(info) {
			var encodedUrl = encodeURIComponent(window.location),
				encodedTitle = encodeURIComponent(info.layers[0].attr.title + ' by ' + info.layers[0].attr.media_creator_username),
				encodedTweet = encodeURIComponent('Play this track on Austin Music Map: ' + info.layers[0].attr.title + ' by ' + info.layers[0].attr.media_creator_username + ' - ' + window.location),
				encodedMessage = encodeURIComponent('Play this track on Austin Music Map:\n' + info.layers[0].attr.title + ' by ' + info.layers[0].attr.media_creator_username + '\n' + window.location),
				thumbUrl = this.model.collectionModel.get('thumbnail_url'),
				encodedThumb = encodeURIComponent(thumbUrl ? thumbUrl : 'http://www.austinmusicmap.com/assets/img/amm_logo.png');

			this.$('.share-facebook').attr('href','http://www.facebook.com/sharer.php?s=100&p[title]=' + encodedTitle + '&p[url]=' + encodedUrl + '&p[images][0]=' + encodedThumb + '&p[summary]=Play%20this%20track%20on%20Austin%20Music%20Map!');
			this.$('.share-twitter').attr('href','http://twitter.com/home?status=' + encodedTweet);
			this.$('.share-email').attr('href','mailto:?subject=Play%20' + encodedTitle + '%20on%20Austin%20Music%20Map!&Body=' + encodedMessage);
		}
	});

	var PlaylistItemView = Backbone.LayoutView.extend({
		tagName : 'li',
		template : 'playlist-item',
		serialize : function(){ return this.model.toJSON(); },

		events : {
			'click' : 'onClickPlaylistItem',
			'mouseenter' : 'scrollTitle',
			'mouseleave' : 'stopScrollTitle'
		},

		onClickPlaylistItem: function() {
			App.players.get('current').project.cueFrame( this.model.id );
			return false;
		},
		runScrollTitle : false,
		scrollTitle: function(e) {

			var areaWidth = this.$('.media-name-wrapper').width(),
				textElem = this.$('.media-name'),
				textWidth = this.$('.media-name span').width();

			this.runScrollTitle = true;

			if (textWidth > areaWidth) {
				sideScroll();
			}

			function sideScroll() {
			
				if (textElem.css('left') == '0px') {
					$(textElem).animate({
						left: areaWidth - textWidth
					}, 7000, sideScroll);
				} else {
					$(textElem).animate({
						left: 0
					}, 7000, function() {
						if (this.runScrollTitle === true) { sideScroll(); }
					});
				}

			}
		},

		stopScrollTitle: function() {
			this.runScrollTitle = false;
			$('.media-name').stop().animate({'left':0}, 1000);
		}
	});

	// Required, return the module for AMD compliance
	return Playlist;
});
