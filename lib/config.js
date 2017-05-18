var config = {
    tag:'_include',//引入tag
    baseDir:process.cwd(),//项目根目录
    varTag: {
        open: '@@',//变量开始符
        close: "@@"//变量结束符
    }
};
module.exports = config;