const less = require('less');

var Loader = {
    /**
     * less编译
     * @param content
     * @param actionFile
     * @returns {*}
     */
    less: function (content,compile,depend) {
        less.render(content, function (err, output) {
            if (err) {
                throw err;
            } else {
                content = output.css;
            }
        });
        return content;
    }
};

module.exports = Loader;
