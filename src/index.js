/*global require*/

console.log("hello");

function start()
{
    console.log("starting");
}

require(['config'], function() {
    console.log("config loaded");

    require(['pixi'], function() {
        start();
    });
});
