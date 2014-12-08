/**
 * Created by little_vege on 2014/12/7.
 */

var Song = Backbone.Model.extend({
    defaults:{
        path:"undefined",
        title:"no title"
    },
    initialize:function() {
        var file = this.get('file');
        this.set('path',getObjectUrl(file));
    },
    readTags:function(callback,context) {
        if (!context) {
            context = this;
        }
        (function(song) {
            id3(song.get('file'), function(err,tags) {
                song.set('title',tags.title);
                song.set('tags',tags);
                callback.call(context,tags);
            });
        })(this);
    }
});

var Album = Backbone.Model.extend({
    initialize:function() {
        this.musicList = new MusicList();
    },
    addSong:function(music) {
        this.musicList.add(music);
        music.set('album',this);
    }
});

var Artist = Backbone.Model.extend({
    initialize:function() {
        this.musicList = new MusicList();
        this.albums = new AlbumList();
    },
    addSong:function(music) {
        this.musicList.add(music);
        music.set('artist',this);
    },
    addAlbum:function(album) {
        this.albums.add(album);
        album.set('artist',this);
    }
});

var MusicList = Backbone.Collection.extend({
    model:Song
});

var PlayList = Backbone.Collection.extend({
    _currentMusic:null,
    next:function() {

    },
    prev:function() {

    },
    current:function(idx) {
        if (!this._currentMusic) {
            this._currentMusic = this.get(0);
        }
    }
});

var getObjectUrl = function(file) {
    var objUrl;
    if (window.URL) {
        if (window.URL.createObjectURL) {
            objUrl = window.URL.createObjectURL(file);
        } else if (window.URL.createBlobURL) {
            objUrl = window.URL.createBlobURL(file);
        }
    } else if (window.webkitURL) {
        if (window.WebkitURL.createObjectURL) {
            objUrl = window.WebkitURL.createObjectURL(file);
        }
    }
    return objUrl;
};

var ArtistList = Backbone.Collection.extend({
    model:Artist,
    upset:function(name) {
        var artist;
        if (!name) {
            name = 'anonymous';
        }
        artist = this.find(function(album) {
            return album.get('name') === name;
        });
        if (!artist) {
            artist = new Artist({name:name});
            this.add(artist);
        }
        return artist;
    }
});
var AlbumList = Backbone.Collection.extend({
    model:Album,
    upset:function(name) {
        var album;
        if (!name) {
            name = 'anonymous';
        }
        album = this.find(function(album) {
            return album.get('name') === name;
        });
        if (!album) {
            album = new Album({name:name});
            this.add(album);
        }
        return album;
    }
});