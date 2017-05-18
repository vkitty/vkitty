const Pipe = {
    pipe(stream,streams){
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