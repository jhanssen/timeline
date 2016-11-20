/*global require,PIXI,timeline,setTimeout,$*/

function getScrollBarHeight()
{
    var outer = $('<div>').css({visibility: 'hidden', height: 100, overflow: 'scroll'}).appendTo('body');
    var heightWithScroll = $('<div>').css({height: '100%'}).appendTo(outer).outerHeight();
    outer.remove();
    return 100 - heightWithScroll;
};

function start()
{
    console.log("starting", PIXI);
    timeline.api.setup(1280, 720);

    var item = new timeline.Item(100, 200, "thread 1", "some name", "some description");
    timeline.api.add(item);

    var item1 = new timeline.Item(150, 250, "thread 1", "some name", "some description");
    timeline.api.add(item1);

    var item2 = new timeline.Item(1700, 1990, "thread 1", "some name", "some description");
    timeline.api.add(item2);

    var item3 = new timeline.Item(170, 270, "thread 2", "some name", "some description");
    timeline.api.add(item3);

    var item4 = new timeline.Item(300, 2000, "thread 2", "some name", "some description");
    timeline.api.add(item4);

    timeline.api.setScale(1);
    timeline.api.build();

    var scrollBarHeight = getScrollBarHeight();
    var scroll = document.getElementById("scroller");
    scroll.setAttribute("style",`overflow:auto;height:${scrollBarHeight}px;width:${timeline.api.width}px`);
    var scrollInner = document.getElementById("scroller-inner");
    var scrollBarEnd = timeline.api.end / timeline.api.scale;
    scrollInner.setAttribute("style",`overflow:auto;height:${scrollBarHeight}px;width:${scrollBarEnd}px`);
    scroll.addEventListener('scroll', (e) => {
        timeline.api.setTime(e.target.scrollLeft * timeline.api.scale);
    });
}

timeline = {};

require(['config'], () => {
    require(['jquery'], () => {
        require(['pixi','api'], start);
    });
});
