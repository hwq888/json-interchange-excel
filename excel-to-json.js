var xlsx = require("node-xlsx");
var fs = require('fs');
var jsFile = require('./demo/zh.js')
var list = xlsx.parse("./demo/zh_en.xlsx"); // 需要 转换的excel文件
// 数据处理 方便粘贴复制
var excelData = list[0].data;  // 1.读取json数据到变量暂存
// console.log('----excelData-----')
// console.log(excelData)
//
// console.log('----jsFile-----')
// console.log(jsFile)

Array.prototype.flat = function(count) {
    let c = count || 1;
    let len = this.length;
    let exe = [];
    if (this.length == 0) return this;
    while (c--) {
        let _arr = [];
        let flag = false;
        if (exe.length == 0) {
            flag = true;
            for (let i = 0; i < len; i++) {
                if (this[i] instanceof Array) {
                    exe.push(...this[i]);
                } else {
                    exe.push(this[i]);
                }
            }
        } else {
            for (let i = 0; i < exe.length; i++) {
                if (exe[i] instanceof Array) {
                    flag = true;
                    _arr.push(...exe[i]);
                } else {
                    _arr.push(exe[i]);
                }
            }
            exe = _arr;
        }
        if (!flag && c == Infinity) {
            break;
        }
    }
    return exe;
}

// 获取对象子级所有非对象的值
function getValues(obj) {
    for (let item in obj) {
        if (typeof obj[item] === 'object') {
            getValues(obj[item])
        } else {
            if (isNaN(obj[item]) === true) {
                let pathOut = ''
                // 获取值所在的key
                const path = searchKey(jsFile, obj[item])
                if (path.length > 0 ) {
                    pathOut = path.join('.')
                }
                // js文件的值和excel的中文对比
                verificationValues(pathOut, obj[item])
            }
        }
    }
}

// 查询对象key
function searchKey(object, value) {
    for (var key in object) {
        if (object[key] === value) return [key];
        if (typeof(object[key]) == "object") {
            var temp = searchKey(object[key], value);
            if (temp) {
                return [key, temp].flat();
            }
        }
    }
}

// 比较中文相等
function verificationValues (path, text, callback) {
    // console.log('--path--text---')
    // console.log(path, text)
    excelData.forEach((item) => {
        // 找到相等的值
        if (item[0] === text) {
            if (item[1]) {
                // console.log(`把【${text}】替换成【${item[1]}】`)
                // 开始替换对应的值
                replaceValues(path,item[1])
            } else {
                // 找不到替换的值
                console.warn(`【${text}】替换失败`)
            }
        }
    })
}

// 替换对应的值
function replaceValues(path, newValue) {
    const arr = path.split('.')
    const len = arr.length - 1
    arr.reduce((cur, key, index) => {
        if (!(cur[key])){
            // 路径不正确or对象没有相关属性等
            throw `${key} 不存在!`
        }
        if (index === len) {
            cur[key] = newValue
        }
        return cur[key]
    }, jsFile)
}

// 执行导入文件循环
getValues(jsFile)

// console.log('----结果输出-----')
// string：换行
let outputJson = JSON.stringify(jsFile,null,"\t")
// 正则替换
outputJson =  outputJson.replace(/"(.+)":/g, '$1:')
outputJson =  outputJson.replace(/"(.+)"/g, "\'$1\'")
// console.log('--输出json---')
// console.log(json)
writeFile("./demo/zh_en.js",outputJson); // 输出的json文件 3.数据写入本地json文件
function writeFile(fileName,data) {
    fs.writeFile(fileName,data,{
        encoding: "utf8",
        flag: "w",
        mode: 0o666
    },complete);  // 文件编码格式 utf-8
    function complete(err) {
        if(!err) {
            console.log("文件生成成功");  // 终端打印这个 表示输出完成
        }
    }
}
