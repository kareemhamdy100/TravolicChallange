/* reducer is the interface for storeBase */

const getStoreData = require('./storeBase');

/* options is an object with search paramters 
    something like this 
    {
        name: "abc",
        city: "aaa",
        minPrice: 50,
        maxPrice : 100,
        startDate: 3-5-2020,
        endDate : 20-5-2020
    }
    this object validated before reach here.
*/

function filterData(options, data) {

    // const result = data.map((item, index) => {
    // });
    // return result;
};

/*  Ask store for data 
    Filter it 
    Return filtered data
*/
module.exports = function getData(options) {
    // const data = getStoreData();
    // const result = filterData(options, data);
    // return result;
};

