const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Dest = require('../dest.js');
const Util = require('../util.js');

var Loader = {
    /**
     * cdn操作
     * @param content
     * @returns {string|number|Number|*}
     */
    cdn(content,depend,compiler) {
        var type = depend.data.type;
        if(type==='js'){
            return this.jscdn(content,depend,compiler);
        }else if(type==='css'){
            return this.csscdn(content,depend,compiler);
        }else if(type==='media'){
            return this.mediacdn(content,depend,compiler);
        }else{
            return this.imgcdn(content,depend,compiler);
        }
    },

    /**
     * 指定使用jscdn
     * @param content
     * @param depend
     * @param compiler
     * @returns {string}
     */
    jscdn(content,depend,compiler){
        this._init(content,depend,compiler);
        var url = this._getUrl();
        return '<script src="'+url+'"><\/script>';
    },

    /**
     * 指定使用csscdn
     * @param content
     * @param depend
     * @param compiler
     * @returns {string}
     */
    csscdn(content,depend,compiler){
        this._init(content,depend,compiler);
        var url = this._getUrl();
        return '<link rel="stylesheet" href="'+url+'"/>';
    },

    /**
     * 指定使用imgcdn
     * img cdn返回的只是一段地址
     * @param content
     * @param depend
     * @param compiler
     * @returns {*}
     */
    imgcdn(content,depend,compiler){
        this._init(content,depend,compiler,true);
        var url = this._getUrl();
        return url;
    },


    /**
     * 指定使用mediacdn
     * img cdn返回的只是一段地址
     * @param content
     * @param depend
     * @param compiler
     * @returns {*}
     */
    mediacdn(content,depend,compiler){
        this._init(content,depend,compiler,true);
        var url = this._getUrl();
        return url;
    },

    /**
     * 初始化数据
     * 如果是图片cdn vinyl.contents不能toString
     * @param content
     * @param depend
     * @param compiler
     * @param isImg
     * @private
     */
    _init(content,depend,compiler,isImg){
        this.depend = depend;
        this.compiler = compiler;
        var data = compiler.data;
        var vinyl = data.vinyl;
        vinyl.isCdn = true;
        if(!isImg){
            vinyl.contents = Buffer.from(depend.data.compileContent);
        }
        var options = this._parse();
        this._rewirteRelative(options);
        Dest.cdn(vinyl,depend);
    },

    /**
     * 获取完整的地址
     * @returns {*}
     * @private
     */
    _getUrl(){
        var options = this._parse();
        var url = options.url+options.param;
        return url;
    },

    /**
     * 重写 vinyl.relative
     * @param options
     * @private
     */
    _rewirteRelative(options){
        var vinyl = this.compiler.data.vinyl;
        var oldVal = vinyl.relative;
        Object.defineProperty(vinyl,'relative',{
            configurable:true,
            get:function(){
                if(/^\//.test(options.basename)){
                    return '.'+options.basename;
                }else{
                    return options.basename;
                }
            },
            set:function(newVal){
                oldVal = newVal
            }
        });
    },

    /**
     * _include('./index.js?ac=cdn',{url:"#cdn#;/dest/index.js"})
     * @private
     */
    _parse(){
        var depend = this.depend;
        var options = depend.data.options || {};
        var url = options.url;
        if(!url){
            Util.console.warn('error: '+this.compiler.filename);
            Util.console.warn('error: loader.cdn must set url option');
        }

        var param = this._getParam(url);
        var basename = this._getBaseName(url,depend);
        var newUrl = this._formartUrl(url,basename);
        var result = {
            param:param,
            basename:basename,
            url:newUrl
        };
        return result;
    },

    /**
     * 获取参数
     * @private
     */
    _getParam(url){
        if(url.indexOf('?')>-1){
            var param = url.replace(/^.*\?/,'?');
            return param;
        }else{
            return '';
        }
    },

    /**
     * 获取生成的文件名称
     * @private
     */
    _getBaseName(url,depend){
        var basename = '';
        var filename = this.depend.data.filename;
        url = url.replace(/\?.*$/,'');
        var parts = url.split(';');
        //如果有指定的filename
        if(parts[1]){
            basename = parts[1].trim();
        }else{
            var parseFile = path.parse(filename);
            basename = parseFile.base;
            basename = crypto.createHash('md5').update(depend.data.compileContent).digest('hex')+basename;
        }
        return basename;
    },


    /**
     * 格式化url
     * @private
     */
    _formartUrl(url,basename){
        url = url.replace(/\?.*$/,'');
        var filename = this.depend.data.filename;
        var parts = url.split(';');
        var newUrl = parts[0];
        newUrl = newUrl+basename;
        return newUrl
    }
};

module.exports = {
    cdn:Loader.cdn.bind(Loader),
    jscdn:Loader.jscdn.bind(Loader),
    imgcdn:Loader.imgcdn.bind(Loader),
    csscdn:Loader.csscdn.bind(Loader),
    mediacdn:Loader.mediacdn.bind(Loader),
};
