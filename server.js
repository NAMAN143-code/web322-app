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
var express = require("express");
const res = require("express/lib/response");
const blog_service = require("./blog-service.js");
const Posts = require("./data/posts.json");
const Categories = require("./data/categories.json");
const path = require('path');
var app = express();
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
    res.json(Posts.filter(({ published }) => published === true));
});

app.get("/posts", function(req, res) {
    res.json(Posts);
});

app.get("/categories", function(req, res) {
    res.json(Categories);
});

app.use((req,res) =>{
    res.status(404).send("404 : Page Not Found");
});

app.listen(HTTP_PORT,onHttpStart);
