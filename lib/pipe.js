const streams = kitty._streams =  [];
const Util = require('./util.js');

const Pipe = {
    pipe(stream){
        if(Pipe._checkIsStream(stream)){
            streams.push(stream);
        }
        return Pipe;
    },
    _checkIsStream:function(stream){
        if(stream.pipe || stream.readable){
            return true;
        }else {
            return false;
        }
    }
};

module.exports = Pipe;