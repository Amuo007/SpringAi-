const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const PageData = require("../models/PageData");
const { generateLLMScript } = require('../utils/llmService'); // Import the script generation function
const path = require("path");
const fs = require("fs");



router.get('/generatescript/:pageId', async (req, res) => {
    try {
        const { pageId } = req.params;

        // Fetch the specific page data using pageId
        const pageData = await PageData.findById(pageId);

        if (!pageData) {
            return res.status(404).send("Page data not found.");
        }

        // ✅ Check if a script already exists for this page
        if (pageData.llmScriptFileName) {
            const scriptPath = path.join(__dirname, '../data/onboarding-scripts/', pageData.llmScriptFileName);
            
            // ✅ Ensure the file actually exists in the directory before using it
            if (fs.existsSync(scriptPath)) {
                console.log("Existing script found. Returning stored script.");
                return res.send(`Script already exists: ${pageData.llmScriptFileName}`);
            }
        }

        // ❌ If no script exists, generate a new one
        const scriptFileName = await generateLLMScript(pageData);

        if (!scriptFileName) {
            return res.status(500).send("Failed to generate script.");
        }

        res.send(`Script generated successfully: ${scriptFileName}`);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Failed to generate script.");
    }
});


// Add this route to your existing projectRoutes.js file
router.get('/checkscriptstatus/:pageId', async (req, res) => {
    try {
        const { pageId } = req.params;
        const pageData = await PageData.findById(pageId);
        
        if (!pageData) {
            return res.status(404).json({ scriptExists: false });
        }
        
        // Check if script exists and the file is present
        if (pageData.llmScriptFileName) {
            const scriptPath = path.join(__dirname, '../data/onboarding-scripts/', pageData.llmScriptFileName);
            const fileExists = fs.existsSync(scriptPath);
            
            return res.json({ 
                scriptExists: fileExists,
                scriptFileName: fileExists ? pageData.llmScriptFileName : null
            });
        }
        
        return res.json({ scriptExists: false });
    } catch (error) {
        console.error("Error checking script status:", error);
        return res.status(500).json({ scriptExists: false, error: error.message });
    }
});




// Add this route to your existing router
router.get('/onboarding/:projectId/:pageId', async (req, res) => {
    try {
        const { projectId, pageId } = req.params;
        console.log("Looking for script with projectId:", projectId, "pageId:", pageId);
        
        // Use proper MongoDB ObjectId conversion if necessary
        const pageData = await PageData.findOne({ 
            projectId: projectId,
            _id: pageId 
        });
        
        if (!pageData) {
            console.log("No page data found for these IDs");
            return res.status(404).send("No page data found.");
        }
        
        // Check if this page has an associated onboarding script
        if (!pageData.llmScriptFileName) {
            console.log("No script file associated with this page");
            return res.status(404).send("No script available for this page.");
        }
        
        // Construct the script path
        const scriptPath = path.join(__dirname, '../data/onboarding-scripts/', pageData.llmScriptFileName);
        
        // Check if the file exists
        if (!fs.existsSync(scriptPath)) {
            console.log("Script file not found at path:", scriptPath);
            return res.status(404).send("Script file not found.");
        }
        
        console.log("Serving onboarding script:", scriptPath);
        
        // Set proper Content-Type for JavaScript
        res.setHeader('Content-Type', 'application/javascript');
        
        // Send the script file
        return res.sendFile(scriptPath);
        
    } catch (error) {
        console.error("Error serving onboarding script:", error);
        res.status(500).send("Server error: " + error.message);
    }
});

