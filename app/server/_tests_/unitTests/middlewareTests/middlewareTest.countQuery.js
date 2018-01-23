const path = require('path');


function testParseCountQuery(controllersDirectory, expect, httpMock) {
	const parseCountQuery = require(path.join(controllersDirectory, '/data/middleware/parseCountQuery.js'));

	describe('Parse count query middleware tests', function(){
		it('Appends a count property to the request event when an invalid count query is passed', function(){
			const mockRequest = httpMock.createRequest({
				query: {count: 'This is an invalid count query!'}
			})
			const mockResponse = httpMock.createResponse();

			parseCountQuery(mockRequest, mockResponse, function next(){
				expect(mockRequest.count).to.be.a('number');
			})

		});

		it('Appends a smaller count property to the request when a large count query is passed ', function(){
			const largeNum = 500000000;
			const mockRequest = httpMock.createRequest({
				query: {count: largeNum}
			})
			const mockResponse = httpMock.createResponse();

			parseCountQuery(mockRequest, mockResponse, function next(){
				expect(mockRequest.count).to.be.lessThan(largeNum);
			})

		});

	});
}

module.exports = testParseCountQuery;
