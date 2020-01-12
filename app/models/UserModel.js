const mongoose = require('mongoose');
var crypto = require('crypto');
var strava = require('strava-v3');

// Crypto algorithm.
var algorithm = 'aes-256-ctr';
var cryptoPassword = process.env.KILOMETRIKISA_CRYPTO_PASSWORD;

// Define schema for user.
var UserSchema = new mongoose.Schema({
  stravaUserId: { type: Number },
  stravaToken: { type: String },
  tokenExpire: { type: Number },
  refreshToken: { type: String },
  kilometrikisaToken: { type: String },
  kilometrikisaSessionId: { type: String },
  kilometrikisaUsername: { type: String },
  kilometrikisaPassword: { type: String },
  email: { type: String },

  // Sync kilometers automatically.
  autosync: { type: Boolean },

  // If true, we know that notification email about session timeout
  // is sent to user.
  notifiedByEmail: { type: Boolean },
});

UserSchema.methods.updateToken = function() {
  var d = new Date();
  if (d > this.tokenExpire) {
    const payload = strava.oauth.refreshToken(this.refreshToken);
    this.stravaToken = payload.access_token;
    this.tokenExpire = payload.expires_at * 1000;
    this.refreshToken = payload.refresh_token;
  }
};

// Encrypt and set password.
UserSchema.methods.setPassword = function(password) {
  var cipher = crypto.createCipher(algorithm, cryptoPassword);
  var crypted = cipher.update(password, 'utf8', 'hex');
  crypted += cipher.final('hex');
  this.kilometrikisaPassword = crypted;
};

// Decrypt and get password.
UserSchema.methods.getPassword = function() {
  var decipher = crypto.createDecipher(algorithm, cryptoPassword);
  var dec = decipher.update(this.kilometrikisaPassword, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};

// Create model.
var user = mongoose.model('User', UserSchema);

module.exports = user;
