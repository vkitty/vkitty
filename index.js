var Kitty = require('./lib/kitty.js');

module.exports = {
    src:function(globs,options){
        this.kitty = new Kitty();
        return this.kitty.src(globs,options);
    },
    watch:function(globs,options){
        this.kitty = new Kitty();
        return this.kitty.watch(globs,options);
    },
    dest:function(folder="./build/pages",options){
        return this.kitty.dest(folder,options);
    },
    cdnDest:function(folder="./build/static",options){
        return this.kitty.cdnDest(folder,options);
    },
    loaders:Gkitty.loaders,
    config:Gkitty.config
};