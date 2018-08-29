const rp = require('request-promise');
const chalk = require('chalk');
const tests = require('./tests');

const ES_BASE_URL = 'http://apis.labs.jupiter.bbc.co.uk:9200';
const ES_INDEX = 'radiodicer';
const ES_TYPE = 'results';

const searchQuery = {
    query: { match_all: {} },
    sort: [
        'brand',
        'name',
        'date'
    ],
    size: 500
};

const padNumber = (latestResult, unit, compareTo) => {
    let comparison;
    if (compareTo !== undefined) {
        comparison = `(${(latestResult - compareTo).toFixed(3)}${unit})`;
    }
    const numberString = `${latestResult.toFixed(3)}${unit} ${comparison ? comparison : ''}`;
    return numberString.padEnd(22);
};

const printResults = (results, latestResults) => {
    let brand, name;
    results.hits.hits.forEach((result, index, resultsArray) => {
        const { _source } = result;
        const { mean, median, matchPercent } = _source;
        if (brand !== _source.brand) {
            brand = _source.brand;
        }
        if (name !== _source.name) {
            name = _source.name;
            console.log(`\n-------------------------------------\n  ${brand} ${name}\n-------------------------------------`);
            console.log('| Mean difference (s)   | Median difference (s) | Match Error (%)       |');
        }
        console.log(`| ${padNumber(mean, 's')}| ${padNumber(median, 's')}| ${padNumber(100 - matchPercent, '%')}|`);

        //if we've reached the last result for the current programme, print the latestResults for the programme
        if ((index < resultsArray.length - 1 && name !== resultsArray[index + 1]._source.name) || index === resultsArray.length - 1) {
            const latestResult = latestResults.find(result => result.brand === brand && result.name === name);
            console.log('-------------------------------------------------------------------------');
            if (latestResult) {
                console.log(chalk.red(`| ${padNumber(latestResult.mean, 's', mean)}| ${padNumber(latestResult.median, 's', median)}| ${padNumber(100 - latestResult.matchPercent, '%', 100 - matchPercent)}|`));
                if (latestResult.storiesFalselyFound > 0) {
                    console.log(`Stories falsely found: ${latestResult.fullStories.filter(story => story.matchType === 'STORY_FALSELY_FOUND').map(story => `\n - Story: ${story.name}, aligned time: ${story.alignedTime}, confidence: ${story.confidenceScore.toFixed(3)}`)}`);
                }
                if (latestResult.storiesNotFound > 0) {
                    console.log(`Stories not found: ${latestResult.fullStories.filter(story => story.matchType === 'STORY_NOT_FOUND').map(story => `\n - Story: ${story.name}, confidence: ${story.confidenceScore.toFixed(3)}`)}`);
                }
                if (latestResult.matchPercent < 100) {
                    console.log(`Stories misaligned: ${latestResult.fullStories.filter(story => story.matchType === 'STORY_MISALIGNED').map(story => `\n - Story: ${story.name}, actual time: ${story.actualTime}, aligned time: ${story.alignedTime}, confidence: ${story.confidenceScore.toFixed(3)}`)}`);
                }
            } else {
                console.log('No new results.');
            }
        }
    });
};

const getResults = () => {
    const options = {
        uri: `${ES_BASE_URL}/${ES_INDEX}/${ES_TYPE}/_search`,
        headers: {
            'Accept': 'application/json',
        },
        method: 'POST',
        body: searchQuery,
        json: true
    };

    const latestResults = tests.benchmark();
    return rp(options)
        .then(function (pastResults) {
            printResults(pastResults, latestResults);
        })
        .catch(function (err) {
            console.error('Error fetching results from Elasticsearch: ', err);
        });
}

getResults();
