import Log from '@chat-bot/core';

declare global {
	var log;
}
global.log = new Log();
export default new Log();
