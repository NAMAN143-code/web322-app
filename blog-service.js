const Sequelize = require("sequelize");
var sequelize = new Sequelize('d2fa3kiofh0hdh', 'dssbevcizmhpau', '6404982352b12ebf7040228f10d9ecb16d38d38f7c930d889cd82d846d14ffbf', {
    host: 'ec2-18-215-96-22.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define('Post', {
    title: Sequelize.STRING,
    body: Sequelize.TEXT,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, { foreignKey: 'category' });

module.exports.initialize = () => {

    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            sequelize
                .authenticate()
                .then(resolve("connection established succesfully"))
                .catch((error) => { reject('unable to sync the database') })
        });
    });
}

module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll().then(() => { resolve(); }).catch((error) => { reject("no results returned") })
    });
};
module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({ where: published == true })
            .catch((error) => {
                reject("no results returned")
            });
    });
}

module.exports.getCategories = function() {

    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(data => resolve(data))
            .catch(err => reject('No results in return | Error: ' + err))
    });
}

module.exports.getPublishedPostsByCategory = function(category) {

    return new Promise((resolve, reject) => {

        Post.findAll({
                where: {
                    published: true,
                    category: category // changes tbd if the posts table cant fetch the data after clicking on category in row. 
                }
            })
            .then(data => resolve(data))
            .catch(err => reject('No results in return | Error: ' + err))
    });
}


module.exports.addPost = (postData) => {

    return new Promise((resolve, reject) => {

        postData.published = (postData.published) ? true : false;

        for (let i in postData) {
            if (postData[i] == "") { postData[i] = null; }
        }

        postData.postDate = new Date();

        Post.create(postData)
            .then(resolve(Post.findAll()))
            .catch(reject('Post was not created'))
    });
}

//Function to be completed.
module.exports.getPostsByCategory = (category) => {

    return new Promise((resolve, reject) => {
        Post.findAll({
                where: {
                    category: category
                }
            })
            .then(data => resolve(data))
            .catch(err => reject('No results in return | Error:' + err))
    });
};

module.exports.getPostsByMinDate = (minDateStr) => {

    return new Promise((resolve, reject) => {
        Post.findAll({
                where: {
                    postDate: {
                        [gte]: new Date(minDateStr)
                    }
                }
            })
            .then(data => resolve(data))
            .catch(err => reject('No results in return | Error:' + err))
    });
}

module.exports.getPostById = (id) => {

    return new Promise((resolve, reject) => {
        Post.findAll({
                where: {
                    id: id
                }
            })
            .then(data => resolve(data[0]))
            .catch(err => reject('No results in return | Error:' + err))
    });
}

module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        for (let i in categoryData) {
            if (categoryData[i] == "") { categoryData[i] = null; }
        }
        Category.create(categoryData)
            .then(resolve())
            .catch(reject('unable to create Category'))

    })
}

module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
                where: { id: id }
            })
            .then(resolve())
            .catch((err) => reject(err))
    })
}

module.exports.deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: { id: id }
        }).then(resolve()).catch(err => reject(err))

    })
}