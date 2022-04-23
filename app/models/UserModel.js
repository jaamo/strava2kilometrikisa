const mongoose = require('mongoose');
var crypto = require('crypto');
var strava = require('strava-v3');

const logger = require('../helpers/logger');

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

  // Sync kilometers automatically.
  autosync: { type: Boolean },

  // Sync e-bike kilometers.
  ebike: { type: Boolean },
});

// https://github.com/UnbounDev/node-strava-v3/blob/master/lib/oauth.js#L102
UserSchema.methods.updateToken = function () {
  var d = new Date();
  var user = this;
  if (d > this.tokenExpire) {
    return strava.oauth
      .refreshToken(this.refreshToken)
      .then(function (account) {
        user.stravaToken = account.access_token;
        user.tokenExpire = account.expires_at * 1000;
        user.refreshToken = account.refresh_token;
        user.save(); // Persis the changes to the DB
      })
      .catch((e) => logger.warn('Error updating the user token', e));
  }

  return Promise.resolve();
};

// Encrypt and set password.
UserSchema.methods.setPassword = function (password) {
  var cipher = crypto.createCipher(algorithm, cryptoPassword);
  var crypted = cipher.update(password, 'utf8', 'hex');
  crypted += cipher.final('hex');
  this.kilometrikisaPassword = crypted;
};

// Decrypt and get password.
UserSchema.methods.getPassword = function () {
  var decipher = crypto.createDecipher(algorithm, cryptoPassword);
  var dec = decipher.update(this.kilometrikisaPassword, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};

// Create model.
var user = mongoose.model('User', UserSchema);

module.exports = user;
