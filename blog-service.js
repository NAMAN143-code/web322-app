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
    sequelize.sync().then(() => {
        return new Promise((resolve, reject) => {
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
asdasda
module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        reject();
    });
}

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        reject();
    });
}

module.exports.getPublishedPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        reject();
    });
}


module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        reject();
    });
};

module.exports.getPostsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        reject();
    });
};

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        reject();
    });
};

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        reject();
    });
};