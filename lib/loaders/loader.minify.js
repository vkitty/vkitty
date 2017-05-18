const less = require('less');
const UglifyJS = require("uglify-js");

var Loader = {
    /**
     * 压缩js
     * @param content
     * @returns {string|number|Number|*}
     */
    jsmini: function (content) {
        content = UglifyJS.minify(content, {fromString: true}).code;
        return content;
    },

    /**
     * 压缩css
     * @param content
     * @returns {*}
     */
    cssmini: function (content) {
        less.render(content, {compress: true}, function (err, output) {
            if (err) {
                throw err;
            } else {
                content = output.css;
            }
        });

        return content;
    },

    /**
     * 压缩html
     * @param content
     * @returns {*}
     */
    htmlmini: function (content) {
        var minify = require('html-minifier').minify;
        content = minify(content,{removeComments:true,collapseWhitespace:true});
        return content;
    },


    /**
     * 按文件类型压缩
     * @param content
     * @param compiler
     * @returns {*}
     */
    mini: function (content,depend, compiler) {
        var filename = depend.data.filename;
        var type = depend.data.type;
        if (type==='js') {
            return Loader.jsmini(content);
        }
        if (type==='css') {
            return Loader.cssmini(content);
        }
        if (/\.(html|htm)/.test(filename) || type==='txt') {
            return Loader.htmlmini(content);
        }
    }
};

module.exports = Loader;
