const logger = require('../services/logger.js');


/**
* @Class
*
* Queue object that saves session documents to the databse after a set period of time passes.
* Sessions are saved to the databse in the order they are submitted to the queue.
*
* @param {number} maxQueueSize -  Max ammount of sessions to keep in the queue at a time. If this limit
* is reached, any other submitted sessions will be discarded.
* @param {number} queueWaitTime - How long to keep sessions in the queue before saving them.
* @param {WinstonLogger} logger - Winston Logger object to use for logging.
*
*/
const SessionQueue = function(maxQueueSize, queueWaitTime, logger)
{
	const _self = this;
	const _queue = [];
	const _maxQueueSize = maxQueueSize;
	const _queueWaitTime = queueWaitTime;

	this.enqueueSession = function(session)
	{
		if(_queue.size >= _maxQueueSize)
		{
			return;
		}
		else if(_self.sessionInQueue(session) == true)
		{
			return;
		}
		else
		{
			const timer = setTimeout(_saveNextSessionToDatabase, _queueWaitTime);
			_queue.push({timer:timer, session:session});
		}
	}

	this.sessionInQueue = function(session)
	{
		for(let queueEntry of _queue)
		{
			if(queueEntry.session.hash == session.hash)
			{
				return true;
			}
		}

		return false
	}

	this.removeSession = function(session)
	{
		for(let i = 0; i < _queue.length; i++)
		{
			if(_queue[i].session.hash == session.hash)
			{
				const queueEntry = _queue.splice(i, 1)[0];
				clearTimeout(queueEntry.timer);
				return queueEntry.session;
			}
		}

		return null;
	}

	function _dequeueSession()
	{
		const queueEntry = _queue.shift();
		clearTimeout(queueEntry.timer);
		return queueEntry.session;
	}
	function _saveNextSessionToDatabase()
	{
		const session = _dequeueSession();
		logger.debug('Saving session to database');

		session.save(function(error){
			if(error)
			{
				let metaData = {mongooseError: error, sessionObject: session};
				logger.error({message:'Error while saving session modal to databse', meta:metaData});
			}
		});
	}
}



module.exports = SessionQueue;
