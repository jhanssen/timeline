/*global require,PIXI,timeline*/

function start()
{
    console.log("starting", PIXI);
    timeline.api.setup(1280, 720);
}

timeline = {};

require(['config'], function() {
    require(['pixi','api'], function() {
        start();
    });
});
