const Util = require('../util.js');


var Loader = {
    /**
     * 写入jstag
     * @param content
     * @returns {string}
     */
    jstag: function (content,depend,compiler) {
        return '<script>' + content + '</script>';
    },

    /**
     * 写入 csstag
     * @param content
     * @returns {string}
     */
    csstag: function (content,depend,compiler) {
        return '<style type="text/css">' + content + '</style>';
    },

    imgtag:function(content,depend,compiler){
        return '<img src="'+content+'">';
    },

    /**
     * 写入tag
     * 区分为jstag\imgtag和其他
     * @param content
     * @param depend
     * @param compiler
     * @returns {*|string}
     */
    tag: function(content,depend,compiler){
        var type =depend.data.type;
        if(type==='js'){
            return Loader.jstag(content,depend,compiler);
        }else if(type==='css'){
            return Loader.csstag(content,depend,compiler);
        }else{
            return Loader.imgtag(content,depend,compiler);
        }
    }
};

module.exports = Loader;
