const mongoose = require('mongoose');

// Define schema for user.
var UserSchema = new mongoose.Schema({
    stravaUserId: { type: Number },
    stravaToken: { type: String },
    kilometrikisaToken: { type: String },
    kilometrikisaSessionId: { type: String }
});

// Create model.
var user = mongoose.model('User', UserSchema);

module.exports = user;
