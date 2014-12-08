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
        this.model = album;
        this.render();
        this.model.on('change',function(){
            this.render();
        },this);
    },
    render:function() {
        var artistName;
        var artist = this.model.get('artist');
        var albumName = this.model.get('name');
        if (albumName.length>20) {
            albumName = albumName.substr(0,8)+'...'+albumName.substr(albumName.length-9,9);
        }
        artist? artistName = artist.get('name'):artistName="anonymous";
        this.$el.html(this.template({
            name:albumName,
            artist:artistName,
            fullName:this.model.get('name'),
            img:ImgSet[this.model.get('imgIndex')]
        }));
        $(window).trigger('resize');
    },
    template: _.template (
        '<img class="cover" title="<%= fullName %>" alt="<%= fullName %>" src="<%= img %>">' +
        '<div class="abstract">' +
            '<h4><%= name %></h4>' +
            '<p><%= artist %></p>' +
        '</div>'
    ),
    clickAlbum:function() {
        var $audio = $('#audio');
        muse.set('playlist',this.model.musicList);
        muse.play(0);
    }
});


var AlbumListView = Backbone.View.extend({
    el:$('#main')[0],
    /**
     * @param model collection of albums;
     */
    initialize:function(model) {
        this.model = model;
        model.on('add',function(album) {
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


var PlayListView = Backbone.View.extend({
    el:$('#playlist')[0],
    initialize:function(playlist) {
        this.playlist = playlist;

    },
    render:function() {
        var list = this.$el.find('.list');
        this.playlist.each(function(song,index) {

        });
    },
    setImg:function(imgIndex) {
        this.$el.find('img').attr('src',ImgSet[imgIndex]);
    }
});

var PlayListSongView = Backbone.View.extend({
    tagName:'li',
    initialize:function(song) {
        this.song = song;
    },
    render:function() {
        var index = this.song.get('index');
        var title = this.song.get('title');
        var time = this.song.get('time');
        var active = this.song.get('active');
        this.template({
            index:index,
            title:title,
            time:time
        });
        if (active) {
            this.$el.addClass('active');
        }
    },
    template: _.template(
        '<a>' +
            '<span class="index"><%=index%></span>' +
            '<%=title%>' +
            '<span class="time"><%=time%></span>' +
        '</a>'
    ),
    destroy:function() {
        this.$el.remove();
        this.song.view = null;
    }
});