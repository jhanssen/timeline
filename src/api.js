/*global timeline,performance,PIXI*/

timeline.Item = function Item(start, stop, thread, name, descr)
{
    this._start = start;
    this._stop = stop;
    this._thread = thread;
    this._name = name;
    this._descr = descr;
    this._added = undefined;
};

timeline.Item.prototype = {
    get start() { return this._start; },
    get stop() { return this._stop; },
    get thread() { return this._thread; },
    get name() { return this._name; },
    get descr() { return this._descr; },
    get added() { return this._added; }
};

timeline.api = {
    _items: {},
    _time: 0,
    _scale: 100,
    _width: undefined,
    _height: undefined,
    _renderer: undefined,
    _stage: undefined,
    _first: undefined,
    _last: undefined,

    get end() { return this._last - this._first; },
    get width() { return this._width; },
    get height() { return this._height; },
    get scale() { return this._scale; },

    setup: function setup(width, height) {
        this._renderer = PIXI.autoDetectRenderer(width, height);
        this._renderer.autoResize = true;
        var parent = document.getElementById("timeline");
        parent.appendChild(this._renderer.view);
        this._width = width;
        this._height = height;
    },
    add: function add(item) {
        // console.log("adding", item);
        if (item.thread in this._items)
            this._items[item.thread].push(item);
        else
            this._items[item.thread] = [item];
        if (this._first === undefined)
            this._first = item.start;
        if (this._last === undefined || item.stop > this._last)
            this._last = item.stop;
        //item._added = performance.now() - this._setup;
    },
    setTime: function setTime(time) {
        this._stage.x = -(time / this._scale);
        this._renderer.render(this._stage);
    },
    setScale: function setScale(ms) {
        this._scale = ms;
    },
    build: function build() {
        // build the items
        this._stage = new PIXI.Container();

        // each thread gets 'threadHeight' pixels height
        var threadHeight = 30;
        var threadPadding = 5;
        var y = 0;

        var findOverlapping = function(item, items) {
            for (var idx = 0; idx < items.length; ++idx) {
                var check = items[idx];
                if (Math.max(item.x, check.x) <= Math.min(item.x + item.width, check.x + check.width))
                    return check;
            }
            return null;
        };

        for (var thread in this._items) {
            //var mapping = Object.create(null);
            var threadContainer = new PIXI.Container();
            for (var idx = 0; idx < this._items[thread].length; ++idx) {
                var item = this._items[thread][idx];
                // our position on the canvas is (start - first) / scale
                var pitem = new PIXI.Graphics();
                pitem.beginFill(0xFFFF00);
                pitem.drawRect(0, 0,
                               Math.max((item.stop - item.start) / this._scale, 10), threadHeight);
                pitem.endFill();
                pitem.x = (item.start - this._first) / this._scale;
                pitem.y = y;

                pitem._timeline = [item];

                // console.log(item instanceof timeline.Item);
                // console.log(item);
                // console.log(item.start, this._first, this._scale);
                // console.log((item.start - this._first) / this._scale, y);

                // check if we overlap an existing item
                var overlaps = findOverlapping(pitem, threadContainer.children);
                if (overlaps) {
                    // we overlap, make a new item and remove the old
                    var x = Math.min(overlaps.x, pitem.x);
                    var x2 = Math.max(overlaps.x + overlaps.width, pitem.x + pitem.width);

                    pitem = new PIXI.Graphics();
                    pitem.beginFill(0xFFFF00);
                    pitem.drawRect(0, 0,
                                   Math.max(x2 - x, 10), threadHeight);
                    pitem.endFill();
                    pitem.x = x;
                    pitem.y = y;
                    pitem._timeline = overlaps._timeline;
                    pitem._timeline.push(item);

                    threadContainer.removeChild(overlaps);
                }

                threadContainer.addChild(pitem);
            }
            y += threadHeight + threadPadding;
            this._stage.addChild(threadContainer);
        }

        this._renderer.render(this._stage);
    }
};