// Add this to projectRoutes.js
router.get("/flowchartMODE", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/");
        }
        
        const { projectId, pageId, pageUrl } = req.query;
        const pageData = await PageData.findById(pageId);
        
        if (!pageData) {
            return res.status(404).send("Page data not found");
        }
        
        const dataFilePath = path.join(__dirname, "../data", pageData.filename);
        let pageElements = [];
        let pageMetadata = {};
        
        if (fs.existsSync(dataFilePath)) {
            try {
                const fileContent = fs.readFileSync(dataFilePath, "utf8");
                const detailedData = JSON.parse(fileContent);
                
                // Additional analysis to extract context and relationships
                const enhancedData = analyzePageData(detailedData);
                
                // Include full data for the LLM context
                pageMetadata = {
                    url: detailedData.url || pageUrl,
                    title: detailedData.title || 'Untitled Page',
                    fullText: detailedData.textContent || '',
                    pageAnalysis: enhancedData.pageContext
                };
                
                // Use the enhanced element data
                pageElements = enhancedData.elements;
                
            } catch (err) {
                console.error("Error processing page data:", err);
                pageElements = [];
                pageMetadata = { url: pageUrl, title: 'Error loading page data' };
            }
        }
        
        res.render("flowchartMODE", {
            projectId,
            pageId,
            pageUrl,
            pageElements: JSON.stringify(pageElements),
            pageMetadata: JSON.stringify(pageMetadata)
        });
    } catch (error) {
        console.error("Error in flowchart mode:", error);
        res.status(500).send("Server error");
    }
});




