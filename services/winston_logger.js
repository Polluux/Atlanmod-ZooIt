const winston = require('winston')
const path = require('path')

const winstonLogger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		winston.format.printf(info => `${info.timestamp} - [${info.level.toUpperCase()}] : ${JSON.stringify(info.message)}`)
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			filename: path.join(__dirname, "../logs/logfile.log")
		})
	]
})//It is possible to create a log file per day with a winstonLogger.configure transport with new namefile each day

module.exports ={
	winstonLogger: winstonLogger
}
