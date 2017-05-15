const bufferFiles = kitty._bufferFiles;
const stream = require('stream');
const Compile = require('./compile.js');

class Transform extends stream.Transform{
    constructor(needCreateDest){
        super({objectMode: true, highWaterMark:16});
        this.needCreateDest = needCreateDest;
    }
}

Transform.prototype._transform = function(file,encoding,callback){
    var compiler = new Compile(file);
    compiler.data.needCreateDest = this.needCreateDest;
    compiler.init();
    this.push(file);
    callback();
};

Transform.prototype._flush = function(callback){
    callback();
};


module.exports = Transform;