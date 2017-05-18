const stream = require('stream');
const Compile = require('./compile.js');

class Transform extends stream.Transform{
    constructor(needCreateDest,kitty){
        super({objectMode: true, highWaterMark:16});
        this.needCreateDest = needCreateDest;
        this.kitty = kitty;
    }
}

Transform.prototype._transform = function(file,encoding,callback){
    var compiler = new Compile(file,this.kitty);
    compiler.data.needCreateDest = this.needCreateDest;
    compiler.init();
    this.push(file);
    callback();
};

Transform.prototype._flush = function(callback){
    callback();
};


module.exports = Transform;