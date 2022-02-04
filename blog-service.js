const posts = new Array();
const categories = new Array();
const fs = require('fs');


function initialize() {
    fs.readFile('./data/posts.json','utf-8',function (err,data) {
        if(err) throw err;
        const obj = JSON.parse(data);
        return obj;
    });
}

module.exports = { initialize };