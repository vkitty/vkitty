const fs = require('fs');
const assert = require('assert');
var kitty = require('../index.js');

//测试子文件动了 但是上级的共用文件没动的的问题
function testCommon(){
    kitty.watch('./demo/watch/common/*.html')
        .pipe(kitty.dest('./build/watch/common'))
}

testCommon();