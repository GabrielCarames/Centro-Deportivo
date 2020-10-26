const Sequelize = require("sequelize");
const dbConfig = require("../config/config.js");

const sequelize = new Sequelize(
    dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        dialect: dbConfig.DIALECT,
    });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Ofertas = require("./ofertas")(sequelize, Sequelize);
db.Comments = require("./comments")(sequelize, Sequelize);
db.Users = require("./users")(sequelize, Sequelize);
db.Reports = require("./reports")(sequelize, Sequelize);
db.Userscomments = require("./userscomments")(sequelize, Sequelize);
db.Usersposts = require("./usersposts")(sequelize, Sequelize);
db.Users.belongsToMany(db.Comments, {
    through: db.Userscomments,
    as: "comment",
    foreignKey: "userid",
});
db.Comments.belongsToMany(db.Users, {
    through: db.Userscomments,
    as: "user",
    foreignKey: "commentid", 
});
db.Users.belongsToMany(db.Ofertas, {
    through: db.Usersposts,
    as: "oferta",
    foreignKey: "userid",
});
db.Ofertas.belongsToMany(db.Users, {
    through: db.Usersposts,
    as: "user",
    foreignKey: "postid", 
});

module.exports = db;