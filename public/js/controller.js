/**
 * Created by little_vege on 2014/12/7.
 */

var Muse = Backbone.Model.extend({
    initialize:function() {
        this.artists = new ArtistList();
        this.albums = new AlbumList();
        this.set('loadComplete',false);
    },
    addSong:function(file) {
        if (/(mp3)|(ogg)/ig.test(file.type)) {
            var song = new Song({file:file});
            song.readTags(function(tags) {
                var id3 = song.get('tags');
                var artist = this.artists.findOrAdd(id3.artist);
                var album = this.albums.findOrAdd(id3.album);
                album.add(song);
                artist.addSong(song);
                artist.addAlbum(album);
            },this);
        }
    }
});