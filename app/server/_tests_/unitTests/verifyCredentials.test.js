const chai = require('chai');
const expect = chai.expect;

const verifyCredentials = require('../../services/verifyCredentials.js');
const credentialsConfig = require('../../../config/credentials.config.json');


describe('verifyCredentials() unit tests', function(){
	it('Can return correct real credentials', function(){
		const realCredentials = credentialsConfig[1];
		const matchingCredentials = verifyCredentials(realCredentials.allowedOrigins[0], realCredentials.key);

		expect(matchingCredentials).to.deep.equal(realCredentials);
	});

	it('Can return undefined for fake credentials', function(){
		const matchingCredentials = verifyCredentials('fakeHost.comz', 'Not a real key');
		expect(matchingCredentials).to.not.exist;
	});

	it('Can match against a custom credentials object', function(){
		const customCreds = {
			key:'abcdefghijklmnop',
			allowedOrigins: [
				'website1.com',
				'website2.com'
			]
		};

		const matchingCredentials = verifyCredentials(customCreds.allowedOrigins[0], customCreds.key, customCreds);
		expect(matchingCredentials).to.deep.equal(customCreds);
	});

	it('Can match against a custom credentials with allowedOrigins set to *', function(){
		const customCreds = {
			key:'abcdefghijklmnopQRST',
			allowedOrigins: ['localhost', 'localhost:8080', '*']
		};

		const matchingCredentials = verifyCredentials('ANY host name will do', customCreds.key, customCreds);
		expect(matchingCredentials).to.deep.equal(customCreds);
	});

});
