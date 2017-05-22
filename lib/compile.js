const Util = require('./util.js');
const querystring = require('querystring');
const path = require('path');
const Parse = require('./parse.js');
const watch = require('gulp-watch');
const extract = require('extract-comments');
const EventEmitter = require('events').EventEmitter;
const Observe = require('./observe.js');
const Dest = require('./dest.js');

function Compile(vinyl,kitty){
    var data = this.data = {};
    data.vinyl = vinyl;
    data.isActive=true;
    data.depends =[];
    this.kitty = kitty;
    this._extendData();
    this.filename = data.filename;
    this._setType();
    data.content = this._getContent();
    data.compileContent = data.content;
}


Compile.prototype.init = function(){
    Observe.compileContent(this);
    this._parseContent();
    this._kittySrcDepends();
    this._watch();
    this.kitty.appendCompiler(this);
};

/**
 * 扩展data数据
 * @private
 */
Compile.prototype._extendData = function(){
    var vinyl = this.data.vinyl;
    var filename = vinyl.path;
    this.data.filename = filename.replace(/\?.*$/,'');
    this.data.ext = path.extname(this.data.filename);
};

/**
 * 深度分析内容构成
 * @private
 */
Compile.prototype._parseContent = function(){
    Parse.start(this);
};


/***
 * 获取content
 * 如果是图片文件,返回path\mtime和ctime,因为MD5的时候是通过content来的
 * 图片不需要toString
 * @returns {*}
 * @private
 */
Compile.prototype._getContent = function(){
    var data = this.data;
    var vinyl = data.vinyl;
    var contents = vinyl.contents;
    if (data.type==='img' || data.type==='media') {
        return vinyl.path+vinyl.stat.mtime+vinyl.stat.ctime;
    } else {
        var content='';
        try{
            content = contents.toString();//将buffer转为string
        }catch (e){
            Util.console.error('globs error');
            Util.console.error('error from '+data.filename,e);
        }
        content = Gkitty.loaders.beforeCompile(content, '', this);//beforeCompile处理
        if(content===undefined){
            Util.console.error('do loaders.beforeCompile must return a string');
            Util.console.error('error from '+data.filename,true);
        }
        content = this._handleContentComments(content);
        return content;
    }
};

/**
 * 处理备注中的include require
 * @private
 */
Compile.prototype._handleContentComments = function (content) {
    var data = this.data;
    var comments = extract(content);
    comments.forEach((comment)=> {
        var raw = comment.raw;
        content = content.replace(raw, function (word) {
            return word.replace(/require/g, '__kitty').replace(/_include/g, '___kitty');
        });
    });
    return content;
};

/**
 * 解决_srcDepends
 * @private
 */
Compile.prototype._kittySrcDepends = function(){
    var kitty = this.kitty;
    var bufferFiles = kitty.bufferFiles;
    this.data.depends.forEach((depend)=>{
        var filename = depend.data.filename;
        if(filename && !bufferFiles[filename]){
            kitty._src(filename,kitty.options,(err)=>{
                Util.console.error('error from '+this.filename,err);
            });
        }
    })
};

/**
 * 编译依赖
 * @returns {string}
 * @private
 */
Compile.prototype.compileDepends = function(){
    var depends = this.data.depends;
    var len = depends.length;
    depends.forEach((depend)=>{
        len--;
        if(len>0){
            this.setDependsCompileNotOver();
        }
        depend.compile();
    });
};

/**
 * 判断compile.depends是否都编译了
 * 通过depend.compileContent判断,如果有undefined值表示没有结束
 */
Compile.prototype.checkDependsCompileIsOver = function(){
    var depends = this.data.depends;
    var check = true;
    depends.forEach((depend)=>{
        if(depend.data.compileContent===undefined){
            check=false;
        }
    });
    return check;
};

/**
 * 强制设置DependsCompileNotOver
 * depend.readyCompileContentFromChild会用到
 * 主要是防止拉内容的时候造成多次编译,拉内容是不能向上冒泡的
 */
Compile.prototype.setDependsCompileNotOver = function(){
    var old = this.checkDependsCompileIsOver;
    this.checkDependsCompileIsOver = ()=>{
        this.checkDependsCompileIsOver = old;
        return false;
    }
};


/**
 * 拼接depends.content
 */
Compile.prototype.concatDepends = function(){
    var depends = this.data.depends;
    var result= '';
    depends.forEach((depend)=>{
        if(depend.data.compileContent){
            result += depend.data.compileContent;
        }else{
            result += depend.data.content;
        }
    });
    this.data.compileContent = result;
};


/**
 * 监听compileContent改变后触发
 */
Compile.prototype.bindChangeCompile = function(){
    var kitty = this.kitty;
    var bufferFiles = kitty.bufferFiles;
    Dest.compiler(this);
    var filename = this.filename;
    var compileContent = this.data.compileContent;
    Object.keys(bufferFiles).forEach((key)=>{
        var bufferFile = bufferFiles[key];
        var depends = bufferFile.data.depends;
        depends.forEach((depend)=>{
            if(depend.data.filename === filename){
                depend.data.content = compileContent;
            }
        });
    })
};


/**
 * 设置文件类型
 * 文件类型分为js\image\css\txt
 * 优先通过loaders来判断,如若还是txt 则通过文件后缀来判断
 * 因为require('./xxx.vue')其实也是一个js文件
 * @private
 */
Compile.prototype._setType = function(){
    var kitty = this.kitty;
    var bufferFiles = kitty.bufferFiles;
    var filename = this.filename;
    this.data.type='txt';
    Object.keys(bufferFiles).forEach((key)=>{
        var bufferFile = bufferFiles[key];
        bufferFile  && bufferFile.data.depends.forEach((depend)=>{
            if(depend.data.filename === filename && this.data.type==='txt'){
                this.data.type = depend.data.type;
            }
        })
    });
    if(this.data.type==='txt' && Util.isImg(this.data.ext)){
        this.data.type='img';
    }else if(this.data.type==='txt' && Util.isMedia(this.data.ext)){
        this.data.type='media';
    }else if(this.data.type==='txt' && Util.isJs(this.data.ext)){
        this.data.type='js';
    }else if(this.data.type==='txt' && Util.isCss(this.data.ext)){
        this.data.type='css';
    }
};


/**
 * 自动watch depend.filename
 * 配置不需要watch就不要去watch了
 * 如果已经watch的文件不需要再次watch
 * needCreateDest\relative不能因为重新watch后丢了
 * @private
 */
Compile.prototype._watch = function(){
    var kitty = this.kitty;
    if(!kitty.canWatch){
        return;
    }
    var bufferFiles = kitty.bufferFiles;
    var filename = this.filename;
    var needCreateDest = this.data.needCreateDest;
    var isWatching = this.data._isWatching;
    var relative = this.data.vinyl.relative;
    !isWatching && watch(filename,kitty.options,function(vinyl){
        var event = vinyl.event;
        if(event!=='unlink'){
            Util.pointVinylRelative(vinyl,relative);
            var compiler = new Compile(vinyl,kitty);
            compiler.data.needCreateDest = needCreateDest;
            compiler.data._isWatching = true;
            compiler.init();
        }else{
            delete bufferFiles[filename];
        }
    });
};


module.exports = Compile;