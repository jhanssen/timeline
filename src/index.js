/*global require,PIXI,timeline,remotery,setTimeout,scrollbar,$*/

function getScrollBarHeight()
{
    var outer = $('<div>').css({visibility: 'hidden', height: 100, overflow: 'scroll'}).appendTo('body');
    var heightWithScroll = $('<div>').css({height: '100%'}).appendTo(outer).outerHeight();
    outer.remove();
    return 100 - heightWithScroll;
};

var ws;

scrollbar = {
    init: (api) => {
        this._api = api;
        this._timer = undefined;
        this._current = 2000;
        this._scrollBarHeight = getScrollBarHeight();

        var scrollBarHeight = getScrollBarHeight() + 1;
        this._scroll = document.getElementById("scroller");
        this._scroll.setAttribute("style",`overflow:auto;height:${scrollBarHeight}px;width:${api.width}px`);
        this._scrollInner = document.getElementById("scroller-inner");
        this._scrollInner.setAttribute("style",`overflow:auto;height:${scrollBarHeight}px;width:0px`);

        // scroll.setAttribute("style",`overflow:auto;height:${scrollBarHeight}px;width:${timeline.api.width}px`);
        // var
        // var scrollBarEnd = timeline.api.end / timeline.api.scale;
        // scrollInner.setAttribute("style",`overflow:auto;height:${scrollBarHeight}px;width:${scrollBarEnd}px`);

        this._scroll.addEventListener('scroll', (e) => {
            timeline.api.setTime(e.target.scrollLeft * this._api.scale);
            timeline.api.build();
        });

    },
    update: () => {
        if (this._timer === undefined) {
            this._timer = setTimeout(() => {
                //console.log(`setting api width ${Math.round(this._api.end)}`);
                var end = Math.round(this._api.end / this._api.scale);
                this._scrollInner.style.width = `${end}px`;
                this._timer = undefined;
            }, 500);
        }
    }
};

function start()
{
    console.log("starting", PIXI);
    timeline.api.setup(1280, 720);

    // var item = new timeline.Item(100, 200, "thread 1", "some name", "some description");
    // timeline.api.add(item);

    // var item1 = new timeline.Item(150, 250, "thread 1", "some name", "some description");
    // timeline.api.add(item1);

    // var item11 = new timeline.Item(240, 350, "thread 1", "some name", "some description");
    // timeline.api.add(item11);

    // var item2 = new timeline.Item(1700, 1990, "thread 1", "some name", "some description");
    // timeline.api.add(item2);

    // var item3 = new timeline.Item(170, 270, "thread 2", "some name", "some description");
    // timeline.api.add(item3);

    // var item4 = new timeline.Item(300, 2000, "thread 2", "some name", "some description");
    // timeline.api.add(item4);

    timeline.api.setScale(1);
    // timeline.api.build();

    //ws = new WebSocket("ws://127.0.0.1:17815/rmt");

    scrollbar.init(timeline.api);

    var num = 0;
    remotery.on("sample", (thread, sample) => {
        //console.log("thread", thread);
        //console.log(sample);
        var item = new timeline.Item(sample.us_start / 1000, (sample.us_start + sample.us_length) / 1000, thread, sample.name, "");
        timeline.api.add(item);

        scrollbar.update();

        //console.log(sample.us_start, sample.us_start + sample.us_length);

        if (timeline.api.inview(item))
            timeline.api.build();
        ++num;
    });
    remotery.start("127.0.0.1");
}

timeline = {};
remotery = {};

require(['config'], () => {
    require(['jquery'], () => {
        require(['pixi','api','remotery'], start);
    });
});
