const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    microsoftId: { type: String, unique: true, required: true }, // Microsoft unique ID
    name: { type: String, required: true },  
    email: { type: String, required: true, unique: true },  
    createdAt: { type: Date, default: Date.now } // Timestamp
});



module.exports = mongoose.model('User', userSchema);
