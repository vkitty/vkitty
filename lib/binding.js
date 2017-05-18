var Util = require('./util.js');
const Dest = require('./dest.js');

var Binding={
    /**
     * 绑定操作
     * 如果compile发生改变,需要触发所有依赖该文件的depends编译
     * 如果content发生改变,需要重新编译该文件,此时该depends的所有content都是为原始状态
     * 如果发生文件删除,清楚bufferFiles.file,同时删除掉依赖该文件的depend
     * @private
     */
    create(compiler){
        this.compiler = compiler;
        this.bindings = this.compiler.data.bindings;
        this._bindChangeCompile();
    },

    /**
     * 绑定compile 如果compile发生改变,需要触发所有依赖该文件的depends编译
     * @private
     */
    _bindChangeCompile(){
        var compiler = this.compiler;
        this.bindings.changeCompile = (content)=> {
            debugger
            Dest.compiler(compiler);
            var filename = compiler.filename;
            Object.keys(bufferFiles).forEach((key)=>{
                var bufferFile = bufferFiles[key];
                var depends = bufferFile.data.depends;
                depends.forEach((depend)=>{
                    if(depend.filename === filename){
                        depend.content = content;
                    }
                });
            })
        };
    },

    /**
     * 绑定dependContent 需要对改depend进行重新编译
     * @private
     */
    _bindChangeDependContent(){
        var compiler = this.compiler;
        this.bindings.changeDependContent = (depend)=>{
            this._doLoaders(depend,compiler);
            var isOver = this._checkDependsIsDoneOver(compiler.data.depends);
            isOver && compiler.concatDepends();
        }
    }
};

module.exports = Binding;
