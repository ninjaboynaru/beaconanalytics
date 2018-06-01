require('dotenv-safe').config();
const chai = require('chai');
const expect = chai.expect;

const verifyCredentials = require('../../services/verifyCredentials.js');


describe('verifyCredentials() unit tests', function(){
	it('Can return true for a valid key', function(){
		const validKey = process.env.KEY;
		expect(verifyCredentials(validKey)).to.be.true;
	});

	it('Can return false for an invalid key', function(){
		const invalidKey = 'This can not possible be a valid key';
		expect(verifyCredentials(invalidKey)).to.be.false;
	});
});
