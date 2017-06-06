## 介绍

http://vkitty.org/



## vkitty是什么

vkitty是一种前端构建工具。取名自hello kitty，其希望能够打造成一个简单、灵活的前端构建工具。

与其他工具相比，他语义化，更加灵活，更加高效，扩展性高，可适用于小到组件开发，大到商城页面构建，可配合现在市场上主流的库和框架，如vue、react、jquery。



## 特点

* 简单-没有大量而复杂的配置，使用结构类似gulp，并语义化完成代码架构及打包，对项目管理非常友善，方便修改和交接。
* 灵活-通过独有loaders解决方案，可以构建出各种开发者期望的结果。
* 强大-支持自定义loaders，强力支持gulp海量插件，支持预变量处理，拥有非常方便的钩子loader。
* 快速-vkitty使用反向编译机制，简单的说就是只会编译修改了的文件和被其影响到的文件，所以大型项目开发也能快速编译。

对比起webpack

优点：学习难度低，灵活，配置简单，编译速度快，文件结构会更加合理，打包的代码体积小，海量插件。

缺点：暂不支持es6 to es5(真心不理解用es6去写es5代码)，错误提示不够友好，另外就是没经过时间考验，可能会出现不稳定情况。

题外：如果写一个小小的组件都要用到webpack，那将是如何的酸爽/(ㄒoㄒ)/~~



## 更多内容

[查看api](http://docs.vkitty.org/)  [问题反馈](https://github.com/vkitty/vkitty/issues)




## 安装
```shell
npm install vkitty --save
```



## 简单demo

```javascript
const kitty = require('vkitty');
const gulp = require('gulp');
const loaders = kitty.loaders;

gulp.task('dev',function(){
    loaders.beforeCompile = function(content){
        content = content.replace(/#apiHost#/g,'http://mock.weidian.com/');
        return content;
    };
    //watch方式
    kitty.watch('./demo/*/index.html')
        .pipe(kitty.dest('./build'))//主文件生成目录
        .pipe(kitty.cdnDest('./build/static'))//资源文件生成目录
});

gulp.task('prod',function(){
    loaders.beforeCompile = function(content){
        content = content.replace(/#apiHost#/g,'https://weidian.com/');
        return content;
    };
    //普通方式
    kitty.src('./demo/*/index.html')
        .pipe(kitty.dest('./build'))
        .pipe(kitty.cdnDest('./build/static'))
});
```



## changelogs

### v0.2.2
* 内置loaders.babel功能,支持es6 to es5


### v0.2.0
* 支持多个kitty.src\kitty.watch同时并且可混合使用
* 修复了反向编译不稳定情况



### v0.1.1

* 去除resourceDest配置
* 增加kitty.cdnDest函数


### v0.1.0

* 改名v-kitty为vkitty
* 重构了代码结构
* 内置src功能
* 去除config.watch改成kitty.watch
* 其他一些bug fix