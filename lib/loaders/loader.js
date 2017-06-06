const LessLoader = require('./loader.less.js');
const MinifyLoader = require('./loader.minify.js');
const CdnLoader = require('./loader.cdn.js');
const TagLoader = require('./loader.tag.js');
const BabelRequireLoader = require('./loader.babel_require.js');
const BabelLoader = require('./loader.babel.js');

var Loader = {
    /**
     * 钩子函数 afterCompile
     * @param content
     * @param compiler
     * @returns {*}
     */
    afterCompile: function (content,depend,compiler) {
        return content;
    },

    /**
     * 钩子函数 beforeCompile
     * @param content
     * @param compiler
     * @returns {*}
     */
    beforeCompile: function (content,depend,compiler) {
        return content;
    }
};

var loader = Object.assign({},Loader,TagLoader,LessLoader,MinifyLoader,CdnLoader,BabelRequireLoader,BabelLoader);


module.exports = loader;
