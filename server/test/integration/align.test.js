const request = require('supertest');
const _ = require('lodash');

const server = require('../../server');

const input = require('../stubs/input');

const WINDOW_SIZE = 8;

describe('/rundown-align', () => {
    describe('POST', () => {
        it('responds with json containing timings for each story', (done) => {
            const hasTimings = (res) => {
                res.body.rundown.forEach(story => {
                    if (!('start' in story)) {
                        throw new Error('Story missing start time');
                    }
                    if (!('end' in story)) {
                        throw new Error('Story missing end time');
                    }
                });
            };

            request(server)
                .post('/rundown-align')
                .send(input)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(hasTimings)
                .expect(200, done)
        });

        it('responds with an error if no body is sent', (done) => {
            const expectedError = { error: 'Input JSON must contain a string property named vpid' };

            request(server)
                .post('/rundown-align')
                .expect('Content-Type', /json/)
                .expect(400, expectedError, done)
        });

        it('responds with an error if no vpid is sent', (done) => {
            const expectedError = { error: 'Input JSON must contain a string property named vpid at least 1 character long' };
            const missingVpidInput = _.cloneDeep(input);
            missingVpidInput.vpid = [];

            request(server)
                .post('/rundown-align')
                .send(missingVpidInput)
                .expect('Content-Type', /json/)
                .expect(400, expectedError, done)
        });

        it('responds with an error if no words array is sent', (done) => {
            const expectedError = { error: 'Input JSON must contain a word array containing an array of word objects [start, confidence, end, word, punct, index]' };
            const missingWordsInput = _.cloneDeep(input);
            missingWordsInput.words = [];

            request(server)
                .post('/rundown-align')
                .send(missingWordsInput)
                .expect('Content-Type', /json/)
                .expect(400, expectedError, done)
        });

        it('responds with an error if no rundown array is sent', (done) => {
            const expectedError = { error: 'Input JSON must contain a rundown array containing an array of story objects' };
            const missingRundownInput = _.cloneDeep(input);
            missingRundownInput.rundown = [];

            request(server)
                .post('/rundown-align')
                .send(missingRundownInput)
                .expect('Content-Type', /json/)
                .expect(400, expectedError, done)
        });
    });
});
