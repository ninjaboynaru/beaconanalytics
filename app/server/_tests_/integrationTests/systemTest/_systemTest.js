require('dotenv-safe').config();
process.env.NODE_ENV = 'testing';
const key = process.env.KEY;

const serverPort = process.env.PORT;

const chai = require('chai');

const expect = chai.expect;
const server = require('../../../server.js');
const generateSampleData = require('../../../utils/generateSampleData.js');

const testWS = require('./systemTest.ws.js');
const testDataAPI = require('./systemTest.dataAPI.js');
const testStaticFiles = require('./systemTest.staticFiles.js');

let hostName = `localhost:${serverPort}`;


before('Start server and database', function(done){
	server.start(function(error){
		if(error) {
			expect.fail(null, null, 'Error starting server and database: ' + error);
		}
		else {
			done();
		}
	},serverPort);
});


before('Generate sample data', function(done){
	generateSampleData(20, function(error){
		if(error) {
			expect.fail(null, null, 'Error generating sample data: ' + error);
		}
		else {
			done();
		}
	}, false, false);
});

after('Close server and database', function(done){
	server.close(function(){
		done();
	});
});

testStaticFiles(expect, chai, hostName);
testDataAPI(expect, chai, hostName, key);
testWS(expect, hostName, key);
