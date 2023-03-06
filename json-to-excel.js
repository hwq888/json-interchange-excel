/***
 * DATE:2023-03-03
 * DES：把json文件转为对应的excel文件
 * ****/
var jsFile = require('./demo/zh.js')
var xlsx = require('xlsx')
// var fs = require('fs')
var lodash = require('lodash')


// 获取对象子级所有非对象的值
var arrValue = []
function getValues(obj) {
    for (let item in obj) {
        if (typeof obj[item] === 'object') {
            getValues(obj[item])
        } else {
            //  函数用于检查其参数是否是非数字值
            if (isNaN(obj[item]) === true) {
                arrValue.push(obj[item])
            }

        }
    }
}
getValues(jsFile)

// 去重
const uniqArr = lodash.uniq(arrValue)

//导出格式：数组一行
let arrValueIndexData = []
uniqArr.forEach((item, index) =>{
    arrValueIndexData.push([item])
})
// console.log('---arrValueIndexData----')
// console.log(arrValueIndexData)
var sheet = xlsx.utils.aoa_to_sheet(arrValueIndexData)
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, sheet, 'Sheet1');
xlsx.writeFileSync(wb, './demo/zh.xlsx')

