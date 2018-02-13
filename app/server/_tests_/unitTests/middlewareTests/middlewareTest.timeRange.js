const path = require('path');


function testParseTimeRange(routesDirectory, expect, httpMock) {
	const parseTimeRange = require(path.join(routesDirectory, '/data/middleware/parseTimeRange.js'));

	describe('Parse time range middleware tests', function(){
		it('Appends a dateRange property to the request, with correct date objects', function(){
			const dateFrom = new Date();
			const dateTo = new Date();
			dateFrom.setMonth(dateFrom.getMonth() - 4);

			const mockRequest = httpMock.createRequest({
				query: {
					from:dateFrom.getTime(),
					to:dateTo.getTime()
				}
			});
			const mockResponse = httpMock.createResponse();

			parseTimeRange(mockRequest, mockResponse, function next(){
				expect(mockRequest.dateRange).to.exist;

				expect(mockRequest.dateRange.from).to.be.a('date');
				expect(mockRequest.dateRange.to).to.be.a('date');

				expect(mockRequest.dateRange.from.getTime() ).to.equal(dateFrom.getTime() );
				expect(mockRequest.dateRange.to.getTime() ).to.equal(dateTo.getTime() );
			});
		})

		it('Appends a dateRange property to the request, even when invalid timestamps are passed', function(){
			const mockRequest = httpMock.createRequest({
				query: {
					from:'Not a valid timestamp',
					to:'Also not valid'
				}
			});
			const mockResponse = httpMock.createResponse();

			parseTimeRange(mockRequest, mockResponse, function next(){
				expect(mockRequest.dateRange).to.exist;

				expect(mockRequest.dateRange.from).to.be.a('date');
				expect(mockRequest.dateRange.to).to.be.a('date');

				expect(mockRequest.dateRange.from.getTime() ).to.not.be.NaN;
				expect(mockRequest.dateRange.to.getTime() ).to.not.be.NaN;
			});
		});
	});
}


module.exports = testParseTimeRange;
