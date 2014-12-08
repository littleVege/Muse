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
        },this)
    },
    render:function() {
        var artistName;
        var artist = this.model.get('artist');
        var albumName = this.model.get('name');
        artist? artistName = artist.get('name'):artistName="";
        this.$el.html(this.template({
            name:albumName,
            artist:artistName
        }));
    },
    template: _.template (
        '<img class="cover">' +
        '<div class="abstract">' +
            '<h4><%= name %></h4>' +
            '<p><%= artist %></p>' +
        '</div>'
    ),
    clickAlbum:function() {
        var $audio = $('#audio');
        var first = this.model.musicList.at(0);
        $audio.attr('src',first.get('path'));
        $audio[0].play();
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