const path = require('path');


function testDataAuthHandler(controllersDirectory, expect, httpMock) {
	const testingKey = 'Z1HZ123';
	const invalidKey = 'This is definitely not a valid key';

	const dataAuthHandler = require(path.join(controllersDirectory, '/data/dataAuth.js'));

	describe('Data authorization middleware tests', function(){
		it('Can respond with 403 error on invalid key and not call the next() function', function(){
			const mockRequest = httpMock.createRequest({
				method:'GET',
				url: `data/${invalidKey}`,
				headers: {host: 'interwebz'},
				params: {
					key: invalidKey
				}
			});
			const mockResponse = httpMock.createResponse();

			dataAuthHandler(mockRequest, mockResponse, function next(){
				let errorMsg = 'auth handler called next() when invalid credentials were passed';
				errorMsg += ' auth handler should send http response instead of calling next()';
				expect.fail(null, null, errorMsg, null);
			});

			expect(mockResponse.statusCode, 'data auth handler did not respond with 403 status code').to.equal(403);
		});

		it('Can call the next() function when a valid key is passed', function(done){
			const mockRequest = httpMock.createRequest({
				method:'GET',
				url: `data/${testingKey}`,
				headers: {host: '*'},
				params: {
					key: testingKey
				}
			});
			const mockResponse = httpMock.createResponse();

			dataAuthHandler(mockRequest, mockResponse, function next(){
				done();
			});
		});
	});

}

module.exports = testDataAuthHandler;
