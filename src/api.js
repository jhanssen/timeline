/*global timeline,PIXI*/

function TimelineItem(start, stop, thread, name, descr)
{
    this._start = start;
    this._stop = stop;
    this._thread = thread;
    this._name = name;
    this._descr = descr;
}

TimelineItem.prototype = {
    get start() { return this._start; },
    get stop() { return this._stop; },
    get thread() { return this._thread; },
    get name() { return this._name; },
    get descr() { return this._descr; }
};

timeline.api = {
    _items: {},
    _time: 0,
    _scale: 100,
    _width: 800,
    _height: 600,
    _renderer: undefined,

    setup: function setup(width, height) {
        this._renderer = PIXI.autoDetectRenderer(width, height);
        this._renderer.autoResize = true;
        var parent = document.getElementById("timeline");
        parent.appendChild(this._renderer.view);
        var stage = new PIXI.Container();

        var ellipse = new PIXI.Graphics();
        ellipse.beginFill(0xFFFF00);
        ellipse.drawRect(0, 0, 50, 20);
        ellipse.endFill();
        ellipse.x = 180;
        ellipse.y = 130;
        stage.addChild(ellipse);

        this._renderer.render(stage);
    },
    add: function add(item) {
        this._items[item.thread] = item;
    },
    setTime: function setTime(time) {
    },
    setScale: function setScale(ms) {
    },
    buildScene: function buildScene() {

    }
};
