const fs = require('fs');
const path = require('path');
const Depend = require('./depend.js');
const Util = require('./util.js');
const config = Gkitty.config;
const requireReg = /([\s\=])(require\([^\)]+?\))/;
const acReg = /._ac=[a-zA-Z0-9_]+/;
var includeReg = '';


var Parse = {
    start(compiler){
        includeReg = new RegExp('('+config.tag+'\\([^\\)\\n]+\\))');
        this.compiler = compiler;
        this.content = compiler.data.content;
        this.depends = [];
        this.compiler.data.depends = this.depends;
        this._parseContent();
    },

    /**
     * 解析内容
     * require引入自动增加_require
     * 需要防止首条就是require语句
     * @private
     */
    _parseContent(){
        var compiler = this.compiler;
        var content = this.content;
        var parts = content.split(includeReg);
        parts.forEach((part)=>{
            part = part.trim();
            if(includeReg.test(part)){
                var depend = this._parseDepend(part);
                depend = new Depend(depend,compiler);
                this.depends.push(depend);
            }else{
                var jsParts = (" "+part).split(requireReg);
                jsParts.forEach((jsPart)=>{
                    jsPart = jsPart.trim();
                    if(/^(require\([^\)]+?\))/.test(jsPart)){
                        var depend = this._parseDepend(jsPart);
                        depend.loaders = ['_require'].concat(depend.loaders);
                    }else{
                        depend = {
                            content:jsPart,
                            compileContent:jsPart,
                            loaders:[]
                        };
                    }
                    depend = new Depend(depend,compiler);
                    this.depends.push(depend);
                })
            }
        });
    },



    /**
     * 解析_include('./index.less') require('./index.js')
     * @param part
     * @private
     */
    _parseDepend(part){
        var result = {};
        var match = part.match(/\([\'\"]([^\(\'\"\)]+)/);
        var includePart = match[1];
        result.filename = this._parseFile(includePart);
        result.param = this._parseParam(includePart);
        result.loaders = this._parseLoaders(includePart);
        result.options = this._parseOptions(part);
        return result;
    },


    /**
     * 解析出文件名
     * @private
     */
    _parseFile(parsedPart){
        var parts = parsedPart.split(',');
        var part = parts[0];
        var file = part.replace(acReg,'');
        //判断绝对或者相对地址
        if (/^\//.test(file)) {
            var newFile = path.resolve(config.baseDir+file);
        }else{
            var vinyl = this.compiler.data.vinyl;
            newFile = path.resolve(vinyl.path.replace(vinyl.basename,''),file);
        }
        return newFile;
    },

    /**
     * 解析出loaders
     * @private
     */
    _parseLoaders(parsedPart){
        var parts = parsedPart.split(',');
        var part = parts[0];
        var match = part.match(acReg);
        if(match){
            var acStr = match[0];
            var loaderStr = acStr.replace('_ac=','').replace('?','');
            var loaders = loaderStr.split('_');
            return loaders;
        }else{
            return [];
        }
    },

    /**
     * 解析出额外参数 这个参数是 _include('index.js?_ac=babel&name=1') 中name=1
     * 4.0^版本param已经没有作用
     * @private
     */
    _parseParam(parsedPart){
        var parts = parsedPart.split(',');
        var part = parts[0];
        var paramParts = part.split('?');
        if(paramParts[1]){
            var param = paramParts[1].replace(acReg,'');
            return param;
        }else{
            return '';
        }

    },

    /**
     * 解析参数 这个是include后面对象
     * @private
     */
    _parseOptions(part){
        var parts = part.split(',');
        if(part && parts[1]){
            try {
                var newpart = part.replace(parts[0],'').replace(/\s*,/,'').replace(/\)$/,'').replace(/^\(/,'');
                newpart = newpart.replace(/^[\'\"]\{/,'{').replace(/\}[\'\"]$/,'}');//解决option用了引号问题
                var option = JSON.parse(newpart);
                return option;
            }catch (e){
                Util.console.warn('options parse error:' + part);
                Util.console.warn('error file:' + this.compiler.filename);
                return {};
            }
        }else{
            return {};
        }
    }

};

module.exports=Parse;