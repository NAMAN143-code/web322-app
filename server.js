/*********************************************************************************
* WEB322 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Naman Sharma Student ID: 157151200 -Date:3/11/2022
*
* Online (Heroku) Link:
https://git.heroku.com/salty-crag-45626.git
*
********************************************************************************/
const exphbs = require("express-handlebars");
const express = require("express");
const blogData = require("./blog-service.js");
const path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const stripJs = require('strip-js');

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

        safeHTML: function(context) {
            return stripJs(context);
        },

        formatDate: function(dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
    }
}));
app.set('view engine', '.hbs');
app.use(express.urlencoded({ extended: true }));

function onHttpStart() {
    console.log("Express http server listening on port : " + HTTP_PORT);
}
app.use(function(req, res, next) {

    let route = req.path.substring(1);

    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));

    app.locals.viewingCategory = req.query.category;

    next();

});
app.get("/", (req, res) => {
    res.redirect('/blog');
});

app.get("/about", function(req, res) {
    res.render(path.join(__dirname, "/views", "about.hbs"));
});

app.get('/blog', async(req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try {

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0];

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData })

});

app.get("/posts", function(req, res) {


    if (req.query.category) {
        blogData.getPostsByCategory(req.query.category).then((data) => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            } else {
                res.render("posts", { message: "no results found" })
            }
        }).catch((err) => {
            res.render("posts", { message: "no results" });
        });
    } else if (req.query.minDate) {
        blogData.getPostsByMinDate(req.query.minDate).then((data) => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            } else {
                res.render("posts", { message: "no results found" })
            }
        }).catch((err) => {
            res.render("posts", { message: "no results" });
        });
    } else {
        blogData.getAllPosts().then((data) => {
            if (data.length > 0) {
                res.render("posts", { posts: data });
            } else {
                res.render("posts", { message: "no results found" })
            }
        }).catch(() => {
            res.render("posts", { message: "no results" });
        });
    }


});

app.get('/blog/:id', async(req, res) => {
    let viewData = {};
    try {
        let posts = [];
        if (req.query.category) {
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {

            posts = await blogData.getPublishedPosts();
        }

        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        viewData.posts = posts;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        viewData.post = await blogData.getPostById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await blogData.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }


    res.render("blog", { data: viewData })
});

app.get("/categories", function(req, res) {
    blogData.getCategories().then((data) => {
        if (data.length > 0) {
            res.render("categories", { categories: data });
        } else {
            res.render("categories", { message: "no results found" })
        }
    }).catch(() => {
        res.render("categories", { message: "no results" });
    });
});

app.get('/posts/add', (req, res) => {
    blogData.getCategories().then((categories) => {
        res.render('addPost', { categories: categories });
    }).catch(function(err) {
        res.render('addPost', { categories: [] });
    })
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
        blogData.addPost(req.body).then(() => {
            res.redirect("/posts");
        });
    });
});
//new routes - assignment 5
app.get("/categories/add", (req, res) => {
    res.render("addCategory");
})

app.post("/categories/add", (req, res) => {
    blogData.addCategory(req.body).then(
        res.redirect('/categories')
    ).catch(function(err) {
        res.render({ message: err });
    });
})

app.get("/category/delete/:id", (req, res) => {
    blogData.deleteCategoryById(req.params.id).then(
        res.redirect('/categories')
    ).catch(function(err) {
        res.status(500).send("Unable to Remove Category / Category not found");
    });
})

app.get("/post/delete/:id", (req, res) => {
    blogData.deletePostById(req.params.id).then(
        res.redirect('/posts')
    ).catch(function(err) {
        res.status(500).send("Unable to Remove Category / Category not found");
    });
})

app.use((req, res) => {
    res.status(404).render("404");
});


blogData.initialize().then((obj) => {
    app.listen(HTTP_PORT, onHttpStart());
}).catch((err) => {
    console.log(err);
});