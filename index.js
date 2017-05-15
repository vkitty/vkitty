var config = {
    watch:false,//开启监听模式
    tag:'_include',//引入tag
    baseDir:process.cwd(),//项目根目录
    varTag: {
        open: '@@',//变量开始符
        close: "@@"//变量结束符
    }
};
global.kitty = {};
kitty._bufferFiles = {};
kitty.config = config;

const path = require('path');
const loaders = require('./lib/loaders/loader.js');
kitty.loaders=loaders;
const vfs = require('vinyl-fs');
const Transform = require('./lib/transform.js');
const Pipe = require('./lib/pipe.js');
const Util = require('./lib/util.js');

kitty.src = function(globs,options){
    kitty.options = options;
    kitty.config.watch=false;
    vfs.src(globs,options).pipe(new Transform(true));
    return Pipe;
};

kitty._src = function(globs,options,errBack){
    var stream = vfs.src(globs,options);
    var result = stream.pipe(new Transform());
    errBack && stream.on('error',function(err){
        errBack(err);
    });
    return result;
};

kitty.dest = function(folder="./build/pages",options){
    var stream = vfs.dest(folder,options);
    stream.isDest = true;
    kitty._rewriteStreamTransform(stream,folder);
    return stream;
};

kitty.cdnDest = function(folder="./build/static",options){
    var stream = vfs.dest(folder,options);
    stream.isCdnDest=true;
    kitty._rewriteStreamTransform(stream,folder);
    return stream;
};

kitty._rewriteStreamTransform = function(stream,folder){
    var oldTransform = stream._transform;
    stream._transform = function(file,encoding,callback){
        var newCallback = function(){
            var destPath  = path.resolve(kitty.config.baseDir,folder,file.relative);
            callback.apply(null,arguments);
        };
        oldTransform(file,encoding,newCallback);
    };
};


kitty.watch = function(globs,options){
    kitty.options = options;
    kitty.config.watch=true;
    kitty._watch(globs,options);
    vfs.src(globs,options).pipe(new Transform(true));
    return Pipe;
};

kitty._watch = function(globs){
    const watch = require('gulp-watch');
    const Compile = require('./lib/compile.js');

    watch(globs,options={},function(vinyl){
        var filename = vinyl.path;
        if(!kitty._bufferFiles[filename]){
            var compiler = new Compile(vinyl);
            compiler.data.needCreateDest = true;
            compiler.init();
        }
    });
};



module.exports = {
    config:kitty.config,
    src:kitty.src,
    dest:kitty.dest,
    cdnDest:kitty.cdnDest,
    loaders:kitty.loaders,
    watch:kitty.watch
};