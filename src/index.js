/*global require,PIXI,timeline,setTimeout*/

function start()
{
    console.log("starting", PIXI);
    timeline.api.setup(1280, 720);

    var item = new timeline.Item(100, 200, "thread 1", "some name", "some description");
    timeline.api.add(item);

    var item2 = new timeline.Item(170, 270, "thread 2", "some name", "some description");
    timeline.api.add(item2);

    timeline.api.setScale(4);
    timeline.api.build();

    setTimeout(() => {
        timeline.api.setTime(100);
    }, 1000);
    setTimeout(() => {
        timeline.api.setTime(timeline.api.end - (10 * timeline.api.scale));
    }, 2000);
    setTimeout(() => {
        timeline.api.setTime(0);
    }, 3000);
}

timeline = {};

require(['config'], function() {
    require(['pixi','api'], function() {
        start();
    });
});
