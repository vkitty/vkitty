const Observe = require('./observe.js');
const Util = require('./util.js');
const path = require('path');
const config = Gkitty.config;


function Depend(data,compiler){
    this.compiler = compiler;
    this.data = data;
    this._setType();
    this._appendBabelLoaders();
    this._appendHookLoaders();
    this._readyCompileContent();
    Observe.dependContent(this);
}


/**
 * observe depend.content callback
 */
Depend.prototype.bindChangeContent= function(){
    this._doLoaders();
    if(this.compiler.checkDependsCompileIsOver()){
        this.compiler.concatDepends();
    }
};

/**
 * 准备CompileContent,从 oldBufferFile 拉取
 * 主要作用是如果子文件没有变化,就可以直接使用旧的depend.compileContent 提升效率
 * 判断标准:filename相同\loaders相同\options相同
 * 同时如果depend.filename引入的是共用文件,共用文件很大可能不会变化,需要在queue引用_readyCompileContentFromChild
 * 如果有变化queue._resetDependCompileContent 会重置
 */
Depend.prototype._readyCompileContent = function(){
    var bufferFiles = this.compiler.kitty.bufferFiles;
    var key = this.compiler.filename;
    var oldBufferFile = bufferFiles[key];
    var data = this.data;
    var filename = data.filename;
    if(filename){
        data.compileContent = undefined;
        if(oldBufferFile){
            var oldDepends = oldBufferFile.data.depends;
            oldDepends.forEach((oldDepend)=>{
                if(this._compareWithOldData(oldDepend.data)){
                    data.compileContent = oldDepend.data.compileContent;
                }
            })
        }
    }
};

/**
 * 新旧depend.data判断
 * @param oldData
 * @returns {boolean}
 * @private
 */
Depend.prototype._compareWithOldData = function(oldData){
    var oldOptions = oldData.options;
    var oldOptionsStr = JSON.stringify(oldOptions);
    var oldLoaders = oldData.loaders;
    var oldLodersStr = JSON.stringify(oldLoaders);
    var oldFilename = oldData.filename;
    var data = this.data;
    var newLoaders = data.loaders;
    var newLoadersStr = JSON.stringify(newLoaders);
    var newOptions = data.options;
    var newOptionsStr = JSON.stringify(newOptions);
    var newFilename = data.filename;
    return newFilename===oldFilename && newLoadersStr===oldLodersStr && newOptionsStr ===oldOptionsStr;
};

/**
 * 从child拉取数据,提供给queue调用
 * 要判断child.depends isover
 * @private
 */
Depend.prototype.readyCompileContentFromChild = function(){
    var bufferFiles = this.compiler.kitty.bufferFiles;
    var filename = this.data.filename;
    var compileContent = this.data.compileContent;
    if(compileContent===undefined && filename){
        var bufferFile = bufferFiles[filename];
        if(bufferFile && bufferFile.checkDependsCompileIsOver()){
            this.data.content = bufferFile.data.compileContent;
        }
    }
};


/**
 * 处理depend.loaders
 * @private
 */
Depend.prototype._doLoaders=function(){
    var bufferFiles = this.compiler.kitty.bufferFiles;
    var data = this.data;
    var loaders = data.loaders;
    data.compileContent = data.content;
    loaders && loaders.forEach((key)=>{
        var loader = Gkitty.loaders[key];
        if(!loader){
            Util.console.error('loaders.'+key+' is not a function');
            Util.console.error('error from '+this.compiler.filename);
            process.exit();
        }
        try{
            data.compileContent = loader(data.compileContent,this,bufferFiles[data.filename]);
        }catch (err){
            Util.console.error('do loaders.'+key+' error!');
            Util.console.error('error from '+this.data.filename,err);
        }
    });

    if(this._checkEncodeStr()){
        data.compileContent = this._encodeStr(data.compileContent);
    }
};

/**
 * 处理变量
 * @param content
 * @param options
 * @returns {XML|string|void|*}
 * @private
 */
Depend.prototype.handleVarOptions = function(content){
    var options = this.data.options;
    if (!options || !content) {
        return content;
    }
    var varTag = config.varTag;
    var openTag = varTag.open;
    var closeTag = varTag.close;
    var regexp = new RegExp(openTag + '(.+?)' + closeTag, 'g');
    content = content.replace(regexp, function () {
        var key = arguments[1] || '';
        var val = options;
        key.split('.').forEach(function (k) {
            val = val[k];
        });
        return val || '';
    });
    return content;
};


/**
 * loaders增加钩子loader
 * @private
 */
Depend.prototype._appendHookLoaders=function(){
    var loaders = this.data.loaders;
    this.data.loaders = loaders.concat(['afterCompile']);
};


/**
 * loaders增加babel处理
 * bable只处理js文件
 * 1. jstag|jscdn
 * 2. tag && depend.data.type===js 或者 cdn && depend.data.type===js
 * @private
 */
Depend.prototype._appendBabelLoaders=function(){
    var loaders = this.data.loaders;
    var type = this.data.type;
    var index = loaders.indexOf('jstag');
    if(index===-1){
        index = loaders.indexOf('jscdn');
    }
    if(index===-1){
        if(type==='js'){
            if(loaders.indexOf('tag')>-1){
                index = loaders.indexOf('tag');
            }else if(loaders.indexOf('cdn')>-1){
                index = loaders.indexOf('cdn');
            }
        }
    }
    if(index>-1){
        if(loaders.indexOf('mini')>-1){
            index = loaders.indexOf('mini');
        }else if(loaders.indexOf('jsmini')>-1){
            index = loaders.indexOf('jsmini');
        }
        var newLoaders = loaders.splice(0,index).concat('_babel');
        loaders = newLoaders.concat(loaders);
    }
    this.data.loaders = loaders;
};


/**
 * 判断是否需要反编译字符串
 * 1. compiler必须是js文件
 * 2. depend.data.type不是js文件
 * @returns {boolean}
 * @private
 */
Depend.prototype._checkEncodeStr=function(){
    var compiler = this.compiler;
    var data = this.data;
    if(data.filename && compiler.data.type==='js' && data.type!=='js'){
        return true;
    }else{
        return false;
    }
};

/**
 * 设置文件类型
 * @private
 */
Depend.prototype._setType= function(){
    var data = this.data;
    var loaders = data.loaders;
    var filename = data.filename;
    this.data.type='txt';
    if(!filename){
        return;
    }
    loaders.forEach((loader)=>{
        if(Util.isImgLoader(loader)){
            this.data.type='img';
        }else if(Util.isJsLoader(loader)){
            this.data.type='js';
        }else if(Util.isCssLoader(loader)){
            this.data.type='css';
        }else if(Util.isMediaLoader(loader)){
            this.data.type='media';
        }
    });
    var extname = path.extname(filename);
    if(this.data.type==='txt' && Util.isImg(extname)){
        this.data.type='img';
    }if(this.data.type==='txt' && Util.isMedia(extname)){
        this.data.type='media';
    }else if(this.data.type==='txt' && Util.isJs(extname)){
        this.data.type='js';
    }else if(this.data.type==='txt' && Util.isCss(extname)){
        this.data.type='css';
    }
};


/**
 * 反编译字符串
 * 如果是js _include进来的,需要处理为字符串,如果是require进来的就可以不用了
 * @param str
 * @returns {string|*}
 * @private
 */
Depend.prototype._encodeStr=function(str){
    str = str.replace(/\n\/\/.*?\n/g, '').replace(/\n/g, '').replace(/'/g, "\\'").replace(/\//g,'\\/');
    str = "'" + str + "'";
    return str;
};

module.exports = Depend;