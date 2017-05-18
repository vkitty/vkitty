global.Gkitty={};
const path = require('path');
const config = require('./config.js');
Gkitty.config = config;
const loaders = require('./loaders/loader.js');
Gkitty.loaders = loaders;
const vfs = require('vinyl-fs');
const Pipe = require('./pipe.js');
const Util = require('./util.js');
const Transform = require('./transform.js');
const Queue = require('./Queue.js');

function Kitty(){
    this.bufferFiles={};
    this.streams = [];
    this.queue = new Queue(this);
}

Kitty.prototype.src = function(globs,options){
    this.options = options;
    config.watch=false;
    vfs.src(globs,options).pipe(new Transform(true,this));
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
    var result = stream.pipe(new Transform());
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
    config.watch=true;
    this._watch(globs,options);
    vfs.src(globs,options).pipe(new Transform(true));
    Pipe.streams = this.streams;
    return Pipe;
};

Kitty.prototype._watch = function(globs){
    const watch = require('gulp-watch');
    const Compile = require('./compile.js');

    watch(globs,options={},(vinyl)=>{
        var filename = vinyl.path;
        if(!this._bufferFiles[filename]){
            var compiler = new Compile(vinyl);
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
