/*****************************************************************************
****
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
No part * of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students.
* 
* Name: ___Burhanuddin.Kutbuddin.Chunawala__ Student ID: ___156718207___ Date: __02/04/2022__
*
* Online (Heroku) URL: https://murmuring-lowlands-00848.herokuapp.com/
*
* GitHub Repository URL: https://github.com/Burhanchuna/web322-app
*
******************************************************************************
**/
const express = require("express");
const blog_service = require("./blog-service.js");
const path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({ 
    cloud_name: 'da1tu1ulp', 
    api_key: '194827692874383', 
    api_secret: 'uJojhgSbQIR8Zb74tX_GTsG2dRI' 
  });

const upload = multer();

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
    if(req.query.category){
        blog_service.getPostsByCategory(req.query.category).then((data) => {
            res.json({data});
        }).catch((err) => {
            res.json({message : err});
        });
    }
    else if(req.query.minDate){
        blog_service.getPostsByMinDate(req.query.minDate).then((data) => {
            res.json(data);
        }).catch((err) => {
            res.json({message : err});
        });
    }
    else{
        blog_service.getAllPosts().then((obj)=>{
            res.send(obj);
        }).catch((err) => {
            res.send("500 : internal server error" + err);
        });
    }
    
});

app.get("/post/:value",(req,res) =>{
    blog_service.getPostById(req.params.value).then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({message : err});
    });
});

app.get("/categories", function(req, res) {
    blog_service.getCategories().then((obj)=>{
        res.send(obj);
    }).catch((err)=>{
        res.send("500 : internal server error" + err);
    });
});

app.get("/posts/add", (req,res) => {
    res.sendFile(path.join(__dirname,"/views","addPost.html"));
});

app.post("/posts/add", upload.single("featureImage"),(req,res,next) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream((error, result) => {
                if (result) {
                    resolve(result)
                } else {
                    reject(error)
                }
            });
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    upload(req).then((uploaded) => {
        req.body.featureImage = uploaded.url;
        blog_service.addPost(req.body).then(() => {
            res.redirect("/posts");
        });
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
