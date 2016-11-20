/*global require,PIXI,timeline,setTimeout*/

function start()
{
    console.log("starting", PIXI);
    timeline.api.setup(1280, 720);

    var item = new timeline.Item(100, 200, "thread 1", "some name", "some description");
    timeline.api.add(item);

    var item0 = new timeline.Item(1700, 1990, "thread 1", "some name", "some description");
    timeline.api.add(item0);

    var item2 = new timeline.Item(170, 270, "thread 2", "some name", "some description");
    timeline.api.add(item2);

    var item3 = new timeline.Item(300, 2000, "thread 2", "some name", "some description");
    timeline.api.add(item3);

    timeline.api.setScale(2);
    timeline.api.build();

    var scroll = document.getElementById("scroller");
    scroll.setAttribute("style","overflow:auto;height:15px;width:" + timeline.api.width + "px");
    var scrollInner = document.getElementById("scroller-inner");
    scrollInner.setAttribute("style","overflow:auto;height:15px;width:" + (timeline.api.end / timeline.api.scale) + "px");
    scroll.addEventListener('scroll', (e) => {
        timeline.api.setTime(e.target.scrollLeft * timeline.api.scale);
    });
}

timeline = {};

require(['config'], function() {
    require(['pixi','api'], function() {
        start();
    });
});
