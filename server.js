const exphbs = require("express-handlebars");
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
app.engine('.hbs', exphbs.engine({

    extname: '.hbs',

    defaultLayout: "main",

    helpers: {

        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },


        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
    }
}));
app.set('view engine', '.hbs');

function onHttpStart() {
    console.log("Express http server listening on port : " + HTTP_PORT);
}
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
    app.locals.viewingCategory = req.query.category;
    next();
});
app.get("/", (req, res) => {
    res.redirect('/about');
    res.send("Hello World<br /><a href='/about'>Go to the about page</a>");
});

app.get("/about", function(req, res) {
    res.render(path.join(__dirname, "/views", "about.hbs"));
});

app.get("/blog", function(req, res) {
    blog_service.getPublishedPosts().then((obj) => {
        res.send(obj);
    }).catch((err) => {
        res.send("500 : internal server error" + err);
    });
});

app.get("/posts", function(req, res) {
    if (req.query.category) {
        blog_service.getPostsByCategory(req.query.category).then((data) => {
            res.render("posts", { posts: data });
        }).catch((err) => {
            res.render("posts", { message: "no results" });
        });
    } else if (req.query.minDate) {
        blog_service.getPostsByMinDate(req.query.minDate).then((data) => {
            res.render("posts", { posts: data });
        }).catch((err) => {
            res.render("posts", { message: "no results" });
        });
    } else {
        blog_service.getAllPosts().then((data) => {
            res.render("posts", { posts: data });
        }).catch((err) => {
            res.send("500 : internal server error" + err);
        });
    }

});

app.get("/post/:value", (req, res) => {
    blog_service.getPostById(req.params.value).then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({ message: err });
    });
});

app.get("/categories", function(req, res) {
    blog_service.getCategories().then((obj) => {
        res.send(obj);
    }).catch((err) => {
        res.send("500 : internal server error" + err);
    });
});

app.get("/posts/add", (req, res) => {
    res.render(path.join(__dirname, "/views", "addPost.hbs"));
});

app.post("/posts/add", upload.single("featureImage"), (req, res, next) => {
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

app.use((req, res) => {
    res.status(404).send("404 : Page Not Found");
});


blog_service.initialize().then((obj) => {
    app.listen(HTTP_PORT, onHttpStart());
}).catch((err) => {
    console.log(err);
});