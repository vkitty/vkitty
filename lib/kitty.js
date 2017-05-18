var config = {
    watch:false,//开启监听模式
    tag:'_include',//引入tag
    baseDir:process.cwd(),//项目根目录
    varTag: {
        open: '@@',//变量开始符
        close: "@@"//变量结束符
    }
};

const path = require('path');
const loaders = require('./loaders/loader.js');
const vfs = require('vinyl-fs');
const Pipe = require('./pipe.js');
const Util = require('./util.js');
const Transform = require('./transform.js');

function Kitty(){
    this._bufferFiles={};
    this._streams = [];
    this.loaders = loaders;
    this.config = config;
}

Kitty.config = config;
Kitty.loaders = loaders;

Kitty.prototype.src = function(globs,options){
    this.options = options;
    config.watch=false;
    vfs.src(globs,options).pipe(new Transform(true,this));
    var result = {
        pipe:(stream)=>{
            Pipe.pipe(stream,this._streams);
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
    Pipe.streams = this._streams;
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

module.exports = Kitty;
