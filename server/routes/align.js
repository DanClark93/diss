const fzt = require('../lib/fuzzyTextFinder.js');
const Ajv = require('ajv');
const schema = require('../test/schema.json');

const DEFAULT_WINDOW_SIZE = 8;

module.exports = function(app) {
    app.post('/rundown-align', (req, res, next) => {
        const query = req.query.wordchunks;
        let windowSize = DEFAULT_WINDOW_SIZE;

        const ajv = new Ajv({allErrors: true, jsonPointers: true});
        const ajvErrors = require('ajv-errors')(ajv);
        const validate = ajv.compile(schema);
        const valid = validate(req.body);

        if (!valid) {
            const error = new Error(validate.errors[0].message);
            error.httpStatusCode = 400;
            return next(error);
        }

        if (!isNaN(query)) {
            if (query > 4 && query < 20) {
                windowSize = parseInt(query);
            }
        }

        const response = fzt.getSegmentTimes(req.body, windowSize);

        res.send(response);
    });
}
