const mongoose = require('mongoose');

// Define schema for user.
var LogSchema = new mongoose.Schema({
  stravaUserId: { type: Number },
  visible: { type: Boolean }, // Visible to user
  severity: { type: Number }, // 0 = info, 1 = error
  message: { type: String },
  date: { type: Date },
  guruMessage: { type: String },
});

var log = mongoose.model('Log', LogSchema);

/**
 * Add message to log.
 *
 * @param  {[type]} stravaUserId [description]
 * @param  {[type]} visible      [description]
 * @param  {[type]} severity     [description]
 * @param  {[type]} message      [description]
 * @param  {[type]} guruMessage  [description]
 * @return {[type]}              [description]
 */
log.log = function(message, guruMessage, stravaUserId, visible, severity) {
  var d = new Date();

  // Default values.
  if (typeof severity == 'undefined') severity = 0;
  if (typeof guruMessage == 'undefined') guruMessage = '';
  if (typeof stravaUserId == 'undefined') stravaUserId = 0;
  if (typeof visible == 'undefined') visible = false;

  var log = new this();
  log.set('stravaUserId', stravaUserId);
  log.set('visible', visible);
  log.set('severity', severity);
  log.set('message', message);
  log.set('guruMessage', guruMessage);
  log.set('date', d);
  log.save();
};

module.exports = log;
