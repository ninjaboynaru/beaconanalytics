const chai = require('chai');
const expect = chai.expect;
const httpMock = require('node-mocks-http');

const testDataAuth = require('./middlewareTest.dataAuth.js');
const testCountQuery = require('./middlewareTest.countQuery.js');
const testTimeRange = require('./middlewareTest.timeRange.js');

const routesPath = '../../../routes/';


testDataAuth(routesPath, expect, httpMock);
testCountQuery(routesPath, expect, httpMock);
testTimeRange(routesPath, expect, httpMock);
