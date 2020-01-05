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
  try {
    let documentPresenceObject = await handler.isDocumentPresent(documentIndex, documentID);
    let documentPresenceFlag = documentPresenceObject.isDocumentPresent;
    if (documentPresenceFlag) {
      let isThereData = documentPresenceObject.document["body"]["_source"]["fans"] ? true : false;
      console.log(isThereData);
      if (isThereData) {
        let formerDocumentData = documentPresenceObject.document["body"]["_source"]["fans"];
        let consecutiveDocumentData;
        if (formerDocumentData === "") {
          consecutiveDocumentData = fan["fans"];
        } else {
          consecutiveDocumentData = formerDocumentData.concat(",", fan["fans"]);
        }

        let updateDocumentBody = {
          fans: consecutiveDocumentData
        };

        updateDocumentIndex = {
          index: documentIndex,
          id: documentID,
          body: updateDocumentBody,
        }
      } else {
        let updateDocumentBody = {
          fans: fan["fans"]
        };

        updateDocumentIndex = {
          index: documentIndex,
          id: documentID,
          body: updateDocumentBody,
        }
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
  } catch (er) {
    if (er) console.log("recipes post response error");
  } 
}

const handleDelete = async (documentIndex, documentID, favourite) => {
  let documentPresenceObject = await handler.isDocumentPresent(documentIndex, documentID);

  let formerDocumentData = documentPresenceObject.document["body"]["_source"]["fans"];
  console.log(formerDocumentData);
  let formerDocumentArray = formerDocumentData.split(',');
  let consecutiveDocumentArray = formerDocumentArray.filter(element => {
    return element != favourite["fans"];
  });

  let consecutiveDocumentData = consecutiveDocumentArray.join(',');
  
  let updateDocumentBody = {
      favourites: consecutiveDocumentData
  };

  let updateDocumentIndex = {
    index: documentIndex,
    id: documentID,
    body: updateDocumentBody,
  }

  return updateDocumentIndex;
}


router.post('/:id', async (req, res) => {
  const { body } = req;
  let documentBody = await handlePost(documentIndexName, req.params.id, body);
  handler.indexDocuments(documentBody).then(result => {
    res.send(result);
  }).catch(error => {
    console.log("err post recipe");
  });
});

router.delete('/:id', async (req, res) => {
  let documentBody = await handleDelete(documentIndexName, req.params.id, req.body);
  handler.indexDocuments(documentBody).then(result => {
    res.send(result);
  }).catch(error => {
    console.log("err delete recipe");
  });
});

module.exports = router;
