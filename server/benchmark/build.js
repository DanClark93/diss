const rp = require('request-promise');
const tests = require('./tests');

const ES_BASE_URL = 'http://apis.labs.jupiter.bbc.co.uk:9200';
const ES_INDEX = 'radiodicer';
const ES_TYPE = 'results';

const formatBulkRequest = (results) => {
    let body = '';
    results.forEach(result => {
        body += '{"index":{}}\n';
        body += JSON.stringify(result);
        body += '\n';
    })
    return body;
}

const bulkPostResults = () => {
    const results = tests.benchmark();

    const options = {
        uri: `${ES_BASE_URL}/${ES_INDEX}/${ES_TYPE}/_bulk`,
        headers: {
            'Content-Type': 'application/x-ndjson'
        },
        method: 'POST',
        body: formatBulkRequest(results)
    };

    return rp(options)
        .then(function (res) {
            console.log(res);
        })
        .catch(function (err) {
            console.error('Error posting results to Elasticsearch: ', err);
        });
}

bulkPostResults();
