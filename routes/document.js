const express = require('express');
const request = require('request');

const ElasticSearchHandler = require('../ElasticSearchHandler');
const handler = new ElasticSearchHandler();
var router = express.Router();

router.get('/:id', (req, res) => {
  handler.readDocumentByID(req.params.id).then(result => {
    res.send(result);
  });
});

router.post('/:id', (req, res) => {
  const { body } = req;
  handler.indexDocuments('users', req.params.id, body).then(result => {
    res.send(result);
  }).catch(error => {
    console.log(error);
  });
});

router.delete('/:id', (req, res) => {
  handler.deleteDocument(req.params.id).then(result => {
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
