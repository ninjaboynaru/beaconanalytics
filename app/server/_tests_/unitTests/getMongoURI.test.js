require('dotenv-safe').config();
const chai = require('chai');
const expect = chai.expect;

const getMongoUri = require('../../utils/getMongoUri.js');

describe('getMongoUri() unit tests', function(){
	it('Can return production uri', function(){
		process.env.NODE_ENV = 'production';
		expect(getMongoUri()).to.equal(process.env.MONGO_PROD_URI);
	});

	it('Can return development uri', function(){
		process.env.NODE_ENV = 'development';
		expect(getMongoUri()).to.equal(process.env.MONGO_DEV_URI);
	});

	it('Can return testing uri', function(){
		process.env.NODE_ENV = 'testing';
		expect(getMongoUri()).to.equal(process.env.MONGO_TEST_URI);
	});

});
