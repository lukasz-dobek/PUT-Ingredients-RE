const { Client } = require('@elastic/elasticsearch')

// docker run --rm --name database -d -p 5433:5432 -v $HOME/docker/volumes/postgres:/var/lib/postgresql/data postgres


// docker run -d --network host --name elastic --rm -e"http.port=10000" -e "discovery.type=single-node" elasticsearch:7.4.0 // moze potrzeba volume?


module.exports = class ElasticSearchHandler {

    constructor(address = 'http://localhost:10000') {
        this.client = new Client({ node: address });
        this.indexDocuments();
    }

    async indexDocuments() {
        await this.client.index({
            index: 'users',
            body: {
                'user': 43,
                'favourites': [1, 2, 3],
            }
        });
    }

    async readDocuments() {
        const { body } = await this.client.search({
            index: 'users',
            // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
            body: {
                query: {
                    match: { user: 43 }
                }
            }
        });
        return body.hits.hits;
    }
}