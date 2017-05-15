(function (modules) {
    var installedModules = {};
    function _kitty_require(moduleId) {
        if(installedModules[moduleId]){
            return installedModules[moduleId].exports;
        }
        var module = installedModules[moduleId] = {
            exports:'',
            id:moduleId
        };
        modules[moduleId].call(module.exports,module,_kitty_require);
        return module.exports;
    }
    return _kitty_require('{{key}}');
})({module_funs});