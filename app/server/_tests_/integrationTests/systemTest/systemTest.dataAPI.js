const chaiHttp = require('chai-http');
const chaiJSONSchema = require('chai-json-schema');

/*
* TODO
* Test each statistics route individualy. Currently they are tested together using the API
* endpoint "stats/?statType=all"
*/

function testDataAPI(expect, chai, hostName, testingKey) {
	chai.use(chaiHttp);
	chai.use(chaiJSONSchema);

	describe('Data API tests', function(){
		const apiURL = `http://${hostName}/data/${testingKey}`;
		const stringTypeSchema = {type:'string'};
		const numberTypeSchema = {type:'number'};

		it('Can be rejected due to incorrect key', function(done){
			const urlWithWrongKey = apiURL + 'THIS-IS-DEFINITELY-A-WRONG-KEY';
			chai.request(urlWithWrongKey).get('/overview').end(function(error, response){
				expect(response).to.have.status(403);
				done();
			});

		});

		it('Can get analytics overview data', function(done){
			chai.request(apiURL).get('/overview').end(function(error, response){
				expect(error, 'Error while getting analytics overview data').to.not.exist;
				expect(response).to.have.status(200);
				expect(response).to.be.json;

				expect(response.body, 'Response had a null body').to.exist;
				expect(response.body.total).to.be.a('number');
				expect(response.body.avgSessionDuration).to.be.a('number');
				expect(response.body.avgBreakDuration).to.be.a('number');

				done();
			});
		});

		it('Can get all statistics data', function(done){
			const count = 5;
			chai.request(apiURL).get(`/stats/?statType=all&count=${count}`).end(function(error, response){
				expect(error, 'Error while getting all statistics data').to.not.exist;
				expect(response).to.have.status(200);
				expect(response).to.be.json;

				expect(response.body, 'Response had a null body').to.exist;

				const singleStatSchema = {
					type: 'array',
					maxItems: count,
					items: {
						type:'object',
						required: ['name', 'percent', 'total'],
						properties: {
							name: stringTypeSchema,
							percent: numberTypeSchema,
							total: numberTypeSchema
						}
					}
				}

				const allStatsScheam = {
					type: 'object',
					required: ['browser', 'os', 'device', 'referrer'],
					properties: {
						browser: singleStatSchema,
						os: singleStatSchema,
						device: singleStatSchema,
						referrer: singleStatSchema
					}
				}

				expect(response.body).to.be.jsonSchema(allStatsScheam);

				done();
			});
		});


		it('Can get click data', function(done){
			const count = 12;
			chai.request(apiURL).get(`/stats/?statType=click&count=${count}`).end(function(error, response){

				expect(error, 'Error while getting all statistics data').to.not.exist;
				expect(response).to.have.status(200);
				expect(response).to.be.json;

				expect(response.body, 'Response had a null body').to.exist;

				const clickGroupSchema = {
					id: 'Click Group Schema',
					type: 'array',
					maxItems: count,
					items: {
						id: 'Single Click Item Schema',
						required: ['itemId', 'itemCategory', 'total', 'percent', 'categoryTotal'],
						properties: {
							itemId: stringTypeSchema,
							itemCategory: stringTypeSchema,
							total: numberTypeSchema,
							percent: numberTypeSchema,
							categoryTotal: numberTypeSchema
						}
					}
				}
				const clickCategorySchema = {
					id: 'Click Category Schema',
					type:'object',
					required: ['category', 'clicks'],
					properties: {
						category: stringTypeSchema,
						clicks: clickGroupSchema
					}
				}
				const clickResponseSchema = {
					id: 'Click Response Schema',
					type:'array',
					items: clickCategorySchema
				};

				expect(response.body, 'API response does not match schema').to.be.jsonSchema(clickResponseSchema);

				done();
			});
		});
	});

}

module.exports = testDataAPI;
