const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const PORT = 8080;

app.use(bodyParser.json({ limit: '10mb' }));

require('./routes')(app, {});

const errorHandler = (err, req, res, next) => {
    console.error(`Error (${err.httpStatusCode}) - ${err.message}`);

    res.status(err.httpStatusCode || 500);
    res.json({ error: err.message });
};

app.use(errorHandler);

if (!module.parent) {
    app.listen(PORT, () => {
        console.log('We are live on ' + PORT);
    });
}

module.exports = app;
