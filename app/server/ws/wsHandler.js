const sessionModel = require('../models/session.js');
const SessionQueue = require('./sessionQueue.js');
const errorBuilder = require('./errorBuilder.js');
const verifyCredentials = require('../services/verifyCredentials.js');
const logger = require('../services/logger.js');
const queueConfig = require('../../config/sessionQueue.config.json');
const wsConfig = require('../../config/ws.config.json');

let connectionCount = 0;
let queueWaitTime = process.env.QUEUE_WAIT_TIME || queueConfig.queueWaitTime;
if(process.env.NODE_ENV != 'production') {
	queueWaitTime = 2000;
}

const queue =  new SessionQueue(queueConfig.maxQueueSize, queueWaitTime, logger);


/**
* @route-handler
* Web Socket route handler to handler receiving of analytics data.
* To be used with the express-ws package.
*/
function wsHandler(ws, httpRequest) {
	logger.debug('User connected');

	let timeout = false;
	let authorized = false;
	let session;
	let clientUnresponsive = false;

	const connectionDurationTimeout = setTimeout(function(){
		timeout = true;
		ws.close();
	}, wsConfig.maxConnectionTime);


	const pingInterval = setInterval(function pingClient(){
		if(clientUnresponsive == true) {
			logger.debug('User did not respond to ping. Disconnecting');
			ws.close();
		}
		else {
			clientUnresponsive = true;
			ws.ping();
		}
	}, process.env.PING_FREQUENCY || wsConfig.pingFrequency);


	ws.on('pong', function(){
		logger.debug('User has responded to ping');
		clientUnresponsive = false;
	});

	ws.on('close', function() {
		connectionCount -= 1;
		clearTimeout(connectionDurationTimeout);
		clearInterval(pingInterval);

		if(authorized == false || timeout == true || clientUnresponsive == true)
		{
			return;
		}
		else
		{
			session.end();
			queue.enqueueSession(session);
		}
	});

	ws.on('error', function(error) {
		if(error.code == 'ECONNRESET')
		{
			ws.close();
			return;
		}
		else
		{
			const metaData = {error:error, session:session, websocket:ws, request:httpRequest};
			logger.error({
				message:'Error occured in the sesssion websocket route',
				meta:metaData
			});

			ws.close();
		}
	});

	function sendSession() {
		const jsonString = JSON.stringify({session:session});
		ws.send(jsonString);
	}

	ws.on('message', function(data) {
		try
		{
			data = JSON.parse(data);
		}
		catch(error)
		{
			ws.send(errorBuilder.buildError('Invalid JSON', 'The provided JSON data could not be parsed.') );
			return;
		}

		if(authorized == false)
		{
			if(data.dataType == 0 && data.key)
			{
				const key = data.key;

				if(verifyCredentials(key) === true)
				{
					authorized = true;

					session = new sessionModel();
					const userAgentHeader = httpRequest.headers['user-agent'];
					const langHeader = httpRequest.headers['accept-language'];
					const ipAddress =  httpRequest.connection.remoteAddress;
					session.start(userAgentHeader, langHeader, ipAddress);

					if(queue.sessionInQueue(session) == true)
					{
						session = queue.removeSession(session);
						session.resume();
					}
					sendSession();
				}
				else
				{
					ws.send(errorBuilder.buildError('Unauthorized', 'An invalid key was provided or the host origin is not authorized.') );
				}
			}
			else
			{
				ws.send(errorBuilder.buildError('Unauthorized', 'Client not authorized. Must send authorization data with a key and a correct dataType.') );
			}
		}
		else if(authorized == true && data.dataType == 0)
		{
			//duplicate authorization attempt. do nothing.
			sendSession();
			return;
		}
		else if(data.dataType == 1)
		{
			if(typeof data.screenSize == 'object')
			{
				const isNum = (val) => !Number.isNaN(Number(val));
				if(isNum(data.screenSize.width) == false || isNum(data.screenSize.height) == false)
				{
					ws.send(errorBuilder.buildError('Invalid property type', 'The properties screenSize.width or screenSize.height were undefiend or not valid numbers.') );
				}
				else
				{
					session.screenSize = {width:data.screenSize.width, height:data.screenSize.height};
					sendSession();
				}
			}
			else
			{
				ws.send(errorBuilder.buildError('Invalid property type', 'The property screenSize was undefined or not a valid object') );
			}
		}
		else if(data.dataType == 2)
		{
			// referrer is allowed to be an empty string
			if(data.referrer || data.referrer.length == 0)
			{
				session.referrer = data.referrer;
				sendSession();
			}
			else
			{
				ws.send(errorBuilder.missingParameter('referrer') );
			}
		}
		else if(data.dataType == 3)
		{
			if(data.itemId && data.itemCategory)
			{
				session.addClick(data.itemId, data.itemCategory);
				sendSession();
			}
			else
			{
				ws.send(errorBuilder.missingParameter('itemId or itemCategory') );
			}
		}
		else
		{
			ws.send(errorBuilder.buildError('Unrecognized Input', 'The provided input is unrecognized, malformed, missing parameters, or does not match the input data structure.') );
		}
	});

	if(connectionCount >= wsConfig.maxConnections) {
		logger.debug('Max connections reached. Rejecting user connection');
		ws.close();
	}
	else {
		connectionCount += 1;
	}

}


module.exports = wsHandler;
