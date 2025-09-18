const mongoose = require("mongoose");

const pageDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }, // Add project reference
    url: { type: String, required: true }, // To track different pages
    filename: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    llmScriptFileName: { type: String } // Store the filename of the generated script

});

// Update index to include projectId
pageDataSchema.index({ userId: 1, projectId: 1, url: 1 }, { unique: true });

module.exports = mongoose.model("PageData", pageDataSchema);