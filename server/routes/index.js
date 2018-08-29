// routes/index.js
module.exports = function(app, db) {
    require('./status')(app);
    require('./align')(app, db);
};
