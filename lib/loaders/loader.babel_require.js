const path = require('path');
const fs = require('fs');

var Loader = {
    _moduleId:0,
    _modules:{},

    /**
     * 处理babel编译
     * @param content
     * @param compiler
     * @param depend
     */
    babel(content,compiler,depend){
        if(!content){
            return '';
        }
        this.content = content;
        this.compiler = compiler;
        this.depend = depend;
        this._getTplContent();
        var tpl = this.tplContent;
        var module = this._setModule();
        var modules = this._babelGetModuleFuns();
        var strModules = [];
        Object.keys(modules).forEach(function(key){
            var module = modules[key];
            strModules.push('"'+module.mid+'":'+module.content);
        });
        tpl = tpl.replace('{{key}}', module.mid);
        tpl = tpl.replace('module_funs', strModules.join(','));
        return tpl;
    },

    /**
     * 获取模板内容
     * @private
     */
    _getTplContent(){
        this.tplContent = fs.readFileSync(path.resolve(__dirname, '../tpl.js')).toString();
        this._getTplContent = function(){};
    },

    /**
     * 将需要的modules组装成函数 用于替换 tpl.js module_funs
     * @private
     */
    _babelGetModuleFuns(){
        var modules = this._modules;
        var result = {};
        var depend = this.depend;
        var filename = depend.data.filename;
        var module = result[filename] = Object.create(modules[filename]);
        module.content = this._getModuleContent(module.content);
        var getModule = (content)=>{
            var moduleFiles = content.match(/_kitty_require\([\'\"][^\'\"]+[\'\"]\)/g) || [];
            moduleFiles.forEach((moduleFile)=>{
                var moduleId = moduleFile.replace(/_kitty_require\([\'\"]/,'').replace(/[\'\"]\)/,'');
                Object.keys(modules).forEach((key)=>{
                    var module = modules[key];
                    if(module.mid.toString()===moduleId){
                        var filename = module.filename;
                        var newModule = result[filename] = Object.create(module);
                        newModule.content = this._getModuleContent(newModule.content);
                        getModule(newModule.content);
                    }
                });
            })
        };
        getModule(this.content);
        return result;
    },

    /**
     * 获取单个module string
     * @param content
     * @returns {string|*}
     * @private
     */
    _getModuleContent(content){
        var startStr = 'function(module,_kitty_require){';
        var endStr = '}';
        content = startStr + content + endStr;
        return content;
    },


    /**
     * 处理js require
     * @param content
     * @param compiler
     * @param depend
     * @returns {*}
     */
    require(content,compiler,depend){
        this.content = content;
        this.compiler = compiler;
        this.depend = depend;
        var module = this._setModule();
        return '_kitty_require("' + module.mid + '")';
    },

    /**
     * 填充modules
     * @private
     */
    _setModule(){
        var modules = this._modules;
        var depend = this.depend;
        var content = this.content;
        var filename = depend.data.filename;
        var mid;
        if(modules[filename]){
            mid = modules[filename].mid
        }else{
            mid = this._moduleId++;
        }
        modules[filename] = {
            filename:filename,
            content:content,
            mid:mid
        };
        return modules[filename];
    }
};

module.exports = {
    _require:Loader.require.bind(Loader),
    _babel:Loader.babel.bind(Loader)
};
