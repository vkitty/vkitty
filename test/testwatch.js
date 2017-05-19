const fs = require('fs');
const assert = require('assert');
var kitty = require('../index.js');


function testinclude(){
    kitty.src('./demo/error/include.html')
        .pipe(kitty.dest('./build/pages/error'))
        .pipe(kitty.cdnDest('./build/static/error'));
}


function testloader(){
    kitty.src('./demo/error/loader.html')
        .pipe(kitty.dest('./build/pages/error'))
        .pipe(kitty.cdnDest('./build/static/error'));
}

function testless(){
    kitty.src('./demo/error/less.html')
        .pipe(kitty.dest('./build/pages/error'))
        .pipe(kitty.cdnDest('./build/static/error'));
}

testinclude();
testloader();
testless();
