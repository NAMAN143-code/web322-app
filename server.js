/**********************************************************************
* WEB322 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy.
* No part of this assignment has been copied manually or electronically from any other
source
* (including web sites) or distributed to other students.
*
* Name: _____Burhanuddin.Kutbuddin.Chunawala___________ Student ID: _____156718207_________ Date: ____02/04/2022____________
*
* Online (Heroku) URL: ________________  ____ https://stark-waters-12789.herokuapp.com/ deployed to Heroku____
************************************************************************
********/ 
const express = require("express");
const blog_service = require("./blog-service.js");
const path = require('path');
const app = express();
var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

function onHttpStart() {
    console.log("Express http server listening on port : " + HTTP_PORT);
}

app.get("/", (req, res) => {
    res.redirect('/about');
    res.send("Hello World<br /><a href='/about'>Go to the about page</a>");
});

app.get("/about",function (req,res) {
    res.sendFile(path.join(__dirname,"/views","about.html"));
});

app.get("/blog",function (req,res) {
    blog_service.getPublishedPosts().then((obj)=>{
        res.send(obj);
    }).catch((err)=>{
        res.send("500 : internal server error" + err);
    });
});

app.get("/posts", function(req, res) {
    blog_service.getAllPosts().then((obj)=>{
        res.send(obj);
    }).catch((err) => {
        res.send("500 : internal server error" + err);
    });
});

app.get("/categories", function(req, res) {
    blog_service.getCategories().then((obj)=>{
        res.send(obj);
    }).catch((err)=>{
        res.send("500 : internal server error" + err);
    });
});

app.use((req,res) =>{
    res.status(404).send("404 : Page Not Found");
});


blog_service.initialize().then((obj)=>{
    app.listen(HTTP_PORT,onHttpStart());
}).catch((err)=>{
    console.log(err);
});
