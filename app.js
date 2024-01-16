var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

const mongooes=  require('mongoose');
const createError =  require('http-errors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
require('./socket-hamdler');


app.use('/', indexRouter);


// router from router folder
app.use('/api/auth', require('./routes/auth'));

app.use((err, req, res, next) => {
    if (req.get('accept').includes('json')){
        return next(createError(400))
    }
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'))
});

app.use((err, req ,res, next) => {
    if (err.name === 'MongoError' || err.name === 'ValdationError' || err.name === 'CastError'){
        err.status = 422;
    }
    res.status(err.status || 500).json({message: err.message || 'some error eccured.'})
});

app.use('/users', usersRouter);
app.use('/api/account', require('./routes/account'))

mongooes.connect(process.env.DB_URL, {useNewUrlParser: true, useCreateIndex: true}, err =>{
    if(err) throw err;
    console.log('Connected Successfuly')
    
})
module.exports = app;
