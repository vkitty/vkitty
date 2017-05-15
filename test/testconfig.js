const fs = require('fs');
const assert = require('assert');
var kitty = require('../index.js');
kitty.config.varTag.open='%%';
kitty.config.varTag.close='###';
kitty.config.tag="testtab";
kitty.config.baseDir=__dirname+'/demo/config';


function compare() {
    kitty.src('./demo/config/index.html')
        .pipe(kitty.dest('./build/pages/config'))
        .pipe(kitty.cdnDest('./build/static'));


    var getContent = function (file) {
        return fs.readFileSync(file).toString();
    };

    var equalFile = function (file1, file2) {
        var buildContent = getContent(file1);
        var compareContent = getContent(file2);
        assert.equal(buildContent, compareContent)
    };

    setTimeout(function () {
        equalFile('./build/pages/config/index.html', './demo/config/compare.html');
    }, 1000);
}

compare();
