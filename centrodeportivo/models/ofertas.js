module.exports = (sequelize, Sequelize) => {
    const Ofertas = sequelize.define("ofertas",
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        price: Sequelize.STRING,
        filter: Sequelize.STRING,
        category: Sequelize.STRING,
        likes: Sequelize.INTEGER,
        dislikes: Sequelize.INTEGER,
        iduser: Sequelize.INTEGER,
        idcomment: Sequelize.INTEGER
    }
    );
    return Ofertas;
};