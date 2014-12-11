/**
 * Created by little_vege on 2014/12/7.
 */

var AlbumView = Backbone.View.extend({
    tagName:'div',
    className:'album',
    id:this.cid,
    events:{
        click:'clickAlbum'
    },
    initialize:function(album) {
        this.album = album;
        this.render();
        this.album.on('change',function(){
            this.render();
        },this);
    },
    render:function() {
        var artistName;
        var artist = this.album.get('artist');
        var albumName = this.album.get('name');
        artist? artistName = artist.get('name'):artistName="anonymous";
        this.$el.html(this.template({
            name:getShorterStr(albumName),
            artist:getShorterStr(artistName),
            fullName:albumName,
            img:ImgSet[this.album.get('imgIndex')]
        }));
        $(window).trigger('resize');
    },
    template: _.template (
        '<img class="cover" title="<%= fullName %>" src="<%= img %>">' +
        '<div class="abstract">' +
            '<h4><%= name %></h4>' +
            '<p><%= artist %></p>' +
        '</div>'
    ),
    clickAlbum:function() {
        var $audio = $('#audio');
        if (!this.album.musicList.view) {
            this.album.musicList.view = new PlaylistView(this.album.musicList);
        }
        muse.playlistModal.render(this.album.musicList);
        muse.playlistModal.show();
        muse.set('playlist',this.album.musicList);
    }
});

function getShorterStr(text) {
    if (!text) {
        return "";
    }
    var textLen = calStrLenght(text);
    if (textLen>20) {
        text = text.substr(0,8)+'...'+text.substr(textLen-9,9);
    }
    return text;
}

var AlbumListView = Backbone.View.extend({
    el:$('#main')[0],
    /**
     * @param albumList collection of albums;
     */
    initialize:function(albumList) {
        this.album = albumList;
        albumList.on('add',function(album) {
            var albumView = new AlbumView(album);
            album.view = albumView;
            this.$el.append(albumView.$el);
        },this);
        $(window).on('resize',this.lazyMargin(10));
    },
    lazyMargin:function(orginMargin) {
        var $container = this.$el;
        var margin = orginMargin;
        return function(e) {
            var containerWidth,items,itemWidth,
                firstItem,cols,actualMargin,lastWidth;
            containerWidth = $container.innerWidth();
            items = $container.children();
            if (items.length>0) {
                firstItem = items.eq(0);
                itemWidth = firstItem.width()+margin*2+2;
                cols = Math.floor(containerWidth /itemWidth);
                lastWidth = containerWidth - (itemWidth * cols);
                actualMargin = Math.floor(lastWidth / cols /2) + margin;
                items.each(function(idx,item) {
                    var $item = $(item);
                    $item.css('margin',actualMargin+"px");
                });
            }
            e.stopPropagation();
        }
    }
});


var PlaylistView = Backbone.View.extend({
    tagName:'ul',
    className:'playlist',
    initialize:function(playlist) {
        this.playlist = playlist;
        this.render(playlist);
        playlist.on('add',function(song) {
            this.renderSong(song);
        },this);
    },
    render:function(playlist) {
        var $el = this.$el;
        playlist.each(function(song,index) {
            this.renderSong(song);
        },this);
    },
    renderSong:function(song) {
        var songView = song.view;
        if (!songView) {
            songView = new PlaylistSongView(this,song);
            song.view = songView;
        }
        this.$el.append(song.view.$el);
    },
    setImg:function(imgIndex) {
        this.$el.find('img').attr('src',ImgSet[imgIndex]);
    }
});

var PlaylistSongView = Backbone.View.extend({
    tagName:'li',
    initialize:function(playlist,song) {
        this.playlist = playlist;
        this.song = song;
        this.playlist.on('sort',function() {
            this.render();
        },this);
        this.song.on('change:playing',function(song,playing) {
            this.changePlayingState(playing);
        },this);
        this.render();
    },
    render:function() {
        var index = this.song.get('index');
        var title = this.song.get('title');
        var duration = this.song.get('duration');
        if (!duration) {
            duration = getDuration(this.song.get('path'));
            this.song.set('duration',duration);
        }
        this.template ({
            index:index,
            title:title,
            duration:duration
        });
    },
    template: _.template (
        '<a>' +
            '<span class="index"><%=index%></span>' +
            '<%=title%>' +
            '<span class="duration"><%=duration%></span>' +
        '</a>'
    ),
    changePlayingState:function(playing) {
        if (playing) {
            this.$el.addClass('active');
        } else {
            this.$el.removeClass('active');
        }
    }
});

var PlayListModalView = Backbone.View.extend({
    el:$('#playlist')[0],
    $backdrop:$('#backdrop'),
    render:function(musicList) {
        if (!musicList.view) {
            musicList.view = new PlaylistView(musicList);
        }
        this.$el.find('.playlist').replaceWith(musicList.view.$el);
        (function(modalView) {
            modalView.$backdrop.on('click',function() {
                modalView.hide();
            });
        })(this);
        this.$backdrop.on('click',function() {

        },this);
    },
    show:function() {
        this.$el.show();
        this.$backdrop.show();
    },
    hide:function() {
        this.$el.hide();
        this.$backdrop.hide();
    }
});


var DisplayBarView = Backbone.View.extend({
    el:$('#displayBar')[0],
    initialize:function(muse) {
        this.controller = muse;
        muse.on('change:current',function(muse,index) {
            var song = this.controller.get('playlist').at(index);
            this.render(song);
        },this);
    },
    render:function(song) {
        var artistName,albumName,title,abstract;
        if (song) {
            artistName = song.get('artist').get('name');
            albumName = song.get('album').get('name');
            title = song.get('title');
            abstract = artistName+' -- '+albumName;
        } else {
            title = "";
            abstract = "";
        }
        this.$el.find('h2').html(title);
        this.$el.find('p').text(abstract);
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

function calStrLenght(str) {
    var realLength = 0, len = str.length, charCode = -1;
    for (var i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) realLength += 1;
        else realLength += 2;
    }
    return realLength;
}

function getDuration(path) {
    var audio = $('audio');
    audio[0].src = path;
    return audio.duration;
}