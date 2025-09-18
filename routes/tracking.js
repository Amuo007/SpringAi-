const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const PageData = require("../models/PageData"); // MongoDB Model

// Create a reusable function for handling tracking data
async function handleTracking(req, res) {
    try {
        const data = req.body;
        if (!data || !data.userId || !data.projectId || !data.url) {
            return res.status(400).json({ message: "Invalid data: Missing required fields" });
        }

        const { userId, projectId, url, filename } = data;
        
        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, "../data");
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Check if an entry already exists for this user and project on this page
        let existingEntry = await PageData.findOne({ userId, projectId, url });

        if (existingEntry) {
            const oldFilePath = path.join(dataDir, existingEntry.filename);
            
            // Check if the file exists
            if (fs.existsSync(oldFilePath)) {
                try {
                    const oldData = JSON.parse(fs.readFileSync(oldFilePath, "utf8"));
                    
                    // Compare essential data (excluding timestamp or other changing fields if needed)
                    if (JSON.stringify(oldData) === JSON.stringify(data)) {
                        return res.json({ 
                            message: "No changes detected. Data not updated.",
                            filename: existingEntry.filename,
                            pageId: existingEntry._id
                        });
                    }
                } catch (err) {
                    // Continue with update if file reading fails
                }
            }

            // Update the existing file
            try {
                fs.writeFileSync(oldFilePath, JSON.stringify(data, null, 2), "utf8");
            } catch (err) {
                // Still update database entry even if file write fails
            }
            
            // Update the updatedAt timestamp in the database
            try {
                existingEntry.updatedAt = new Date();
                await existingEntry.save();
            } catch (dbErr) {
                return res.status(500).json({ message: "Database error: " + dbErr.message });
            }
            
            return res.json({ 
                message: "Data updated successfully", 
                filename: existingEntry.filename,
                pageId: existingEntry._id
            });
        }

        // If no existing entry, create a new one with a unique filename
        const timestamp = Date.now();
        // Create a URL-safe identifier from the page URL
        const urlIdentifier = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
        const dataFilename = `page-data-${projectId}-${urlIdentifier}-${timestamp}.json`;
        const filePath = path.resolve(dataDir, dataFilename);

        // Save new page data to a new JSON file
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
        } catch (err) {
            // Continue with database entry even if file write fails
        }

        // Store metadata in MongoDB
        try {
            const pageEntry = new PageData({
                userId,
                projectId,
                url,  
                filename: dataFilename,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const savedEntry = await pageEntry.save();
            
            return res.json({ 
                message: "Data stored successfully", 
                filename: dataFilename,
                pageId: savedEntry._id
            });
        } catch (dbErr) {
            return res.status(500).json({ message: "Database error: " + dbErr.message });
        }

    } catch (error) {
        return res.status(500).json({ message: "Server error: " + error.message });
    }
}


router.post("/collect", handleTracking);
router.post("/api/track", handleTracking);

module.exports = router;