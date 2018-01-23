const chai = require('chai');
const expect = chai.expect;

const getMongoUri = require('../../utils/getMongoUri.js');
const mongoConfig = require('../../../config/mongo.config.json');



describe('getMongoUri() unit tests', function(){
	it('Can return production uri', function(){
		process.env.NODE_ENV = 'production';
		expect(getMongoUri()).to.equal(mongoConfig.productionUri);
	});

	it('Can return development uri', function(){
		process.env.NODE_ENV = 'development';
		expect(getMongoUri()).to.equal(mongoConfig.developmentUri);
	});

	it('Can return testing uri', function(){
		process.env.NODE_ENV = 'testing';
		expect(getMongoUri()).to.equal(mongoConfig.testingUri);
	});

});
