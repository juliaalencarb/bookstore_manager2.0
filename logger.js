function logger(req, res, next) {
    console.log(`Method: ${req.method} | Url: ${req.originalUrl}`);
    next();
}

module.exports = logger;