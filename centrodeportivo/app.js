var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var exphbs  = require('express-handlebars');
const db = require("./models"); 
var inicioRouter = require('./routes/inicio');
var indexRouter = require('./routes/index');
var buscadorRouter = require('./routes/buscador');
var usersRouter = require('./routes/users');
var ticketsRouter = require('./routes/tickets');
var articuloseinstalacionesRouter = require('./routes/articuloseinstalaciones');
var buscadorRouter = require('./routes/buscador');
var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
db.sequelize.sync();

// motor de vista
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers: require('./config/functions')
}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/index', indexRouter);
app.use('/inicio', inicioRouter);
app.use('/users', usersRouter);
app.use('/tickets', ticketsRouter);
app.use('/articuloseinstalaciones', articuloseinstalacionesRouter);
app.use('/buscador', buscadorRouter);


 
module.exports = app;
