/*global remotery,WebSocket,DataViewReader,$*/

DataViewReader = (function () {
    function DataViewReader(data_view, offset)
    {
        this.DataView = data_view;
        this.Offset = offset;
    };

    DataViewReader.prototype.GetUInt32 = function()
    {
        var v = this.DataView.getUint32(this.Offset, true);
        this.Offset += 4;
        return v;
    };

    DataViewReader.prototype.GetUInt64 = function()
    {
        var v = this.DataView.getFloat64(this.Offset, true);
        this.Offset += 8;
        return v;
    };

    DataViewReader.prototype.GetStringOfLength = function(string_length)
    {
        var string = "";
        for (var i = 0; i < string_length; i++)
        {
            string += String.fromCharCode(this.DataView.getInt8(this.Offset));
            ++this.Offset;
        }

        return string;
    };

    DataViewReader.prototype.GetString = function()
    {
        var string_length = this.GetUInt32();
        return this.GetStringOfLength(string_length);
    };

    return DataViewReader;
})();

remotery._decodeSample = function _decodeSample(reader)
{
    var sample = {};
    sample.name_hash = reader.GetUInt32();
    sample.name = this._names[sample.name_hash];
    if (sample.name === undefined) {
        // console.log("asking", sample.name_hash);
        this._ws.send("GSMP" + sample.name_hash);
        this._names[sample.name_hash] = sample.name_hash;
        sample.name = sample.name_hash + "";
    }

    sample.id = reader.GetUInt32();
    sample.color = reader.GetStringOfLength(7);
    sample.us_start = reader.GetUInt64();
    sample.us_length = reader.GetUInt64();

    sample.children = [];
    this._decodeSampleArray(reader, sample.children);
    return sample;
};

remotery._decodeSampleArray = function _decodeSampleArray(reader, samples)
{
    var num = reader.GetUInt32();
    for (var i = 0; i < num; ++i) {
        samples.push(this._decodeSample(reader));
    }
};

remotery.start = function start(ip) {
    this._names = Object.create(null);
    this._ws = new WebSocket(`ws://${ip}:17815/rmt`);
    this._ws.binaryType = "arraybuffer";
    this._ws.onmessage = (e) => {
        //console.log("got msg");
        var view = new DataView(e.data), reader;
        var id = String.fromCharCode(
            view.getInt8(0),
            view.getInt8(1),
            view.getInt8(2),
            view.getInt8(3)
        );
        var digest, name, thread, samples, msg;
        switch (id) {
        case "LOGM":
            reader = new DataViewReader(view, 4);
            msg = reader.GetString();
            //console.log(msg);
            break;
        case "SSMP":
            reader = new DataViewReader(view, 4);
            digest = reader.GetUInt32();
            name = reader.GetString();
            //console.log("SSMP", digest, name);
            this._names[digest] = name;
            break;
        case "SMPL":
            reader = new DataViewReader(view, 8);
            thread = reader.GetString();
            samples = reader.GetUInt32();
            digest = reader.GetUInt32();
            // console.log("thread", reader.GetString());
            // console.log("samples", reader.GetUInt32());
            // console.log("digest", reader.GetUInt32());
            // if (!(digest in this._digests)) {
            //     // ask the server
            //     console.log("asking", digest);
            //     this._ws.send("GSMP" + digest);
            //     this._digests[digest] = digest;
            // }
            var sample = this._decodeSample(reader);
            this._callOns("sample", [thread, sample]);
            break;
        default:
            console.error("unknown message type", id);
            break;
        }
    };
    this._ws.onclose = (e) => {
        console.log("closed");
    };
    this._ws.onerror = (e) => {
        console.error(e);
    };
};

remotery._callOns = function _callOns(type, args)
{
    var ons = this._ons[type];
    for (var i = 0; i < ons.length; ++i)
        ons[i].apply(this, args);
};

remotery.on = function on(type, cb)
{
    if (!(type in this._ons))
        return;
    this._ons[type].push(cb);
};

(function() {
    remotery._ons = { sample: [] };
})();
