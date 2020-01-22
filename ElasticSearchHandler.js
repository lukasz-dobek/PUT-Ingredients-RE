const { Client } = require('@elastic/elasticsearch')

module.exports = class ElasticSearchHandler {

    constructor(address = 'http://localhost:9200') {
        this.client = new Client({ node: address });
    }

    async createIndex(indexName, indexMapping) {
        let promise = await this.client.indices.exists({
            index: indexName,
        });
        if (promise.statusCode === 404) {
            try {
                let createIndexPromise = await this.client.indices.create({
                    index: indexName,
                    body: indexMapping,
                });
            } catch (indexCreatingError) {
                console.log(indexCreatingError);
                return false;
            }
            return true;
        } else {
            return false;
        }
    }

    async clusterHealth() {
        const { body } = await this.client.cat.nodes({
            format: 'json',
        });
        return body;
    }

    async isDocumentPresent(documentIndex, documentID) {
        let documentChecker;
        try {
            documentChecker = await this.readDocumentByID(documentIndex, documentID);
        } catch (error) {
            console.log(`ResponseError in ${this.name}`);
        }
        let isDocumentPresent = documentChecker["body"]["found"] ? true : false;
        let documentPresence = {
            isDocumentPresent: isDocumentPresent,
            document: documentChecker,
        }
        return documentPresence;
    }

    async indexDocuments(document) {

        let documentIndexingResult;

        try {
            documentIndexingResult = await this.client.index(document);
        } catch (indexingError) {
            return indexingError;
        }
        return documentIndexingResult;
    }

    async readDocumentByID(documentIndex, documentID) {
        const documentToBeRead = {
            index: documentIndex,
            id: documentID,
        }
        let readDocument;
        try {
            readDocument = await this.client.get(documentToBeRead);
        } catch (error) {
            return error;
        }
        return readDocument;
    };

    async deleteDocument(documentIndex, documentID) {
        const documentToBeDeleted = {
            index: documentIndex,
            id: documentID,
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