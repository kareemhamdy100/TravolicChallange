const searchRouter = require('express').Router();


searchRouter.get("/", validateByName,
    validateCity,
    validatePriceRange,
    validateDateRange,
    getDataAfterFilter,
    (req, res, next) => {
        res.json({ data: "hello world" });
    });


function validateByName(req, res, next) {
        next();
};

function validateCity(req, res, next) {
    next();
};

function validatePriceRange(req, res, next) {
    next();
};

function validateDateRange(req, res, next) {
    next();
};

function getDataAfterFilter(req, res, next) {
    next();
};



module.exports = searchRouter;