// Enhanced analysis function to extract more context
function analyzePageData(pageData) {
    // Initialize results
    const results = {
        elements: [],
        pageContext: {
            pagePurpose: "",
            mainSections: [],
            keyInteractions: []
        },
        connections: []
    };
    
    // Extract the page's main purpose based on title and content
    const title = pageData.title || '';
    const textContent = pageData.textContent || '';
    
    // Analyze page purpose
    if (title.toLowerCase().includes('dashboard')) {
        results.pageContext.pagePurpose = "Dashboard Page";
    } else if (title.toLowerCase().includes('login') || textContent.toLowerCase().includes('sign in')) {
        results.pageContext.pagePurpose = "Authentication Page";
    } else if (title.toLowerCase().includes('profile')) {
        results.pageContext.pagePurpose = "User Profile Page";
    } else if (title.toLowerCase().includes('setting')) {
        results.pageContext.pagePurpose = "Settings Page";
    } else if (textContent.toLowerCase().includes('application') && 
               (textContent.toLowerCase().includes('manage') || textContent.toLowerCase().includes('create'))) {
        results.pageContext.pagePurpose = "Application Management Page";
    } else {
        results.pageContext.pagePurpose = "Content Page";
    }
    
    // Process interactive elements to add context
    const interactiveElements = pageData.interactiveElements || [];
    
    // Group elements by their container/purpose
    const buttonGroups = {};
    const linkGroups = {};
    const formControls = {};
    
    interactiveElements.forEach((element, index) => {
        const elementText = element.text || '';
        const elementId = element.id || '';
        const elementClass = element.class || '';
        let elementContext = '';
        
        // Analyze the text to determine the element's purpose
        if (element.tag === 'BUTTON') {
            if (elementText.toLowerCase().includes('submit') || 
                elementText.toLowerCase().includes('save')) {
                elementContext = 'Submit Action';
            } else if (elementText.toLowerCase().includes('cancel') || 
                       elementText.toLowerCase().includes('close')) {
                elementContext = 'Cancel Action';
            } else if (elementText.toLowerCase().includes('add') || 
                       elementText.toLowerCase().includes('create') || 
                       elementText.toLowerCase().includes('new')) {
                elementContext = 'Create Action';
            } else if (elementText.toLowerCase().includes('delete') || 
                       elementText.toLowerCase().includes('remove')) {
                elementContext = 'Delete Action';
            } else if (elementText.toLowerCase().includes('edit') || 
                       elementText.toLowerCase().includes('update')) {
                elementContext = 'Edit Action';
            } else if (elementText.toLowerCase().includes('login') || 
                       elementText.toLowerCase().includes('sign in')) {
                elementContext = 'Authentication Action';
            } else {
                elementContext = 'Action Button';
            }
            
            // Group similar buttons
            if (!buttonGroups[elementContext]) {
                buttonGroups[elementContext] = [];
            }
            buttonGroups[elementContext].push(index);
        }
        
        // Process links
        else if (element.tag === 'A') {
            let linkType = 'Navigation Link';
            
            if (elementText.toLowerCase().includes('dashboard')) {
                linkType = 'Dashboard Link';
            } else if (elementText.toLowerCase().includes('profile')) {
                linkType = 'Profile Link';
            } else if (elementText.toLowerCase().includes('setting')) {
                linkType = 'Settings Link';
            } else if (elementText.toLowerCase().includes('logout') || 
                       elementText.toLowerCase().includes('sign out')) {
                linkType = 'Logout Link';
            } else if (elementText.toLowerCase().includes('application') || 
                       elementText.toLowerCase().includes('approval')) {
                linkType = 'Application Link';
            }
            
            elementContext = linkType;
            
            // Group similar links
            if (!linkGroups[linkType]) {
                linkGroups[linkType] = [];
            }
            linkGroups[linkType].push(index);
        }
        
        // Process form elements
        else if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tag)) {
            let inputType = 'Form Field';
            
            if (elementId.toLowerCase().includes('name') || 
                elementClass.toLowerCase().includes('name')) {
                inputType = 'Name Field';
            } else if (elementId.toLowerCase().includes('email') || 
                       elementClass.toLowerCase().includes('email')) {
                inputType = 'Email Field';
            } else if (elementId.toLowerCase().includes('password') || 
                       elementClass.toLowerCase().includes('password')) {
                inputType = 'Password Field';
            } else if (elementId.toLowerCase().includes('search') || 
                       elementClass.toLowerCase().includes('search')) {
                inputType = 'Search Field';
            }
            
            elementContext = inputType;
            
            // Group form controls
            if (!formControls[inputType]) {
                formControls[inputType] = [];
            }
            formControls[inputType].push(index);
        }
        
        // Process form element
        else if (element.tag === 'FORM') {
            if (elementId.toLowerCase().includes('login') || 
                elementClass.toLowerCase().includes('login')) {
                elementContext = 'Login Form';
            } else if (elementId.toLowerCase().includes('search') || 
                       elementClass.toLowerCase().includes('search')) {
                elementContext = 'Search Form';
            } else if (elementId.toLowerCase().includes('signup') || 
                       elementClass.toLowerCase().includes('signup')) {
                elementContext = 'Signup Form';
            } else {
                elementContext = 'Data Entry Form';
            }
        }
        
        // Create enhanced element data with context
        results.elements.push({
            id: `element-${index}`,
            name: elementText ? (elementText.length > 25 ? elementText.substring(0, 23) + '...' : elementText) : `${element.tag} Element`,
            fullText: elementText,
            type: element.tag.toLowerCase(),
            category: 'interactive',
            context: elementContext,
            x: 300 + (index % 3) * 220,
            y: 150 + Math.floor(index / 3) * 80,
            width: 200,
            height: 50,
            originalTag: element.tag,
            originalId: elementId,
            originalClass: elementClass
        });
    });
    
    // Process tables if present
    if (pageData.tables && pageData.tables.length > 0) {
        let tableIndex = 0;
        
        pageData.tables.forEach(table => {
            // Determine table purpose
            let tablePurpose = "Data Table";
            
            if (table.caption) {
                tablePurpose = table.caption;
            } else if (table.id) {
                const idLower = table.id.toLowerCase();
                if (idLower.includes('user')) tablePurpose = "Users Table";
                else if (idLower.includes('app')) tablePurpose = "Applications Table";
                else if (idLower.includes('product')) tablePurpose = "Products Table";
                else if (idLower.includes('order')) tablePurpose = "Orders Table";
                else if (idLower.includes('setting')) tablePurpose = "Settings Table";
            } else if (table.headers && table.headers.length > 0) {
                // Try to determine purpose from headers
                const headerText = table.headers.join(' ').toLowerCase();
                if (headerText.includes('user') || (headerText.includes('name') && headerText.includes('email'))) {
                    tablePurpose = "Users Table";
                } else if (headerText.includes('application') || (headerText.includes('form') && headerText.includes('status'))) {
                    tablePurpose = "Applications Table";
                } else if (headerText.includes('product') || (headerText.includes('item') && headerText.includes('price'))) {
                    tablePurpose = "Products Table";
                }
            }
            
            // Create table element
            results.elements.push({
                id: `table-${tableIndex}`,
                name: tablePurpose,
                type: 'table',
                category: 'data',
                context: `${table.rowCount} row${table.rowCount !== 1 ? 's' : ''}, ${table.columnCount} column${table.columnCount !== 1 ? 's' : ''}`,
                headers: table.headers,
                x: 500,
                y: 300 + (tableIndex * 120),
                width: 220,
                height: 100,
                originalTag: 'TABLE',
                originalId: table.id,
                originalClass: table.className,
                sampleData: table.sampleData,
                isEmpty: !!table.emptyText
            });
            
            // Add table to page context
            results.pageContext.mainSections.push(`${tablePurpose}: ${table.rowCount} rows`);
            
            tableIndex++;
        });
    }
    
    // Process lists if present
    if (pageData.lists && pageData.lists.length > 0) {
        let listIndex = 0;
        
        pageData.lists.forEach(list => {
            // Determine list purpose
            let listPurpose = "List";
            let listCategory = "content";
            
            if (list.title) {
                listPurpose = list.title;
            } else if (list.context) {
                listPurpose = `${list.context} List`;
                if (list.context.toLowerCase() === 'navigation' || list.context.toLowerCase() === 'menu') {
                    listCategory = "navigation";
                }
            } else {
                // Check items for common patterns
                const navItems = ['home', 'dashboard', 'profile', 'settings', 'logout', 'sign out'];
                const allItemsText = list.items.map(item => item.text.toLowerCase()).join(' ');
                
                if (list.items.some(item => item.hasLinks) && 
                    list.items.some(item => navItems.some(nav => item.text.toLowerCase().includes(nav)))) {
                    listPurpose = "Navigation Menu";
                    listCategory = "navigation";
                } else if (list.items.some(item => item.hasButtons)) {
                    listPurpose = "Action List";
                    listCategory = "interactive";
                } else if (allItemsText.includes('item') && allItemsText.includes('price')) {
                    listPurpose = "Product List";
                } else if (allItemsText.includes('user') || allItemsText.includes('profile')) {
                    listPurpose = "Users List";
                }
            }
            
            // Create list element
            results.elements.push({
                id: `list-${listIndex}`,
                name: listPurpose,
                type: list.type,
                category: listCategory,
                context: `${list.itemCount} item${list.itemCount !== 1 ? 's' : ''}`,
                x: 200,
                y: 400 + (listIndex * 100),
                width: 200,
                height: 80,
                originalTag: list.type.toUpperCase(),
                originalId: list.id,
                originalClass: list.className,
                items: list.items.map(item => item.text)
            });
            
            // Add to page context if it's an important list
            if (listCategory === "navigation" || list.itemCount > 3) {
                results.pageContext.mainSections.push(`${listPurpose}: ${list.itemCount} items`);
            }
            
            listIndex++;
        });
    }
    
    // Add special structural elements with context
    let structureIndex = 0;
    const tagCounts = {};
    
    // Count tag occurrences
    (pageData.elements || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    // Add main structural elements with context
    const keyStructures = [
        { tag: 'NAV', context: 'Navigation Bar', importance: 1 },
        { tag: 'HEADER', context: 'Page Header', importance: 2 },
        { tag: 'MAIN', context: 'Main Content Area', importance: 3 },
        { tag: 'FORM', context: 'Form Container', importance: 4 },
        { tag: 'SECTION', context: 'Content Section', importance: 5 },
        { tag: 'FOOTER', context: 'Page Footer', importance: 6 },
        { tag: 'ASIDE', context: 'Sidebar Content', importance: 7 }
    ];
    
    keyStructures.forEach(structure => {
        if (tagCounts[structure.tag]) {
            results.elements.push({
                id: `structure-${structureIndex}`,
                name: structure.context,
                type: 'container',
                category: 'structural',
                context: structure.context,
                x: 100,
                y: 150 + (structureIndex * 100),
                width: 180,
                height: 60,
                originalTag: structure.tag,
                count: tagCounts[structure.tag],
                importance: structure.importance,
                content: `Contains ${structure.tag === 'NAV' ? 'navigation links' : 
                          structure.tag === 'FORM' ? 'form fields' : 
                          structure.tag === 'HEADER' ? 'page header elements' : 
                          structure.tag === 'FOOTER' ? 'footer links' : 'content'}`
            });
            structureIndex++;
        }
    });
    
    // Identify main sections for the page context
    results.pageContext.mainSections = [];
    
    // Add navigation if present
    if (tagCounts['NAV']) {
        results.pageContext.mainSections.push("Navigation");
    }
    
    // Add forms if present
    const formCount = (pageData.elements || []).filter(tag => tag === 'FORM').length;
    if (formCount > 0) {
        results.pageContext.mainSections.push(`${formCount} Form${formCount > 1 ? 's' : ''}`);
    }
    
    // Add buttons if present
    const buttonCount = (pageData.interactiveElements || []).filter(el => el.tag === 'BUTTON').length;
    if (buttonCount > 0) {
        results.pageContext.mainSections.push(`${buttonCount} Button${buttonCount > 1 ? 's' : ''}`);
    }
    
    // Add links count
    const linkCount = (pageData.interactiveElements || []).filter(el => el.tag === 'A').length;
    if (linkCount > 0) {
        results.pageContext.mainSections.push(`${linkCount} Link${linkCount > 1 ? 's' : ''}`);
    }
    
    // Add tables count
    if (pageData.tables && pageData.tables.length > 0) {
        results.pageContext.mainSections.push(`${pageData.tables.length} Table${pageData.tables.length > 1 ? 's' : ''}`);
    }
    
    // Add lists count
    if (pageData.lists && pageData.lists.length > 0) {
        const navLists = (pageData.lists || []).filter(list => 
            list.context?.toLowerCase() === 'navigation' || 
            list.context?.toLowerCase() === 'menu'
        ).length;
        
        if (navLists > 0) {
            results.pageContext.mainSections.push(`${navLists} Navigation List${navLists > 1 ? 's' : ''}`);
        }
        
        const otherLists = pageData.lists.length - navLists;
        if (otherLists > 0) {
            results.pageContext.mainSections.push(`${otherLists} Content List${otherLists > 1 ? 's' : ''}`);
        }
    }
    
    // Create key interactions list
    results.pageContext.keyInteractions = [];
    
    // Add button groups to key interactions
    Object.entries(buttonGroups).forEach(([type, indices]) => {
        if (indices.length > 0) {
            const sampleTexts = indices.slice(0, 3).map(idx => {
                const element = pageData.interactiveElements[idx];
                return element.text || `Button ${idx + 1}`;
            });
            
            results.pageContext.keyInteractions.push({
                type: 'button_group',
                description: `${type} buttons: ${sampleTexts.join(', ')}${indices.length > 3 ? '...' : ''}`
            });
        }
    });
    
    // Add link groups to key interactions
    Object.entries(linkGroups).forEach(([type, indices]) => {
        if (indices.length > 0) {
            const sampleTexts = indices.slice(0, 3).map(idx => {
                const element = pageData.interactiveElements[idx];
                return element.text || `Link ${idx + 1}`;
            });
            
            results.pageContext.keyInteractions.push({
                type: 'link_group',
                description: `${type}s: ${sampleTexts.join(', ')}${indices.length > 3 ? '...' : ''}`
            });
        }
    });
    
    // Add table interactions if present
    if (pageData.tables && pageData.tables.length > 0) {
        pageData.tables.forEach(table => {
            let tableName = "Data Table";
            
            if (table.caption) {
                tableName = table.caption;
            } else if (table.headers && table.headers.length > 0) {
                tableName = `Table with columns: ${table.headers.slice(0, 3).join(', ')}${table.headers.length > 3 ? '...' : ''}`;
            }
            
            results.pageContext.keyInteractions.push({
                type: 'table',
                description: `${tableName} (${table.rowCount} rows)`
            });
        });
    }
    
    // Generate connections based on context
    // For example, connect NAV container with navigation links
    const navElement = results.elements.find(el => el.originalTag === 'NAV');
    const navLinks = results.elements.filter(el => 
        el.originalTag === 'A' && 
        ['Navigation Link', 'Dashboard Link', 'Profile Link', 'Settings Link'].includes(el.context)
    );
    
    if (navElement && navLinks.length > 0) {
        navLinks.forEach(link => {
            results.connections.push({
                from: results.elements.indexOf(navElement),
                to: results.elements.indexOf(link),
                id: `nav-to-${link.id}`
            });
        });
    }
    
    // Connect form container with form fields
    const formElement = results.elements.find(el => el.originalTag === 'FORM');
    const formFields = results.elements.filter(el => 
        ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.originalTag)
    );
    
    if (formElement && formFields.length > 0) {
        formFields.forEach(field => {
            results.connections.push({
                from: results.elements.indexOf(formElement),
                to: results.elements.indexOf(field),
                id: `form-to-${field.id}`
            });
        });
    }
    
    // Connect lists with their purpose or parent containers
    const listElements = results.elements.filter(el => el.type === 'ul' || el.type === 'ol');
    const navContainer = results.elements.find(el => el.originalTag === 'NAV');
    
    if (navContainer && listElements.length > 0) {
        listElements.forEach(list => {
            if (list.category === 'navigation') {
                results.connections.push({
                    from: results.elements.indexOf(navContainer),
                    to: results.elements.indexOf(list),
                    id: `nav-to-${list.id}`
                });
            }
        });
    }
    
    return results;
}


