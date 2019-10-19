// ES6 import

// import express from 'express';
// import path from 'path';
// import cookieParser from 'cookie-parser';
// import logger from 'morgan';

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const documentRouter = require('./routes/document');
const ElasticSearchHandler = require('./ElasticSearchHandler');
const handler = new ElasticSearchHandler();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/document/', documentRouter);

app.get('/status', (req, res) => {
    handler.clusterHealth().then(result => {
        res.send(result);
      });
});

module.exports = app;