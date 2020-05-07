/* eslint-disable no-useless-catch */
/*  reducer  get data from store and manbulate it
    as required in searchOptions, sortOptions
    then return the final result as Promise
*/

const getStoreData = require('./storeBase');


function sortData(data, sortOptions) {

    if (Object.keys(sortOptions).length === 0) return data;
    data.sort((a, b) => {
        if (a[sortOptions.sort_by] > b[sortOptions.sort_by]) {
            return sortOptions.sort_type ? 1 : -1;
        } else if (a[sortOptions.sort_by] < b[sortOptions.sort_by]) {
            return sortOptions.sort_type ? -1 : 1;
        } else {
            return 0;
        }
    });
    return data;
}

/* searchOptions is an object with search paramters
    something like this
    {
        name: "abc",
        city: "aaa",
        price_range: {
            start: 50,
            end: 60
        },
        date_interval_se:{
            start: 18897897996,  timeStamp
            end : 44456466666
        }
    }
    this object validated before reach here.
*/

function filterData(data, searchOptions) {

    const result = data.filter((hotelObj) => {

        for (const key of Object.keys(searchOptions)) {
            const keyContent = key.split('_');

            switch (keyContent[1]) {
            /* any range will work find excpet for time and dates uses interval */
            case 'range':
                /* 'se' with range here not used with this version of schema
                             it means that the schema have paramter with
                             <name>_start
                             <name>_end and you search with tow values too.
                             Like data_start, date_end
                        */
                if (keyContent[2] === 'se') {
                    const hotelPram_start = hotelObj[`${keyContent[0]}_start`];
                    const hotelPram_end = hotelObj[`${keyContent[0]}_end`];
                    const searchStart = searchOptions[key].start;
                    const searchEnd = searchOptions[key].end;

                    if (searchStart > hotelPram_end || searchEnd < hotelPram_start) {
                        return false;
                    }
                } else {
                    if (!(searchOptions[key].start <= hotelObj[keyContent[0]])
                            || !(hotelObj[keyContent[0]] <= searchOptions[key].end)) {
                        return false;
                    }
                }

                break;
                /* works with times and dates */
            case 'interval':
                /* 'se' it means that the schema have paramter with
                                 <name>_start
                                 <name>_end and you search with two values too.
                                 Like data_start, date_end
                        */
                if (keyContent[2] === 'se') {
                    // convert to unix TimeStamp
                    const hotelPram_start = Math.floor(new Date(hotelObj[`${keyContent[0]}_start`]).getTime() / 1000);
                    const hotelPram_end = Math.floor(new Date(hotelObj[`${keyContent[0]}_end`]).getTime() / 1000);
                    const searchStart = searchOptions[key].start;
                    const searchEnd = searchOptions[key].end;
                    if (searchStart > hotelPram_end
                            || searchEnd < hotelPram_start) {
                        return false;
                    }

                } else {
                    const hotelObjTimeValue = new Date(hotelObj[keyContent[0]]) / 1000;
                    if (!(searchOptions[key].start <= hotelObjTimeValue)
                            || !(hotelObjTimeValue <= searchOptions[key].end)) {
                        return false;
                    }
                }

                break;
            default:
                if (searchOptions[key] !== hotelObj[key]) {
                    return false;
                }
                break;
            }
        }
        return true;
    });
    return result;
}

/*  Ask store for data
    Filter it
    sort it
    Return filtered sorted data <Promise>
*/
module.exports = async function getData(searchOptions, sortOptions) {
    if (Object.keys(searchOptions).length === 0) return [];
    try {
        const data = await getStoreData();
        let result = filterData(data, searchOptions);
        result = sortData(result, sortOptions);
        return result;
    } catch (err) {
        throw err;
    }
};

