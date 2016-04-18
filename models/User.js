module.exports = function(mongoose) {

    
    // Define schema for user.
    var UserSchema = new mongoose.Schema({
        stravaUserId: { type: Number },
        stravaToken: { type: String },
        kilometrikisaToken: { type: String },
        kilometrikisaSessionId: { type: String }
    });

    // Create model.
    mongoose.model('User', UserSchema);

}
