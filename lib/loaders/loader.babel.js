const babel = require('babel-core');

var Loader = {
    /**
     * less编译
     * @param content
     * @param actionFile
     * @returns {*}
     */
    babel: function (content) {
        var es6 = babel.transform(content, {
            presets: ['es2015']
        });
        return es6.code;
    }
};

module.exports = Loader;
