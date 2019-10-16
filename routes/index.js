const express = require('express');
const request = require('request');

const ElasticSearchHandler = require('../ElasticSearchHandler');
const handler = new ElasticSearchHandler();
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/cluster_status', (req, res) => {
  request('http://localhost:10000/_cat/nodes?v', (error, response, body) => {
    console.error('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
    res.send(body);
  });
});

router.get('/sample', (req, res) => {
  handler.readDocuments().then(result => {
    res.send(result);
  });
});

router.get('/test', (req, res) => {
  request('http://localhost:3000/api/favourites/user_email/ingredients@op.pl', (error, response, body) => {
    console.error('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
    res.json(JSON.parse(body));
  });
});

module.exports = router;
