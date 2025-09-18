const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const path = require("path");
const fs = require("fs");

router.get("/", async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/"); // Redirect to login if not logged in
    }
    
    try {
        // Fetch user's projects from the database
        const userProjects = await Project.find({ userId: req.session.user._id });
        
        // Render dashboard with user and their projects
        res.render("dashboard", { 
            user: req.session.user,
            projects: userProjects 
        });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.render("dashboard", { 
            user: req.session.user,
            projects: [] 
        });
    }
});

router.get("/create-project", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/"); // Redirect to login if not logged in
    }
    res.render("create-project");
});

// Update this in your existing dashboard.js router file

// Handle Project Creation
// Update this in your dashboard.js file
router.post("/create-project", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).send("Unauthorized");
        }

        const { projectName } = req.body;
        if (!projectName) {
            return res.status(400).send("Project name is required");
        }

        // Store Project in MongoDB first to get the ID
        const newProject = new Project({
            name: projectName,
            userId: req.session.user._id,
            createdAt: new Date(),
        });

        await newProject.save();
        console.log(`Project "${projectName}" stored in MongoDB with ID: ${newProject._id}`);

        // Create unique JavaScript file name
        const scriptFileName = `script-${Date.now()}.js`;
        const scriptFilePath = path.join(__dirname, "../public/scripts", scriptFileName);

        // Ensure the 'public/scripts' directory exists
        if (!fs.existsSync(path.dirname(scriptFilePath))) {
            fs.mkdirSync(path.dirname(scriptFilePath), { recursive: true });
        }

        // Read the tracking template file
        const templatePath = path.join(__dirname, "../public/tracking-template.js");
        let scriptContent = fs.readFileSync(templatePath, "utf8");

        // Replace placeholders with actual user ID and project ID
        const userId = req.session.user._id || "UNKNOWN_USER";
        scriptContent = scriptContent.replace("__USER_ID__", userId);
        scriptContent = scriptContent.replace("__PROJECT_ID__", newProject._id);
        scriptContent = scriptContent.replace("__SCRIPT_FILENAME__", scriptFileName);

        // Save script file asynchronously
        fs.writeFile(scriptFilePath, scriptContent, "utf8", async (err) => {
            if (err) {
                console.error("Error writing script file:", err);
                return res.status(500).send("Failed to generate tracking script.");
            }

            // Update the project with the script filename
            newProject.scriptFileName = scriptFileName;
            await newProject.save();

            // Redirect user to the setup page
            res.render("loading-screen", {
                scriptFileName: scriptFileName,
                projectId: newProject._id
            });
        });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send("Server error");
    }
});

router.get("/project-setup-codeblock", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/"); // Redirect to login if not logged in
    }
    const scriptFileName = req.query.script; // Retrieve script file name
    const projectId = req.query.projectId; // Retrieve project ID
    console.log(projectId)
    
    res.render("project-setup-codeblock", { 
        scriptFileName, 
        projectId 
    });
});



// Add/modify this route in your dashboard.js file
router.get("/flowchartMODE", (req, res) => {
    // Get the parameters from the query string
    const projectId = req.query.projectId;
    const pageId = req.query.pageId;
    const pageUrl = req.query.pageUrl;
    
    // Render the flowchart mode template with the parameters
    res.render("flowchartMODE", {
        projectId: projectId,
        pageId: pageId,
        pageUrl: pageUrl
    });
});




module.exports = router;
 