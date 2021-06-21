const { transports, format, createLogger } = require('winston');

const logger = createLogger({
  level: process.env.LOGGING_LEVEL || 'info',
  format: format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()],
});

module.exports = logger;
