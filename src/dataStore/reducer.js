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
    this object validated before reach here.
*/

function filterData(data, searchOptions) {

    const result = data.filter((hotelObj) => {
        for (const key of Object.keys(searchOptions)) {
            switch (searchOptions[key].type) {
            /* any range will work find excpet for time and dates uses interval */
            case 'range':
                if (!(searchOptions[key].value.start <= hotelObj[key])
                            || !(hotelObj[key] <= searchOptions[key].value.end)) {
                    return false;
                }
                break;
                /* 'se' with range here not used with this version of schema
                    it means that the schema have paramter with
                    <name>_start
                    <name>_end and you search with tow values too.
                    Like data_start, date_end
                */
            case 'range_se':
                if (searchOptions[key].value.start > hotelObj[`${key}_end`] ||
                 searchOptions[key].value.end < hotelObj[`${key}_start`]) {
                    return false;
                }
                break;
                /* works with times and dates */
            case 'interval':{
                const hotelObjTimeValue = new Date(hotelObj[key]) / 1000;
                if (!(searchOptions[key].value.start <= hotelObjTimeValue)
                        || !(hotelObjTimeValue <= searchOptions[key].end)) {
                    return false;
                }
                break;
            }
            /* 'se' it means that the schema have paramter with
                <name>_start
                <name>_end and you search with two values too.
                Like data_start, date_end
            */
            case 'interval_se': {
                // convert to unix TimeStamp
                const hotelPram_start = Math.floor(new Date(hotelObj[`${key}_start`]).getTime() / 1000);
                const hotelPram_end = Math.floor(new Date(hotelObj[`${key}_end`]).getTime() / 1000);
                const searchStart = searchOptions[key].value.start;
                const searchEnd = searchOptions[key].value.end;
                if (searchStart > hotelPram_end
                            || searchEnd < hotelPram_start) {
                    return false;
                }
                break;
            }
            default:
                if (searchOptions[key].value !== hotelObj[key]) {
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

