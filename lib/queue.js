function Queue(kitty){
    this._tempFiles=[];
    this._files=[];
    this._isExeQueing=false;
    this.kitty = kitty;
    this.startTimeout=undefined;
}


/**
 * 文件增加到队列
 * @param filename
 */
Queue.prototype.add = function(filename){
    if(this._isExeQueing){
        this._tempFiles.push(filename);
    }else{
        this._files.push(filename);
    }
};

/**
 * 开始处理队列 只允许这个函数出现settimeout
 * @private
 */
Queue.prototype.start=function(){
    clearTimeout(this.startTimeout);
    this.startTimeout = setTimeout(()=>{
        this._isExeQueing=true;
        this._setLowerestIsActive();
        this._resetDependCompileContent();
        this._doReadyCompileFormChild();
        this._doCompile();
        setTimeout(()=>{
            this._transformTempFiles();
        })
    },30);
};

/**
 * 将tempfiles更新到队列
 * @private
 */
Queue.prototype._transformTempFiles=function(){
    this._isExeQueing = false;
    this._files = this._tempFiles;
    this._tempFiles = [];
};

/**
 * 设置最低层isActive
 * 这样可以向上冒泡
 * @private
 */
Queue.prototype._setLowerestIsActive=function(){
    var bufferFiles = this.kitty.bufferFiles;
    this._files.forEach((key)=>{
        var bufferFile = bufferFiles[key];
        var data = bufferFile.data;
        var isActive = data.isActive;
        var depends = data.depends;
        if(isActive){
            depends.forEach((depend)=>{
                var filename = depend.data.filename;
                var dependBufferFile = bufferFiles[filename];
                if(filename && dependBufferFile && dependBufferFile.data.isActive){
                    bufferFile.data.isActive=false;
                }
            })
        }
    })
};

/**
 * 将关联depend重置 depend.compileContent 为undefined
 * 目的是明白compiler.depends是否都编译完成,如果有undefined表示没有处理完成
 * @private
 */
Queue.prototype._resetDependCompileContent=function(){
    var bufferFiles = this.kitty.bufferFiles;
    Object.keys(bufferFiles).forEach((filename)=>{
        var bufferFile = bufferFiles[filename];
        if(bufferFile) {
            var data = bufferFile.data;
            var isActive = data.isActive;
            if (isActive) {
                Object.keys(bufferFiles).forEach((key)=> {
                    var bufferFile = bufferFiles[key];
                    var depends = bufferFile.data.depends;
                    depends.forEach((depend)=> {
                        if (depend.data.filename === filename) {
                            depend.data.compileContent = undefined;
                        }
                    })
                })
            }
        }
    });
};

/**
 * 调用depend.readyCompileContentFromChild
 * 防止引用的文件不需要变动而照成depend不编译的情况
 * @private
 */
Queue.prototype._doReadyCompileFormChild=function(){
    var bufferFiles = this.kitty.bufferFiles;
    this._files.forEach((key)=>{
        var bufferFile = bufferFiles[key];
        var data = bufferFile.data;
        //if(data.isActive){ 这个不能用 要不然testwatch common通过不了, 注释了这个会引发多次编译问题,需要注意
            var depends = data.depends;
            depends.forEach((depend)=>{
                depend.readyCompileContentFromChild();
            });
        //}
    })
};

/**
 * 进行编译
 * 向上冒泡的开始
 * @private
 */
Queue.prototype._doCompile=function(){
    var bufferFiles = this.kitty.bufferFiles;
    Object.keys(bufferFiles).forEach((key)=>{
        var bufferFile = bufferFiles[key];
        if(bufferFile.data.isActive){
            bufferFile.compileDepends();
            bufferFile.data.isActive=false;
        }
    });
};

module.exports = Queue;