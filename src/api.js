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

function cropSprite(sprite, width, height)
{
    var texture = new PIXI.Texture(sprite.texture, new PIXI.Rectangle(0, 0, width, height));
    return new PIXI.Sprite(texture);
}

function ensureSize(sprite, width, height)
{
    if (sprite.width <= width && sprite.height <= height)
        return sprite;
    return cropSprite(sprite, Math.min(sprite.width, width), Math.min(sprite.height, height));
}

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
    _time: 0,

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
        this._time = time;
    },
    setScale: function setScale(ms) {
        this._scale = ms;
    },
    inview: function inview(item) {
        // our view is from x=this._time / this._scale to x+this._width
        var x = this._time;
        var x2 = x + (this._width * this._scale);
        // console.log("inview", x, x2, item.start, item.stop);
        return Math.max(x, item.start) <= Math.min(x2, item.stop);
    },
    build: function build() {
        var fontSize = 16;

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
                if (!this.inview(item))
                    continue;

                // our position on the canvas is (start - first) / scale
                var pitem = new PIXI.Graphics(), txt;
                pitem.beginFill(0xFFFF00);
                pitem.drawRect(0, 0,
                               Math.max((item.stop - item.start) / this._scale, 10), threadHeight);
                pitem.endFill();
                pitem.x = (item.start - this._first - this._time) / this._scale;
                pitem.y = y;

                pitem._timeline = [item];

                // check if we overlap an existing item
                var overlaps = findOverlapping(pitem, threadContainer.children);
                if (!overlaps) {
                    // add a text node
                    txt = new PIXI.Text(item.name, { fontSize: fontSize });
                    txt = ensureSize(txt, pitem.width, pitem.height);
                    txt.y = (pitem.height / 2) - (txt.height / 2);
                    pitem.addChild(txt);
                } else {
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

                    if (pitem._timeline.length == 2) {
                        txt = new PIXI.Text(overlaps._timeline[0].name + "+", { fontSize: fontSize });
                        txt = ensureSize(txt, pitem.width, pitem.height);
                        txt.y = (pitem.height / 2) - (txt.height / 2);
                        pitem.addChild(txt);
                    } else {
                        // we already added a '+'
                        pitem.addChild(overlaps.children[0]);
                    }

                    threadContainer.removeChild(overlaps);
                }

                pitem.mouseover = (e) => {
                    console.log("Mouseover", e);
                };
                pitem.mouseout = (e) => {
                    console.log("Mouseout", e);
                };
                pitem.interactive = true;

                threadContainer.addChild(pitem);
            }
            y += threadHeight + threadPadding;
            this._stage.addChild(threadContainer);
        }

        this._renderer.render(this._stage);
    }
};
