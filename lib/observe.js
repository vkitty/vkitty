var Observe = {
    /**
     * 监听compiler.data.compileContent
     * @private
     */
    compileContent(compiler){
        var oldVal = compiler.data.compileContent;
        Object.defineProperty(compiler.data, 'compileContent', {
            get: function () {
                return oldVal;
            },
            set: function (newVal) {
                //不能使用oldVal===newVal进行判断 因为编译后字符串很大可能相同
                oldVal = newVal;
                compiler.bindChangeCompile();
            }
        });
    },

    /**
     * 监听depend.data.content
     * @private
     */
    dependContent(depend){
        var oldVal = depend.data.content;
        Object.defineProperty(depend.data, 'content', {
            get: function () {
                oldVal = depend.handleVarOptions(oldVal);
                return oldVal;
            },
            set: function (newVal) {
                oldVal = newVal;
                depend.bindChangeContent();
            }
        })
    }
};

module.exports = Observe;