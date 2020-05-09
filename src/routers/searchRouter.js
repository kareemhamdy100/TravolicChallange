const searchRouter = require('express').Router();
const validator = require('validator');

const errorMessages = require('../utils/errorMessages');
/*
    function from reducer. Store get data from given API and send it to reducer
    to produce final result as required.
    req.finalResult is promise retrun from reducer.
  */
const fetchDataAfterFliter = require('../dataStore/reducer');


/*
    search router prepare searchOptions & sortOptions
    then request data from reducer
    reducer return promise when reslove return the final result;
 */

searchRouter.get('/',
    setupOtionsObject,
    attachName,
    attachCity,
    attachPriceRange,
    attachDateInterval,
    getDataAfterFilter,
    async (req, res) => {
        try {
            const finalRestult = await req.finalRestult;
            res.json({ data: finalRestult });
        } catch (err) {
            res.status(500).json({ error: errorMessages.errorFromApiRequest });
        }
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
    };
    //TODO check if not Null and check body Data
    const prams = req.query;
    /*setup searchFlags as commented */
    searchFlags.isName = typeof prams.name !== 'undefined';
    searchFlags.isCity = typeof prams.city !== 'undefined';
    searchFlags.isPriceRange = typeof prams.start_price !== 'undefined';
    searchFlags.isDateIntervalse = typeof prams.start_date !== 'undefined';

    /*
        sort is ascending order by defualt
        if sort_type = desc it will become descending order
        sort_by  should equal name or price otherwise data will become unsorted
    */
    const sortOptions = {};
    if (prams.sort_by && prams.sort_by === 'name' || prams.sort_by === 'price') {
        sortOptions.sort_by = prams.sort_by;
        sortOptions.sort_type = true;
        if (prams.sort_type) {
            if (prams.sort_type === 'desc') {
                sortOptions.sort_type = false;
            }
        }
    }
    /*attach searchOptions and searchFlags to req object and pass to validate */
    req.searchFlags = searchFlags;
    req.searchOptions = {};
    req.sortOptions = sortOptions;
    next();
}

/*
    if name is't empty String then it's valied
    then attach it to searchOptions
 */
function attachName(req, res, next) {
    const prams = req.query;
    const searchOptions = req.searchOptions;
    if (req.searchFlags.isName) {
        if (prams.name === '') {
            req.searchFlags.isName = false;
        } else {
            searchOptions.name = { type:'', value: prams.name };
        }
    }
    next();
}
/*
    if city is't empty String then it's valied
    then attach it to searchOptions
 */
function attachCity(req, res, next) {
    const prams = req.query;
    const searchOptions = req.searchOptions;
    if (req.searchFlags.isCity) {
        if (prams.city === '') {
            req.searchFlags.isCity = false;
        } else {
            searchOptions.city = { type: '',value: prams.city };
        }
    }
    next();
}
/*
    check if two Strings are numbers and
    start less than or equal end
    then return { error = null , rangeObj }
    otherWise
    return { error }
 */

function validateRange(start, end) {
    let error = null;
    const startFloat = validator.toFloat(start);
    const endFloat = validator.toFloat(end);
    if (!validator.isNumeric(start)) {
        error = new Error(`(${start}) ${errorMessages.priceNotNumber}`);
    }
    else if (!validator.isNumeric(end)) {
        error = new Error(`(${end}) ${errorMessages.priceNotNumber}`);
    }
    else if (startFloat > endFloat) {
        error = new Error(errorMessages.invalidPriceRange);
    }
    else {
        return {
            error: null,
            rangeObj: {
                start: startFloat,
                end: endFloat
            }
        };
    }
    error.name = 'ValidationError';
    return { error };
}
/*
    Checks if should search with price_range,
    then validate the start_price and end_price
    then attch it to searchOptions
*/
function attachPriceRange(req, res, next) {
    const prams = req.query;
    const searchOptions = req.searchOptions;
    if (req.searchFlags.isPriceRange && prams.start_price !== '') {
        const startPrice = prams.start_price;
        let endPrice = startPrice;
        if (typeof prams.end_price !== 'undefined' && prams.end_price !== '') {
            endPrice = prams.end_price;
        }
        // valiedate price_range
        const { error, rangeObj } = validateRange(startPrice, endPrice);
        if (error !== null) { next(error); }

        searchOptions.price = { type: 'range', value :rangeObj };
    } else {
        req.searchFlags.isPriceRange = false;
    }
    next();
}

/*
    check if two Strings are valied date and
    start less than or equal end
    return {error = null , intervalObj}
    otherWise
    return { Error }

    date should be yyyy-mm-dd format
 */
function validateInterval(startDate, endDate) {
    let error = null;
    if (!validator.isISO8601(startDate, { strict: true })) {
        error = new Error(`(${startDate}) ${errorMessages.badDate}`);
    } else if (!validator.isISO8601(endDate, { strict: true })) {
        error = new Error(`(${endDate}) ${errorMessages.badDate}`);
    } else if (validator.isBefore(endDate, startDate)) {
        error = new Error(errorMessages.invalidDateRange);
    } else {
        /* valied dates and range*/
        return {
            error: null,
            intervalObj: {
                start: Math.floor(new Date(startDate).getTime() / 1000),
                end: Math.floor(new Date(endDate).getTime() / 1000)
            }
        };
    }
    error.name = 'ValidationError';
    return { error };
}
/*
    Checks if should search with date_interval_se ,
    then validate the start_date and end_date
    then attch it to searchOptions
*/
function attachDateInterval(req, res, next) {
    const prams = req.query;
    const searchOptions = req.searchOptions;

    if (req.searchFlags.isDateIntervalse && prams.start_date !== '') {
        const startDate = prams.start_date;
        let endDate = startDate;
        if (typeof prams.end_date !== 'undefined' && prams.end_date !== '') {
            endDate = prams.end_date;
        }
        //check strings if valied dates
        const { error, intervalObj } = validateInterval(startDate, endDate);
        if (error !== null) {
            return next(error);
        }
        /*intervalObj have start and end with unix timestamp format */
        searchOptions.date = { type: 'interval_se', value :intervalObj };

    } else {
        req.searchFlags.isDateIntervalse = false;
    }
    next();
}



/*
    This middleware send searchOptions, sortOptions to reducer to get required data.

    searchOptions is object with keys and values
    we interset to search about
    keys should be equals to the data keys
    and type could be '' || 'range' ||  'range_se' || 'interval'|| 'interval_se'
    'se' here means that the data have 2 keys
    end with "_start" and "_end" with same name
    like  "date_start", "date_end"
    'range' used to search  for ranges with  normal dataTyps String, integer,..etc
    'interval' used to  search for ranges with dates and times only also support "_se".
    searchOptions will be someThing like this
    {
        name :{type:'' , value: "itaque ut laborum"},
        city : {type:'', value: "South Dan"},
        price : {
            type:'range',
            value:{
                start : 200,
                end :  250
            }
        },
        date: {
        type: 'interval_se',
        value:{
            start: 1880061321,
            end: 18116544544
            }
        }
    }
    sortObject
    {
        sort_by:<field_name>,
        sort_type: ture: for ascen ordering, false for desc ordering
    }
 */
function getDataAfterFilter(req, res, next) {
    req.finalRestult = fetchDataAfterFliter(req.searchOptions, req.sortOptions);
    next();
}

module.exports = searchRouter;