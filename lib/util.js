const util = require('util');
const moment = require('moment');
const clc = require('cli-color');
const stream = require('stream');


class Util extends util.constructor{
    constructor(){
        super();
    }
}

/**
 * 格式化时间
 * @param format
 * @returns {*}
 */
Util.prototype.nowTime = function(format){
    return moment().format(format || "HH:mm:ss");
};

/**
 * 判断是不是图片
 * @param ext
 */
Util.prototype.isImg =function(ext){
    var imgExts = ['.jpg','.jpeg','.gif','.png','.webp','.ico'];
    if(imgExts.indexOf(ext)>-1){
        return true
    }else{
        return false;
    }
};

/**
 * 判断是不是样式文件类型
 * @param ext
 */
Util.prototype.isCss =function(ext){
    var cssExts = ['.less','.sass','.css'];
    if(cssExts.indexOf(ext)>-1){
        return true
    }else{
        return false;
    }
};

/**
 * 判断是不是js文件类型
 * @param ext
 */
Util.prototype.isJs =function(ext){
    var jsExts = ['.js','.vue','.coffee'];
    if(jsExts.indexOf(ext)>-1){
        return true
    }else{
        return false;
    }
};

/**
 * 判断是不是多媒体文件
 */
Util.prototype.isMedia = function(ext){
    var jsExts = ['.wav','.mp3','.wma','.mp4','.ogg','.ape','.acc','.asf','.rm','.ra'];
    if(jsExts.indexOf(ext)>-1){
        return true
    }else{
        return false;
    }
};

/**
 * 判断是不是css loader
 * @param loadername
 * @returns {boolean}
 */

Util.prototype.isCssLoader = function(loadername){
    var cssloaders = ['_less','csscdn','csstag'];
    if(cssloaders.indexOf(loadername)>-1){
        return true;
    }else{
        return false;
    }
};

/**
 * 判断是不是jsloader
 * @param loadername
 * @returns {boolean}
 */
Util.prototype.isJsLoader = function(loadername){
    var jsloaders = ['_babel','_require','jstag','jscdn'];
    if(jsloaders.indexOf(loadername)>-1){
        return true;
    }else{
        return false;
    }
};

/**
 * 判断是不是imgloader
 * @param loadername
 * @returns {boolean}
 */
Util.prototype.isImgLoader = function(loadername){
    var imgloaders = ['imgtag','imgcdn'];
    if(imgloaders.indexOf(loadername)>-1){
        return true;
    }else{
        return false;
    }
};



/**
 * 判断是不是imgloader
 * @param loadername
 * @returns {boolean}
 */
Util.prototype.isMediaLoader = function(loadername){
    var imgloaders = ['mediacdn'];
    if(imgloaders.indexOf(loadername)>-1){
        return true;
    }else{
        return false;
    }
};


/**
 * console
 * @type {{success: (function(*)), error: (function(*)), warn: (function(*))}}
 */
Util.prototype.console = {
    success(msg){
        console.log(clc.green(utils.nowTime()+' '+msg));
    },
    error(msg,err){
        console.log(clc.red(utils.nowTime()+' '+msg));
        if(err){
            throw err;
        }
    },
    warn(msg){
        console.log(clc.yellow(utils.nowTime()+' '+msg));
    },
    notice(msg){
        console.log(clc.blue(utils.nowTime()+' '+msg));
    }
};

/**
 * 指定vinyl relaive值
 * @param vinyl
 * @param relative
 */
Util.prototype.pointVinylRelative = function(vinyl,relative){
    var oldVal = relative;
    Object.defineProperty(vinyl,'relative',{
        configurable:true,
        get:function(){
            return relative;
        },
        set:function(newVal){
            oldVal = newVal
        }
    });
};

Util.prototype.cloneStream = function(srcStream){
    var newStream = new stream.Transform({objectMode: true, highWaterMark:16});
    newStream._transform = srcStream._transform;
    newStream._flush = srcStream._flush;
    if(srcStream.isCdnDest){
        newStream.isCdnDest = srcStream.isCdnDest;
    }
    if(srcStream.isDest){
        newStream.isDest = srcStream.isDest;
    }
    return newStream;
};

var utils = new Util();

module.exports = utils;