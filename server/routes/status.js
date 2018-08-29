module.exports = function(app) {
    app.get('/status', (req, res, next) => {
        res.sendStatus(200);
    });
};
