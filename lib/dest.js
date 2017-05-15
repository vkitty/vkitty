const bufferFiles = kitty._bufferFiles;
const stream = require('stream');
const vfs = require('vinyl-fs');
const Util = require('./util.js');
const path = require('path');

function Dest(file) {
    var readStream =Dest._readStream(file);
    Dest._doStream(readStream,file.isCdn);
}


Dest.compiler = function(compiler){
    var data = compiler.data;
    if (data.needCreateDest) {
        var vinyl = data.vinyl;
        vinyl.contents = Buffer.from(data.compileContent);
        var readStream = Dest._readStream(vinyl);
        Dest._doStream(readStream,vinyl.isCdn);
    }
};

/**
 * stream是处理
 * @param newStream
 * @param isNoDest
 * @private
 */
Dest._doStream = function(newStream,isCdn){
    kitty._streams.forEach((stream)=> {
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
};


Dest._readStream = function (file) {
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
};


module.exports = Dest;