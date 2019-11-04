const express = require('express');
const request = require('request');

const ElasticSearchHandler = require('../ElasticSearchHandler');
const handler = new ElasticSearchHandler();
const router = express.Router();


// Czy potrzebny indeks? Zastanowic sie
const documentIndexName = 'recommendations';
const documentIndexMapping = {
  "mappings": {
    "properties": {
      "recipes": { "type": "text" }
    }
  }
}

if (handler.createIndex(documentIndexName, documentIndexMapping) === true) {
  console.log(`Created index: ${documentIndexName}`);
} else {
  console.log(`Index: ${documentIndexName} already exists or error happened`);
}

router.get('/:id', (req, res) => {
  collaborativeFiltering(req.params.id).then(result => {
    res.send(result);
  });
});

const collaborativeFiltering = async requestedUserID => {
  let suggestedRecipes = [];

  try {
    console.log("Starting collaborative filtering...");
    let userDocument = await handler.readDocumentByID('users', requestedUserID);
    if (userDocument.statusCode === 200) {
      let recipesLikedByUser = userDocument["body"]["_source"]["favourites"].split(",");
      let recipesAndWhoLikedThem = recipesLikedByUser.map(recipeId => {
        return {
          recipe: recipeId,
          users: [],
        }
      });


      for (const recipeObject of recipesAndWhoLikedThem) {
        let tempPromise = await handler.readDocumentByID('recipes', recipeObject["recipe"]);
        recipeObject["users"] = tempPromise["body"]["_source"]["fans"].split(",");

        for (const userID of recipeObject["users"]) {
          if (userID != requestedUserID) {
            let otherUserDocument = await handler.readDocumentByID('users', userID);
            let recipesLikedByOtherPerson = otherUserDocument["body"]["_source"]["favourites"].split(",");
            let difference = recipesLikedByOtherPerson.filter(x => !recipesLikedByUser.includes(x));
            for (const recipe of difference) {
              if (!suggestedRecipes.includes(recipe)) {
                suggestedRecipes.push(recipe);
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  } finally {
    return suggestedRecipes;
  }
};

module.exports = router;
