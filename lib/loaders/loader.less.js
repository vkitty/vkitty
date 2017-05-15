const bufferFiles = kitty._bufferFiles;
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
                console.error('Error: less error '+depend.filename);
            } else {
                content = output.css;
            }
        });
        return content;
    }
};

module.exports = Loader;
