/**
 * Created by little_vege on 2014/12/7.
 */

var AlbumView = Backbone.View.extend({
    $el:$('<div class="album"></div>'),
    initialize:function(album) {
        this.model = album;
        this.render();
    },
    render:function() {
        this.$el.html(this.template(this.model.attributes))
    },
    template: _.template(
        '<img class="cover">' +
        '<div class="abstract">' +
            '<h4><%= name %></h4>' +
            '<p><%= artist %></p>' +
        '</div>'
    )

});