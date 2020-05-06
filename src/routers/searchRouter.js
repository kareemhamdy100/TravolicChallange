const searchRouter = require('express').Router();
const validator = require('validator');

const errorMessages = require('../utils/errorMessages');
const fetchDataAfterFliter = require('../dataStore/reducer');

searchRouter.get("/",
    setupOtionsObject,
    validateName,
    validateCity,
    validatePriceRange,
    validateDateRange,
    getDataAfterFilter,
    (req, res, next) => {

        res.json({ data: req.finalRestult });
    });

/* 
    a middleware that check reqest prameter 
    create (searchFlags object )
    make request object have req.searchFlags = searchFlags & req.searchOptions = {}
 */

function setupOtionsObject(req, res, next) {
    const searchFlags = {
        /*  isName: boolean, if True name filed will be added (String) to searchOptions
            isCity: boolean, if true city filed will be added (String) to searchOptions
            isPriceRange: boolean, if true range filed will be added (Object {start , end }) to optios
            isDateIntervalse: boolean, if true intrval filed will be added (Object {start , end }) to searchOptions
       */
    }
    //TODO check if not Null and check body Data
    const prams = req.query;
    /*setup searchFlags as commented */
    searchFlags.isName = typeof prams.name !== 'undefined';
    searchFlags.isCity = typeof prams.city !== 'undefined';
    searchFlags.isPriceRange = typeof prams.start_price !== 'undefined';
    searchFlags.isDateIntervalse = typeof prams.start_date !== 'undefined';

    /*attach searchOptions and searchFlags to req object and pass to validate */
    req.searchFlags = searchFlags;
    req.searchOptions = {};
    next();
}

/*  
    if name is't empty String then it's valied
    then add it to searchOptions 
 */
function validateName(req, res, next) {
    const prams = req.query;
    const searchOptions = req.searchOptions;
    if (req.searchFlags.isName) {
        if (prams.name === '') {
            req.searchFlags.isName = false;
        } else {
            searchOptions.name = prams.name;
        }
    }
    next();
};
/*
    if city is't empty String then it's valied
    then add it to searchOptions 
 */
function validateCity(req, res, next) {
    const prams = req.query;
    const searchOptions = req.searchOptions;
    if (req.searchFlags.isCity) {
        if (prams.city === '') {
            req.searchFlags.isCity = false;
        } else {
            searchOptions.city = prams.city;
        }
    }
    next();
};
/*
    check if two prices are numbers and
    start <= end
    then add to searchOptions
    otherWise response with  Error 
    if valied return null else return with ErrorMessage
 */

function isValidPrices(startPrice, endPrice) {
    let error = null;

    if (!validator.isNumeric(startPrice)) {
        error = new Error(`(${startPrice}) ${errorMessages.priceNotNumber}`);
    } else if (!validator.isNumeric(endPrice)) {
        error = new Error(`(${endPrice}) ${errorMessages.priceNotNumber}`);
    } else if (startPrice > endPrice) {
        error = new Error(errorMessages.invalidPriceRange);
    } else {
        return null;
    }
    error.name = "ValidationError";
    return error;
}
function validatePriceRange(req, res, next) {
    const prams = req.query;
    const searchOptions = req.searchOptions;
    if (req.searchFlags.isPriceRange && prams.start_price !== '') {
        const startPrice = prams.start_price;
        let endPrice = startPrice;
        if (typeof prams.end_price !== 'undefined' && prams.end_price !== '') {
            endPrice = prams.end_price;
        }
        // valiedate price_range
        const error = isValidPrices(startPrice, endPrice);
        if (error != null) {
            next(error);
        } else {
            searchOptions.price_range = {
                start: startPrice,
                end: endPrice
            }
        }
    }
    next();
};

/*
    check if two dates are valied Dates and
    start <= end
    then add to searchOptions
    otherWise response with  Error 

    date should be yyyy-mm-dd format
 */
function isValidDates(startDate, endDate) {
    let error = null;

    if (!validator.isISO8601(startDate, { strict: true })) {
        error = new Error(`(${startDate}) ${errorMessages.badDate}`);
    } else if (!validator.isISO8601(endDate)) {
        error = new Error(`(${endDate}) ${errorMessages.badDate}`);
    } else if (validator.isBefore(endDate, startDate)) {
        error = new Error(errorMessages.invalidDateRange);
    } else {
        return null;
    }
    error.name = "ValidationError";
    return error;
}

function validateDateRange(req, res, next) {
    const prams = req.query;
    const searchOptions = req.searchOptions;

    if (req.searchFlags.isDateIntervalse && prams.start_date !== '') {
        const startDate = prams.start_date;
        let endDate = startDate;
        if (typeof prams.end_date !== 'undefined' && prams.end_date !== '') {
            endDate = prams.end_date;
        }
        //check strings if valied dates 
        const error = isValidDates(startDate, endDate);
        if (error != null) {
            next(error);
        }

        searchOptions.date_interval_se = {
            start: Math.floor(new Date(startDate).getTime() / 1000),
            end: Math.floor(new Date(endDate).getTime() / 1000)
        };

    }
    next();
};



/*
    This middleware send searchOptions, sortOptions to reducer to get required data.

    searchOptions is object with keys and values
    we interset to search about 
    keys should be equals to the data keys 
    expect for Ranges 
    key = <key>_range or <key>_range_se
    se here means that the data have 2 keys  
    ends with "start" and "end" with same name 
    like  "date_start", "date_end"
    <key>_range used to search  for ranges with  normal dataTyps String, integer,..etc
    <key>_interval used to  search for ranges with dates and times only also support "_se".
    searchOptions will be someThing like this 
    {
        name :"itaque ut laborum",
        city : "South Dan",
        price_range : {
            start : 200,
            end :  250
        },
        date_interval_se : {
            start: 1880061321,
            end: 18116544544
        }
    }
 
 */
function getDataAfterFilter(req, res, next) {
    if (Object.keys(req.searchOptions).length !== 0) {
        req.finalRestult = fetchDataAfterFliter(req.searchOptions);
    } else {
        req.finalRestult = [];
    }
    next();
};

module.exports = searchRouter;