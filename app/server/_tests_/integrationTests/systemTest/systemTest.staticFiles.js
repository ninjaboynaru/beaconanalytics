const chaiHttp = require('chai-http');

function testStaticFiles(expect, chai, hostName) {
	chai.use(chaiHttp);

	describe('Static file tests', function(){
		it('Can return html file on root url', function(done){
			chai.request(hostName).get('/').end(function(error, response){
				expect(error, 'Getting index.html resulted in an error').to.not.exist;
				expect(response, 'Getting index.html responeded with not a html content-type').to.be.html;

				done();
			});
		});

		it('Can return html file and 404 status code on not existent file path', function(done){
			const absurdPath = '/sadfjbsd';
			chai.request(hostName).get(absurdPath).end(function(error, response){
				expect(response, 'Getting not existent file responeded with not a html content-type').to.be.html;
				expect(response).to.have.status(404);

				done();
			});
		});
	});
}

module.exports = testStaticFiles;
