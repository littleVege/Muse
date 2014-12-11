/**
 * Created by little_vege on 2014/12/7.
 */

var Song = Backbone.Model.extend({
    defaults:{
        path:"undefined",
        title:"no title",
        tagLoaded:false
    },
    initialize:function(attrs) {
        var file = this.get('file');
        this.set('path',getObjectUrl(file));
        localStorage[file.name] = this.get('path');
    },
    readTags:function(callback,context) {
        if (!context) {
            context = this;
        }
        (function(song) {
            var file = song.get('file');
            var url = file.urn||file.name;
            var reader = FileAPIReader(file);
            ID3.loadTags(url, function() {
                var tags = ID3.getAllTags(url);
                song.set('title',tags.title);
                song.set('tags',{
                    album:tags.album,
                    artist:tags.artist,
                    year:tags.year
                });
                if( "picture" in tags ) {
                    var image = tags.picture;
                    var img = "data:" + image.format + ";base64," + window.btoa(base64Str(image.data));
                    var imgIdx = null;
                    for (var i=0;i<ImgSet.length;i++) {
                        if (ImgSet[i]===img) {
                            imgIdx = i;
                            break;
                        }
                    }
                    if (imgIdx===null) {
                        ImgSet.push(img);
                        imgIdx = ImgSet.length-1;
                    }
                    song.set('imgIndex',imgIdx);
                }
                song.set('tagLoaded',true);
                callback.call(context,tags);
                song.unset('file');
            },{
                tags: ["artist", "title", "album", "year", "picture"],
                dataReader:reader
            });
        })(this);
    }
});

function base64Str(source) {
    var base64String = "",
        idx,len;
    for (idx=0,len = source.length; idx<len; idx++) {
        base64String += String.fromCharCode(source[idx]);
    }
    return base64String;
}

var Album = Backbone.Model.extend({
    initialize:function() {
        this.musicList = new MusicList();
        this.musicList.once('add',function() {
            var imgIndex = this.musicList.at(0).get('imgIndex');
            this.set('imgIndex',imgIndex);
        },this);
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

