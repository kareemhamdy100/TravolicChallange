# TravolicChallange
[![kareemhamdy100](https://circleci.com/gh/kareemhamdy100/TravolicChallange.svg?style=svg)](https://app.circleci.com/github/kareemhamdy100/TravolicChallange/pipelines)

## Project Overview
  this code  solve back-end task for travolic https://github.com/travolic/Back-End-Task.  
  This is a RESTful API to allow search in data return by given end_point by any of the following:
  -  Hotel Name
  -  Destination [City]
  -  Price range [ex: $100:$200]
  -   Date range [ex: 2020-10-1:2020-10-15]

  and allow sorting by:  
  - Hotel Name
  - Price
  This is including search by multiple criteria at the same time as search by destination and price together.

## how to run the App 

first, make sure you set up node.js
clone  then
make sure you in the root directory where you could find  **index.js**  then run this command:

    npm install 
    
after finish installing   

    npm test 

if the test pass you can now run:
    
    npm start

Then start the search.

## How to use 
This search API work with url pramter 
and the allowed pramters is 
- name (string && not ' ') return data with name === queryprams.name.
- city (string && not ' ') return data with city === queryprams.city.
- (price range) return data data with price in between [start, end].
    - (start) start_price  ( Number &&  less than end_price)
    - (end)   end_price    ( Number ) in case ' ' or undifine search done with start_price only
- (date range) return data data with [date_start , date_end] in intersect with [start, end].
    - (start) start_date ( Date && (YYYY-MM-DD) && less than end_date )
    - (end)   end_date  ( Date && (YYYY-MM-DD) ) in case ' ' or undifine search done with start_date only
- sort_by: should be ('name' || 'price') otherwise ignored.
- sort_type:  ('desc') for descending order otherwise ascending order by defualt

### Examples 

            '/api/search?name=fugit eius ut'
            '/api/search?city=Ankundingland'
            '/api/search?start_price=680&end_price=690'
            '/api/search?start_date=2020-04-12&end_date=2020-04-30'
            '/api/search?name=fugit eius ut&start_date=2020-04-12&end_date=2020-04-30'
            '/api/search?city=Ankundingland&start_price=680&end_price=690'
**Note**: if you use query paramter that not in {name ,city, start_date, end_date, start_price, end_price}
    it will be ignored  
**Note**: if you use '**end_date**  Or **end_price**' without **start_(date || price)** it will be ignored


## Code structure
**root**:
  - index.js (create server and use the Express app from src)
  - test (dir contains tests for search router)
  - **src**:
    - utils (middlewares.js ,config.js, errorMessages.js )
    - routers (searchRouter.js)  
    - dataStore (storeBase.js , reducer.js)
    - app.js (Export express app using middlewares and routers)

## Code Work-FLow  
This part explains how searchRouter get data from dataStore 
and how dataStore filter data as required.
### first dataSotre
**dataStore** contains two parts storeBase.js and reducer.js  
storeBase.js is where we fetch data from original src (in our case (given API_ENDPOINT))  
reducer.js get all data storeBase have and then filter it and sort it depend on the searchOptions, sortOptions
received from search router 

**how filter work**:
filter function independent from the src data schema that's why it will look 
a quiet bit complicated but it's worth because if the schema changed it will never change
it depends on the searchOptions have the same keys as the src data schema have
and it's allowed to search by 
- value like { name, city }
- range with one key represents one value like [price]  
by sending in searchOption this object [key]_range:{ start , end };
- Search by range in two keys represent a range in the data like <date_start, date_end>  
by sending in searchOption this object [key]_range_se:{ start , end };

    **NOTE**: 'se' used for search with a range in data have range.  
    data have a range that's mean data have two keys represent  
    the start and the end of the range like [date_start , date_end] 

### searchRouter

1- searchRouter: **validate** the URL query parameters then send to reducer the searchOptions and sortOptions  
2- reducer **ask** storBase for data then **filter** it and **sort**  it then return it to search router   
3- searchRouter response with the final result;

## Tools I used
- Express 
- jest for test
- validator to validate data
- eslint
- vsCode
- circleci for CI/CD

