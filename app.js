const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const usersRouter = require('./routes/users');
const recipesRouter = require('./routes/recipes');
const recommendationsRouter = require('./routes/recommendations');

const ElasticSearchHandler = require('./ElasticSearchHandler');
const handler = new ElasticSearchHandler();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users/', usersRouter);
app.use('/recipes/', recipesRouter);
app.use('/recommendations/', recommendationsRouter);

app.get('/status', (req, res) => {
    handler.clusterHealth().then(result => {
        res.send(result);
      });
});

app.get('/test', (req, res) => {
  request('http://localhost:3000/api/favourites/user_email/ingredients@op.pl', (error, response, body) => {
    console.error('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
    res.json(JSON.parse(body));
  });
});

module.exports = app;