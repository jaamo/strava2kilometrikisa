const mongoose = require('mongoose');

// Define schema for user.
var UserSchema = new mongoose.Schema({
    stravaUserId: { type: Number },
    stravaToken: { type: String },
    kilometrikisaToken: { type: String },
    kilometrikisaSessionId: { type: String },

    // Sync kilometers automatically.
    autosync: { type: Boolean },

    // If true, we know that notification email about sessin timeout
    // is sent to user.
    notifiedByEmail: { type: Boolean }

});

// Create model.
var user = mongoose.model('User', UserSchema);

module.exports = user;
