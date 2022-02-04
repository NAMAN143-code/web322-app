var posts = [];
var categories = [];
const fs = require('fs');

function initialize(){
    return new Promise((resolve, reject) => {

        fs.readFile('./data/posts.json', 'utf8', (err, p_data) => {
            if (err) {
                reject("Data not found");
            } else {
                posts = JSON.parse(p_data);
                resolve("Success");
            }
        });

        fs.readFile('./data/categories.json', 'utf8', (err, c_data) => {

            if (err) {
                reject("Data not found");
            } else {
                categories = JSON.parse(c_data);
                resolve("Success");
            }
        });
    });
}

function getAllPosts(){
    return new Promise((resolve, reject) => {
        if (posts == 0) {
            reject('Data not found');
        } else {
            resolve(posts);
        }
    });
}

function getPublishedPosts(){
    return new Promise((resolve, reject) => {
        var post_Published = posts.filter(({ published }) => published === true);
        if (post_Published === 0) {
            reject("Data not found");
        } else {
            resolve(post_Published);
        }
    });
}

function getCategories(){
    return new Promise((resolve, reject) => {
        if (categories === 0) {
            reject("Data not found");
        } else {
            resolve(categories);
        }
    });
}

module.exports = { initialize, getAllPosts, getPublishedPosts, getCategories };