const assert = require('assert');

const fzt = require('../../lib/fuzzyTextFinder.js');

const input = require('../stubs/input');
const correctOutput = require('../stubs/new_output');

const WINDOW_SIZE = 8;

describe('fuzzyTextFinder.js', () => {
    describe('.getSegmentTimes()', () => {
        it('returns an object containing start and end times for each story', () => {
            const outputJSON = fzt.getSegmentTimes(input, WINDOW_SIZE);
            outputJSON.rundown.forEach(story => {
                if (!('start' in story)) {
                    throw new Error('Story missing start time');
                }
                if (!('end' in story)) {
                    throw new Error('Story missing end time');
                }
            });

            assert.equal(outputJSON.vpid, 'a_vpid_value');
            assert.equal(outputJSON.wordchunks, WINDOW_SIZE);
            assert.equal(outputJSON.rundown.length, 20);
            assert.deepStrictEqual(outputJSON.rundown, correctOutput.rundown);
        });
    });
});
