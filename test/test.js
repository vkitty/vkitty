const fs = require('fs');
const assert = require('assert');
var kitty = require('../index.js');

function test(){
    kitty.watch(['./demo/compare/babel/index.html'])
        .pipe(kitty.dest('./build/pages/babel'))
        .pipe(kitty.cdnDest('./build/static/babel'));
}
//test();


function compare(){
    kitty.src('./demo/compare/*/index.html')
        .pipe(kitty.dest('./build/pages'))
        .pipe(kitty.cdnDest('./build/static'));

    kitty.src(['./demo/compare/srcs/src1.html','./demo/compare/srcs/src3.html'])
        .pipe(kitty.dest('./build/pages/srcs'))
        .pipe(kitty.cdnDest('./build/static/srcs'));

    kitty.src(['./demo/compare/srcs/src2.html'])
        .pipe(kitty.dest('./build/pages/srcs'))
        .pipe(kitty.cdnDest('./build/static/srcs'));


    var getContent = function(file){
        return fs.readFileSync(file).toString().trim();
    };

    var equalFile = function(file1,file2){
        var buildContent = getContent(file1);
        var compareContent = getContent(file2);
        try{
            assert.equal(buildContent.length,compareContent.length)
        }catch (e){
            throw 'compare error:'+file1;
        }
    };

    setTimeout(function(){
        equalFile('./build/pages/babel/index.html','./demo/compare/babel/compare.html');
        equalFile('./build/pages/mini/index.html','./demo/compare/mini/compare.html');
        equalFile('./build/pages/require/index.html','./demo/compare/require/compare.html');
        equalFile('./build/pages/options/index.html','./demo/compare/options/compare.html');
        equalFile('./build/pages/cdn/index.html','./demo/compare/cdn/compare.html');
        equalFile('./build/static/test.ogg','./demo/compare/cdn/media.less');
        equalFile('./build/pages/text/index.html','./demo/compare/text/compare.html');
        equalFile('./build/static/aaaaa.css','./demo/compare/cdn/compare.less');
        equalFile('./build/pages/common/index.html','./demo/compare/common/compare.html');
        equalFile('./build/pages/comments/index.html','./demo/compare/comments/compare.html');
        equalFile('./build/pages/requirenovar/index.html','./demo/compare/requirenovar/compare.html');
        equalFile('./build/pages/srcs/src1.html','./demo/compare/srcs/compare/src1.html');
        equalFile('./build/pages/srcs/src2.html','./demo/compare/srcs/compare/src2.html');
        equalFile('./build/pages/srcs/src3.html','./demo/compare/srcs/compare/src3.html');
    },1000);
}

compare();
