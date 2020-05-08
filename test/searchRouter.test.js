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
        expObject = { name: 'fugit eius ut' };
    });
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
            .get('/api/search?city=Ankundingland')
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
            .get('/api/search?start_price=680&end_price=690')
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
            .get('/api/search?start_date=2021-04-12T20:38:02.640Z')
            .expect(200)
            .expect('Content-Type', /json/);
        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        expect(response.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining(expObject)
            ])
        );
    });
});



describe('InValied Search Pramter', () => {

    describe('Test invalid date string', () => {

        test('Test start_date = aa-bb-cccc & end_date = 2020-04-2', async () => {
            const date1 = 'aa-bb-cccc';
            const date2 = '2020-04-2';

            const response = await api
                .get(`/api/search?start_date=${date1}&end_date=${date2}`)
                .expect(400);

            expect(response.body.error).toBeDefined();
            expect(response.body.error).toBe(`(${date1}) ${errors.badDate}`);
        });
        test('Test start_date = 2020-02-30& end_date = 2020-04-77', async () => {
            const date1 = '2020-02-30';
            const date2 = '2020-04-77';

            const response = await api
                .get(`/api/search?start_date=${date1}&end_date=${date2}`)
                .expect(400);

            expect(response.body.error).toBeDefined();
            expect(response.body.error).toBe(`(${date1}) ${errors.badDate}`);
        });
        test('Test start_date = 2020-02-15 & end_date = 2020-04-77', async () => {
            const date1 = '2020-02-15';
            const date2 = '2020-04-77';

            const response = await api
                .get(`/api/search?start_date=${date1}&end_date=${date2}`)
                .expect(400);

            expect(response.body.error).toBeDefined();
            expect(response.body.error).toBe(`(${date2}) ${errors.badDate}`);
        });



    });

    test('wrong date range', async () => {
        const date1 = '2020-04-02';
        const date2 = '2020-03-01';

        const response = await api
            .get(`/api/search?start_date=${date1}&end_date=${date2}`)
            .expect(400);

        expect(response.body.error).toBeDefined();
        expect(response.body.error).toBe(errors.invalidDateRange);
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
