const supertest = require('supertest');

const errors = require('../src/utils/errorMessages');
const app = require('../src/app');

jest.mock('../src/dataStore/storeBase');
const fetchData = require('../src/dataStore/storeBase');
const mockFetchData = require('./mocks/mockFetchData');

const api = supertest(app);


beforeEach(() => {
    fetchData.mockImplementation(mockFetchData);
});


describe('Valied Search pramter', () => {
    let expObject = {};
    beforeEach(() => {
        expObject = { name: "fugit eius ut" };
    })
    test('search by name', async () => {
        const response = await api
            .get('/api/search?name=fugit eius ut')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        expect(response.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining(expObject)
            ])
        );
    });
    test('search by city', async () => {

        const response = await api
            .get('/api/search?Destination=Brazil')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        expect(response.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining(expObject)
            ])
        );
    });

    test('search by priceRange', async () => {
        const response = await api
            .get('/api/search?price_start=680 price_end=690')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        expect(response.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining(expObject)
            ])
        );
    });

    test('search by dateRange', async () => {
        const response = await api
            .get('/api/search?date_start=27-04-2020 date_end=30-04-2020')
            .expect(200)
            .expect('Content-Type', /json/);
        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        expect(response.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining(expObject)
            ])
        );
    });
})



describe('InValied Search Pramter', () => {
    
    describe('Test invalid date string', () => {

        test('Test start_date = aa-bb-cccc & end_date = 2-04-2020', async () => {
            const date1 = 'aa-bb-cccc';
            const date2 = '2-04-2020';

            const response = await api
                .get(`/api/search?start_date=${date1}&end_date=${date2}`)
                .expect(400);

            expect(response.body.error).toBeDefined();
            expect(response.body.error).toBe(errors.badDate);
        });
        test('Test start_date = 2-04-2020 & end_date = 77-04-2020', async () => {
            const date1 = '2-04-2020';
            const date2 = '77-04-2020';

            const response = await api
                .get(`/api/search?start_date=${date1}&end_date=${date2}`)
                .expect(400);

            expect(response.body.error).toBeDefined();
            expect(response.body.error).toBe(errors.badDate);
        });
    });

    test('wrong date range', async () => {
        const date1 = '2-04-2020';
        const date2 = '1-03-2020';

        const response = await api
            .get(`/api/search?start_date=${date1}&end_date=${date2}`)
            .expect(400);

        expect(response.body.error).toBeDefined();
        expect(response.body.error).toBe(errors.badDate);
    });



    describe('wrong price format', () => {
        test('Test wrong start_price', async () => {
            const price1 = 'aaksad';
            const price2 = '500';

            const response = await api
                .get(`/api/search?start_price=${price1}&end_price=${price2}`)
                .expect(400);

            expect(response.body.error).toBeDefined();
            expect(response.body.error).toBe(`(${price1}) ${errors.priceNotNumber}`);
        });
        test('Test wrong end_price', async () => {
            const price1 = '500';
            const price2 = 'adsadsa';

            const response = await api
                .get(`/api/search?start_price=${price1}&end_price=${price2}`)
                .expect(400);

            expect(response.body.error).toBeDefined();
            expect(response.body.error).toBe(`(${price2}) ${errors.priceNotNumber}`);
        });

    });

    test('wrong price range', async () => {
        const price1 = '500';
        const price2 = '250';

        const response = await api
            .get(`/api/search?start_price=${price1}&end_price=${price2}`)
            .expect(400);

        expect(response.body.error).toBeDefined();
        expect(response.body.error).toBe(errors.invalidPriceRange);
    });
});
