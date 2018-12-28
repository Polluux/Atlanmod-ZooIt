const winston = require('winston')
const path = require('path') 
require('winston-daily-rotate-file')

const winstonLogger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp({
			format: 'HH:mm:ss'
		}),
		winston.format.printf(info => `${info.timestamp} - [${info.level.toUpperCase()}] : ${JSON.stringify(info.message)}`)
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.DailyRotateFile({
			filename: path.join(__dirname, "../logs/%DATE%.log"),
			datePattern: 'YYYY-MM-DD'
		})
	]
})//It is possible to create a log file per day with a winstonLogger.configure transport with new namefile each day

module.exports ={
	winstonLogger: winstonLogger
}
