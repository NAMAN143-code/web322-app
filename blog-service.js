var posts = [];
var categories = [];
const fs = require('fs');
const { resolve } = require('path');

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
        if (posts.length == 0) {
            reject('Data not found');
        } else {
            resolve(posts);
        }
    });
};

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
        if (categories.length == 0) {
            reject("Data not found");
        } else {
            resolve(categories);
        }
    });
}
module.exports = { initialize, getAllPosts, getPublishedPosts, getCategories };

module.exports.addPost = (postData) => {
    postData.published == undefined ? postData.published = false : postData.published = true;
    postData.id = posts.length + 1;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    postData.postDate = today;
    posts.push(postData);

    return new Promise((resolve, reject) =>{
        if(posts.length == 0){
            reject('No Result');
        } else{
            resolve(posts);
        }
    });
};

module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve,reject) => {
        var cat = posts.filter(posts => posts.category == category);
        if(cat.length == 0){
            reject("Category Data Not Found");
        } 
        resolve(cat);
    });
};

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve,reject) => {
        var post = posts.filter(post => post.postDate >= minDateStr);
        if(post.length == 0){
            reject("No data found");
        }
        resolve(post);
    });
};

module.exports.getPostById = (id) => {
    return new Promise((resolve,reject) => {
        var postById = posts.filter(posts => posts.id == id);
        if (postById.length == 0) {
            reject('no post found');
        }
        resolve(postById);
    });
};