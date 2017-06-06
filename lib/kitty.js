global.Gkitty={};
const path = require('path');
const config = require('./config.js');
Gkitty.config = config;
const loaders = require('./loaders/loader.js');
Gkitty.loaders = loaders;
const vfs = require('vinyl-fs');
const Pipe = require('./pipe.js');
const Util = require('./util.js');
const Queue = require('./queue.js');
const watch = require('gulp-watch');
const map = require('map-stream');
const Compile = require('./compile.js');


function Kitty(){
    this.bufferFiles={};
    this.streams = [];
    this.queue = new Queue(this);
}

Kitty.prototype._getMapFun = function(needCreateDest){
    return (file,callback)=>{
        var compiler = new Compile(file,this);
        compiler.data.needCreateDest = needCreateDest;
        compiler.init();
        callback(null,file)
    }
};

Kitty.prototype.src = function(globs,options){
    this.options = options;
    this.canWatch=false;
    var stream = vfs.src(globs,options);
    var mapFun = this._getMapFun(true);
    stream.pipe(map(mapFun));
    var result = {
        pipe:(stream)=>{
            Pipe.pipe(stream,this.streams);
            return result;
        }
    };
    return result;
};

Kitty.prototype._src = function(globs,options,errBack){
    var stream = vfs.src(globs,options);
    var mapFun = this._getMapFun(false);
    var result = stream.pipe(map(mapFun));
    errBack && stream.on('error',function(err){
        errBack(err);
    });
    return result;
};

Kitty.prototype.dest = function(folder,options){
    var stream = vfs.dest(folder,options);
    stream.isDest = true;
    this._rewriteStreamTransform(stream,folder);
    return stream;
};


Kitty.prototype.cdnDest = function(folder="./build/static",options){
    var stream = vfs.dest(folder,options);
    stream.isCdnDest=true;
    this._rewriteStreamTransform(stream,folder);
    return stream;
};

Kitty.prototype._rewriteStreamTransform = function(stream,folder){
    var oldTransform = stream._transform;
    stream._transform = function(file,encoding,callback){
        var newCallback = function(){
            var destPath  = path.resolve(config.baseDir,folder,file.relative);
            Util.console.success(destPath);
            callback.apply(null,arguments);
        };
        oldTransform(file,encoding,newCallback);
    };
};


Kitty.prototype.watch = function(globs,options){
    this.options = options;
    this.canWatch=true;
    this._watch(globs,options);

    var stream = vfs.src(globs,options);
    var mapFun = this._getMapFun(true);
    stream.pipe(map(mapFun));

    var result = {
        pipe:(stream)=>{
            Pipe.pipe(stream,this.streams);
            return result;
        }
    };
    return result;
};

Kitty.prototype._watch = function(globs,options){
    watch(globs,options,(vinyl)=>{
        var filename = vinyl.path;
        if(!this.bufferFiles[filename]){
            var compiler = new Compile(vinyl,this);
            compiler.data.needCreateDest = true;
            compiler.init();
        }
    });
};

Kitty.prototype.appendCompiler = function(compiler){
    var filename = compiler.filename;
    this.bufferFiles[filename] = compiler;
    this.queue.add(filename);
    this.queue.start();
};

module.exports = Kitty;
