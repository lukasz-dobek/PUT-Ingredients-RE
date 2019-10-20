const express = require('express');
const request = require('request');

const ElasticSearchHandler = require('../ElasticSearchHandler');
const handler = new ElasticSearchHandler();
const router = express.Router();

const documentIndexName = 'recipes';
const documentIndexMapping = {
  "mappings": {
    "properties": {
      "fans": { "type": "text" }
    }
  }
}

if (handler.createIndex(documentIndexName, documentIndexMapping) === true) {
  console.log(`Created index: ${documentIndexName}`);
} else {
  console.log(`Index: ${documentIndexName} already exists or error happened`);
}

router.get('/:id', (req, res) => {
  handler.readDocumentByID(documentIndexName, req.params.id).then(result => {
    res.send(result);
  });
});

const handlePost = async (documentIndex, documentID, fan) => {
  let documentPresenceObject = await handler.isDocumentPresent(documentIndex, documentID);

  let documentPresenceFlag = documentPresenceObject.isDocumentPresent;
  if (documentPresenceFlag) {
    let formerDocumentData = documentPresenceObject.document["body"]["_source"]["fans"];
    let consecutiveDocumentData = formerDocumentData.concat(",", fan["fans"]);
    let updateDocumentBody = {
      fans: consecutiveDocumentData

    };

    let updateDocumentIndex = {
      index: documentIndex,
      id: documentID,
      body: updateDocumentBody,
    }

    return updateDocumentIndex;

  } else {

    let newDocumentBody = {
      fans: fan["fans"]
    };

    let newDocumentIndex = {
      index: documentIndex,
      id: documentID,
      body: newDocumentBody,
    };

    return newDocumentIndex;
  }
}

router.post('/:id', async (req, res) => {
  const { body } = req;
  let documentBody = await handlePost(documentIndexName, req.params.id, body);
  handler.indexDocuments(documentBody).then(result => {
    res.send(result);
  }).catch(error => {
    console.log(error);
  });
});

router.delete('/:id', (req, res) => {
  handler.deleteDocument(documentIndexName, req.params.id).then(result => {
    res.send(result);
  });
});

module.exports = router;
