const ws = require('ws');
const wsHandler = require('./sessionWS/wsHandler.js');

function appWS(httpServer) {
	const websocketServer = new ws.Server({server:httpServer});
	websocketServer.on('connection', wsHandler)
	return httpServer;
}

module.exports = appWS;
