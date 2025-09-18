const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },  // Project name
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Linked to User
    scriptFileName: { type: String },  // Store the filename of the JavaScript file
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);