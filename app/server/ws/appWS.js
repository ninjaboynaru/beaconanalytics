const ws = require('ws');
const wsHandler = require('./wsHandler.js');

function appWS(httpServer) {
	const websocketServer = new ws.Server({server:httpServer});
	websocketServer.on('connection', wsHandler)
	return httpServer;
}

module.exports = appWS;
