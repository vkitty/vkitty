const stream = require('stream');
const vfs = require('vinyl-fs');
const Util = require('./util.js');
const path = require('path');

var Dest = {
    cdn:function(vinyl,depend){
        this.streams = depend.compiler.kitty.streams;
        var readStream =this._readStream(vinyl);
        this._doStream(readStream,vinyl.isCdn);
    },
    /**
     * dest compiler
     * @param compiler
     */
    compiler:function(compiler){
        this.streams = compiler.kitty.streams;
        var data = compiler.data;
        if (data.needCreateDest) {
            var vinyl = data.vinyl;
            vinyl.contents = Buffer.from(data.compileContent);
            var readStream = this._readStream(vinyl);
            this._doStream(readStream,vinyl.isCdn);
        }
    },
    /**
     * stream是处理
     * @param newStream
     * @param isNoDest
     * @private
     */
    _doStream:function(newStream,isCdn){
        this.streams.forEach((stream)=> {
            stream = Util.cloneStream(stream);
            if(isCdn && stream.isDest){
                return;
            }
            if(!isCdn && stream.isCdnDest){
                return;
            }
            newStream = newStream.pipe(stream,{end:false});
        });
        return newStream;
    },

    _readStream:function (file) {
        class Reader extends stream.Readable {
            constructor() {
                super({objectMode: true, highWaterMark: 16});
            }
        }
        //重写 从stream.Readable继承的_read
        Reader.prototype._read = function () {
            this.push(file);
            this.push(null);
        };

        return new Reader();
    }
};

module.exports = Dest;