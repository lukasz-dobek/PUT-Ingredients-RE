const { Client } = require('@elastic/elasticsearch')

// docker run --rm --name database -d -p 5433:5432 -v $HOME/docker/volumes/postgres:/var/lib/postgresql/data postgres

// docker run -d --network host --name elastic --rm -e"http.port=10000" -e "discovery.type=single-node" elasticsearch:7.4.0 // moze potrzeba volume?

module.exports = class ElasticSearchHandler {

    constructor(address = 'http://localhost:10000') {
        this.client = new Client({ node: address });
    }

    async clusterHealth() {
        const { body } = await this.client.cat.nodes({
            format: 'json',
        });
        return body;
    }

    async indexDocuments(index, id, favourite) {
        let documentChecker;
        try {
            documentChecker = await this.readDocumentByID(id);
        } catch (error) {
            return error;
        }
        let isDocumentPresent = documentChecker["body"]["found"] ? true : false;
        if (isDocumentPresent) {
            let formerDocumentData = documentChecker["body"]["_source"]["favourites"];
            let consecutiveDocumentData = formerDocumentData.concat(",", favourite["favourites"]);
            let updateDocumentBody = {
                doc: {
                    favourites: consecutiveDocumentData
                }
            };

            let updateDocumentIndex = {
                index: index,
                id: id,
                body: updateDocumentBody,
            }

            let documentUpdatingResult;

            try {
                documentUpdatingResult = await this.client.update(updateDocumentIndex);
            } catch (updatingError) {
                return updatingError;
            }
            return documentUpdatingResult;
            
        } else {
            let newDocumentBody = {
                favourites: favourite["favourites"]
            };

            let newDocumentIndex = {
                index: index, 
                id: id,
                body: newDocumentBody,
            };
            
            let documentIndexingResult;

            try {
                documentIndexingResult = await this.client.index(newDocumentIndex);
            } catch(indexingError) {
                return indexingError;
            }
            return documentIndexingResult;
        }
    }

    async readDocumentByID(id) {
        const documentToBeRead = {
            id: id,
            index: 'users',
        }
        let readDocument;
        try {
            readDocument = await this.client.get(documentToBeRead);
        } catch (error) {
            return error;
        }
        return readDocument;
    };

    async deleteDocument(id) {
        const documentToBeDeleted = {
            id: id,
            index: 'users',
        }
        let deletedDocument;
        try {
            deletedDocument = this.client.delete(documentToBeDeleted);
        } catch (error) {
            return error;
        }
        return deletedDocument;
    }
}