// Project Dashboard page

router.get("/:id", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/"); // Redirect to login if not logged in
        }
        
        const projectId = req.params.id;
        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).send("Project not found");
        }
        
        // Check if the project belongs to the logged-in user
        if (project.userId.toString() !== req.session.user._id.toString()) {
            return res.status(403).send("Unauthorized access to this project");
        }
        
        // Get tracked pages for THIS SPECIFIC PROJECT
        const trackedPages = await PageData.find({ 
            projectId: projectId,
            userId: req.session.user._id 
        });
        
        // Calculate user initials for the avatar
        const userInitials = req.session.user.name
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase();
        
        // Format date
        const createdAt = new Date(project.createdAt).toLocaleDateString();
        
        res.render("project-Dashboard", {
            projectId: projectId,
            projectName: project.name,
            scriptFileName: project.scriptFileName,
            createdAt: createdAt,
            trackedPages: trackedPages,
            userInitials: userInitials
        });
    } catch (error) {
        console.error("Error retrieving project:", error);
        res.status(500).send("Server error");
    }
});


// New route for viewing a specific tracked page
router.get("/:projectId/page/:pageId", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/"); // Redirect to login if not logged in
        }
        
        const { projectId, pageId } = req.params;
        
        // Find the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).send("Project not found");
        }
        
        // Check if the project belongs to the logged-in user
        if (project.userId.toString() !== req.session.user._id.toString()) {
            return res.status(403).send("Unauthorized access to this project");
        }
        
        // Find the page data
        const pageData = await PageData.findById(pageId);
        if (!pageData) {
            return res.status(404).send("Page data not found");
        }
        
        // Check if the page belongs to the correct project and user
        if (pageData.projectId.toString() !== projectId || 
            pageData.userId.toString() !== req.session.user._id.toString()) {
            return res.status(403).send("Unauthorized access to this page data");
        }
        
        // Read the detailed data from the JSON file
        const dataFilePath = path.join(__dirname, "../data", pageData.filename);
        let detailedPageData = {};
        
        if (fs.existsSync(dataFilePath)) {
            try {
                const fileContent = fs.readFileSync(dataFilePath, "utf8");
                detailedPageData = JSON.parse(fileContent);
            } catch (err) {
                console.error("Error reading page data file:", err);
                detailedPageData = { error: "Could not read page data file" };
            }
        } else {
            detailedPageData = { error: "Page data file not found" };
        }
        
        // Calculate user initials for the avatar
        const userInitials = req.session.user.name
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase();
        
        res.render("page-details", {
            projectId,
            projectName: project.name,
            pageData: pageData,
            detailedData: detailedPageData,
            userInitials,
            lastUpdated: new Date(pageData.updatedAt).toLocaleString()
        });
    } catch (error) {
        console.error("Error retrieving page data:", error);
        res.status(500).send("Server error");
    }
});











module.exports = router;