const rp = require('request-promise');
const fzt = require('../lib/fuzzyTextFinder');

const STORY_NOT_IN_RUNDOWN = 'STORY_NOT_IN_RUNDOWN';
const STORY_FALSELY_FOUND = 'STORY_FALSELY_FOUND';
const STORY_NOT_FOUND = 'STORY_NOT_FOUND';
const STORY_ALIGNED = 'STORY_ALIGNED';
const STORY_MISALIGNED = 'STORY_MISALIGNED';

const sixoclocks = [
    {
        name: '07-06-2018',
        input: require('../test/stubs/sixoclock/R4SixOClockNews-20180607.input.json'),
        actual: require('../test/stubs/sixoclock/R4SixOClockNews-20180607.actual.json'),
    },
    {
        name: '08-06-2018',
        input: require('../test/stubs/sixoclock/R4SixOClockNews-20180608.input.json'),
        actual: require('../test/stubs/sixoclock/R4SixOClockNews-20180608.actual.json')
    },
    {
        name: '09-06-2018',
        input: require('../test/stubs/sixoclock/R4SixOClockNews-20180609.input.json'),
        actual: require('../test/stubs/sixoclock/R4SixOClockNews-20180609.actual.json')
    },
    {
        name: '10-06-2018',
        input: require('../test/stubs/sixoclock/R4SixOClockNews-20180610.input.json'),
        actual: require('../test/stubs/sixoclock/R4SixOClockNews-20180610.actual.json')
    }
];

const worldatones = [
    {
        name: 'WATO-18-06-2018',
        input: require('../test/stubs/wato/WATO_180618.input.json'),
        actual: require('../test/stubs/wato/WATO_180618.actual.json')
    },
    {
        name: 'WATO-19-06-2018',
        input: require('../test/stubs/wato/WATO_190618.input.json'),
        actual: require('../test/stubs/wato/WATO_190618.actual.json')
    },
    {
        name: 'WATO-20-06-2018',
        input: require('../test/stubs/wato/WATO_200618.input.json'),
        actual: require('../test/stubs/wato/WATO_200618.actual.json')
    },
    {
        name: 'WATO-22-06-2018',
        input: require('../test/stubs/wato/WATO_220618.input.json'),
        actual: require('../test/stubs/wato/WATO_220618.actual.json')
    }
];

const womanshours = [
    {
        name: '09-06-2018',
        input: require('../test/stubs/womanshour/WH-20180609.input.json'),
        actual: require('../test/stubs/womanshour/WH-20180609.actual.json')
    },
    {
        name: '23-06-2018',
        input: require('../test/stubs/womanshour/WH-20180623.input.json'),
        actual: require('../test/stubs/womanshour/WH-20180623.actual.json')
    },
    {
        name: '30-06-2018',
        input: require('../test/stubs/womanshour/WH-20180630.input.json'),
        actual: require('../test/stubs/womanshour/WH-20180630.actual.json')
    },
    {
        name: '02-07-2018',
        input: require('../test/stubs/womanshour/WH-20180702.input.json'),
        actual: require('../test/stubs/womanshour/WH-20180702.actual.json')
    },
    {
        name: '07-07-2018',
        input: require('../test/stubs/womanshour/WH-20180707.input.json'),
        actual: require('../test/stubs/womanshour/WH-20180707.actual.json')
    }
];

const todayprogrammes = [
    {
        name: '27-06-2018',
        input: require('../test/stubs/today/TODAY_270618.input.json'),
        actual: require('../test/stubs/today/TODAY_270618.actual.json')
    },
    {
        name: '28-06-2018',
        input: require('../test/stubs/today/TODAY_280618.input.json'),
        actual: require('../test/stubs/today/TODAY_280618.actual.json')
    },
];

const calculateMedian = (results) => {
    const sortedResults = results.slice().sort();
    const halfwayPoint = sortedResults.length / 2;
    if (sortedResults.length % 2 === halfwayPoint) {
        return (sortedResults[sortedResults.length % 2] + sortedResults[(sortedResults.length % 2) - 1]) / 2;
    } else {
        return sortedResults[Math.ceil(halfwayPoint)];
    }
};

const getMatchType = (alignedTime, actualTime) => {
    if (actualTime === null) {
        if (alignedTime === null) {
            return STORY_NOT_IN_RUNDOWN;
        } else {
            return STORY_FALSELY_FOUND;
        }
    } else {
        if (alignedTime === null) {
            return STORY_NOT_FOUND;
        } else {
            if (parseFloat(actualTime) === alignedTime) {
                return STORY_ALIGNED;
            } else {
                return STORY_MISALIGNED;
            }
        }
    }
};

const createResults = (brand, name, alignedResults, actual) => {
    const stories = alignedResults.rundown.map((story, currentIndex) => story.start && actual[currentIndex].start ? story.start - actual[currentIndex].start : null);
    const fullStories = alignedResults.rundown.map((story, currentIndex) => {
        const alignedTime = story.start;
        const actualTime = actual[currentIndex].start;
        return {
            name: story.story,
            alignedTime,
            actualTime,
            matchType: getMatchType(alignedTime, actualTime),
            timeDifference: alignedTime === null || actualTime === null ? null : alignedTime - actualTime,
            confidenceScore: story.confidence
        };
    });
    const matchedStories = stories.filter(result => result !== null);
    const storiesNotInRundown = fullStories.reduce((accumulator, story) => story.matchType === STORY_NOT_IN_RUNDOWN ? accumulator + 1 : accumulator, 0);
    const storiesFalselyFound = fullStories.reduce((accumulator, story) => story.matchType === STORY_FALSELY_FOUND ? accumulator + 1 : accumulator, 0);
    const storiesNotFound = fullStories.reduce((accumulator, story) => story.matchType === STORY_NOT_FOUND ? accumulator + 1 : accumulator, 0);
    const absoluteTotal = matchedStories.reduce((accumulator, storyDifference) => accumulator + Math.abs(storyDifference), 0);
    const mean = absoluteTotal / matchedStories.length;
    const median = calculateMedian(matchedStories);
    const exactlyMatchedStories = matchedStories.reduce((accumulator, storyDifference) => storyDifference === 0 ? (accumulator + 1) : accumulator, 0);
    const benchmark = {
        brand,
        name,
        wordchunks: alignedResults.windowSize,
        storyCount: alignedResults.rundown.length,
        stories,
        fullStories,
        absoluteTotal,
        mean,
        median,
        storiesNotInRundown,
        storiesFalselyFound,
        storiesNotFound,
        matchedStories: exactlyMatchedStories, //number of stories which were exactly matched
        matchPercent: (exactlyMatchedStories / matchedStories.length) * 100,
        date: new Date().toISOString()
    };
    return benchmark;
};

const runTests = (brand, programmes, wordchunks) => {
    return programmes.map(programme => {
        const results = fzt.getSegmentTimes(programme.input, wordchunks)

        return createResults(brand, programme.name, results, programme.actual);
    });
};

const benchmark = () => {
    const sixes = runTests('sixoclocknews', sixoclocks, 8);
    const watos = runTests('worldatone', worldatones, 8);
    const whs = runTests('womanshour', womanshours, 8);
    const todays = runTests('today', todayprogrammes, 8);

    return sixes.concat(watos).concat(whs).concat(todays);
}

console.log(JSON.stringify(benchmark(), null, 4));
// benchmark()

module.exports = {
    benchmark
}
