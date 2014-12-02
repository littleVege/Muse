/**
 * Created by LittleVege on 2014/12/2.
 */

define(['../lib/jquery/jquery-min','../lib/backbone/underscore-min'],function($) {

    var WaterFall = function($container,options) {
        this.options = {
            maxMargin:30
        };
        this.$container = $container;
        this.width = $container.width();

    };
    WaterFall.prototype = {
        repositionAll:function() {
            var containerWidth,items,itemWidth,firstItem,cols,actualMargin,lastWidth;
            containerWidth = this.$container.width();
            items = this.$container.children();
            if (items.length>0) {
                firstItem = items.eq(0);
                itemWidth = firstItem.width();
                cols = Math.floor(containerWidth /(itemWidth+this.options.maxMargin * 2));
                actualMargin = this.options.maxMargin;
                lastWidth = containerWidth % (itemWidth+this.options.maxMargin * 2);
                actualMargin += (lastWidth/cols/2);
                items.each(function(idx,item) {
                    var $item = $(item);
                    $item.css('margin',actualMargin+"px");
                });
            }

        }
    }
});