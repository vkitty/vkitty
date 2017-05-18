const fs = require('fs');
const assert = require('assert');
var kitty = require('../index.js');


function test(){
    kitty.src('./demo/compare/text/index.html')
        .pipe(kitty.dest('./build/pages/text'))
        .pipe(kitty.cdnDest('./build/static/text'));
}

//test();


function compare(){
    kitty.src('./demo/compare/*/index.html')
        .pipe(kitty.dest('./build/pages'))
        .pipe(kitty.cdnDest('./build/static'));


    var getContent = function(file){
        return fs.readFileSync(file).toString().trim();
    };

    var equalFile = function(file1,file2){
        var buildContent = getContent(file1);
        var compareContent = getContent(file2);
        try{
            assert.equal(buildContent,compareContent)
        }catch (e){
            throw 'compare error:'+file1;
        }
    };

    setTimeout(function(){
        equalFile('./build/pages/mini/index.html','./demo/compare/mini/compare.html');
        equalFile('./build/pages/require/index.html','./demo/compare/require/compare.html');
        equalFile('./build/pages/options/index.html','./demo/compare/options/compare.html');
        equalFile('./build/pages/cdn/index.html','./demo/compare/cdn/compare.html');
        equalFile('./build/static/test.ogg','./demo/compare/cdn/media.less');
        equalFile('./build/pages/text/index.html','./demo/compare/text/compare.html');
        equalFile('./build/static/aaaaa.css','./demo/compare/cdn/compare.less');
        equalFile('./build/pages/common/index.html','./demo/compare/common/compare.html');
        equalFile('./build/pages/comments/index.html','./demo/compare/comments/compare.html');
    },1000);
}

compare();
