/**
 * Created by little_vege on 2014/12/7.
 */

var Muse = Backbone.Model.extend({
    defaults:{
        playlist:null,
        current:0,
        unload:0
    },
    initialize:function() {
        this.artists = new ArtistList();
        this.albums = new AlbumList();
        this.$audio = $('#audio');
        (function(muse){
            muse.$audio.on('ended',function(e) {
                muse.playNext();
            });
        })(this);
        this.on('change:playlist',function() {
            this.set('current',0);
        });
    },
    addSong:function(file) {
        if (/(mp3)|(ogg)/ig.test(file.type)) {
            var song = new Song({file:file});
            song.readTags(function(tags) {
                var id3 = song.get('tags');
                var artist = this.artists.upset(id3.artist);
                var album = this.albums.upset(id3.album);
                album.addSong(song);
                artist.addSong(song);
                artist.addAlbum(album);
                var loaded = this.get('unload');
                this.set('unload',--loaded);
            },this);
        }
    },
    loadSongs:function(files) {
        var fileLen = files.length;
        this.set('unload',fileLen);
        _.each(files,function(file,index) {
            this.addSong(file);
        },this);
    },
    play:function(index) {
        var playlist = this.get('playlist');
        if (!playlist) {
            return;
        }
        if (playlist.length<=index) {
            this.$audio[0].pause();
            this.set('current',this.playlist.length-1);
            return;
        } else if (index<0) {
            this.$audio[0].pause();
            this.set('current',0);
            return;
        }

        var song = playlist.at(index);
        this.$audio[0].src = song.get('path');
        this.$audio[0].play();
        this.set('current',index);
    },
    playNext:function() {
        var index = this.get('current');
        index++;
        this.play(index);
    },
    playPrev:function() {
        var index = this.get('current');
        index--;
        this.play(index);
    },
    toggle:function() {

    }
});

var MuseLoaderView = Backbone.View.extend({
    el:$('#infoPop')[0],
    initialize:function() {
        muse.on('change:unload',function() {
            var unloadCnt;
            unloadCnt = muse.get('unload');
            if (this.$el.is(':hidden')&&unloadCnt>0) {
                this.$el.show();
                $('#backdrop').show();
            }
            if (unloadCnt<1) {
                this.$el.hide();
                $('#backdrop').hide();
            }
            this.$el.html('<p>have '+unloadCnt+' need load</p>');
        },this);
    }
});

var ImgSet = [];