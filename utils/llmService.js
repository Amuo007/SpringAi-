require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const API_KEY = process.env.ANTHROPIC_API_KEY; // API key from .env
const PageData = require('../models/PageData'); // Import MongoDB model

async function generateLLMScript(pageData) {
    try {
        // Fetch actual page content
        const filePath = path.join(__dirname, '../data', pageData.filename);
        if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Fetch reference template
        const templatePath = path.join(__dirname, '../public', 'example_onboarding_script.js');
        if (!fs.existsSync(templatePath)) throw new Error(`Template file not found: ${templatePath}`);
        const templateContent = fs.readFileSync(templatePath, 'utf-8');

        // Construct optimized AI prompt
        const prompt = `
You are a specialized JavaScript developer creating interactive onboarding tours. I need you to generate a complete, production-ready onboarding tour script based on the webpage content I provide.

The generated script should:
1. Follow the exact structure and patterns from the example below
2. Create appropriate tour steps based on the elements in the provided webpage content
3. Include proper cursor animations, tooltips, and highlight effects
4. Be immediately deployable without modifications
5. Return ONLY valid JavaScript code with no explanations or additional text

REFERENCE TEMPLATE (study this carefully):
\`\`\`js
${templateContent}
\`\`\`

WEBPAGE CONTENT (create an onboarding script for this):
\`\`\`
${fileContent}
\`\`\`

Output only valid, complete JavaScript code that follows the same pattern as the reference template but customized for my page content. Do not include any explanations, markdown formatting, or non-code text.`;

        // Call LLM API with improved parameters
        const response = await axios.post(
            ANTHROPIC_API_URL,
            {
                model: "claude-3-7-sonnet-20250219",
                max_tokens: 8000,
                temperature: 0.4, // Lower temperature for more consistent output
                system: "You are a specialized JavaScript developer who generates production-ready onboarding tour scripts. You return ONLY complete, valid JavaScript code with no explanations.",
                messages: [
                    { role: "user", content: prompt }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": API_KEY,
                    "anthropic-version": "2023-06-01"
                }
            }
        );

        // Extract and process script content
        let scriptContent;
        if (Array.isArray(response.data.content)) {
            scriptContent = response.data.content.map(item => item.text).join("\n");
        } else {
            scriptContent = response.data.content;
        }

        // Clean up any potential markdown code block markers
        scriptContent = scriptContent.replace(/```javascript|```js|```/g, '').trim();

        // Save script to file
        const scriptDir = path.join(__dirname, '../data/onboarding-scripts/');
        if (!fs.existsSync(scriptDir)) fs.mkdirSync(scriptDir, { recursive: true });

        const scriptFileName = `onboarding_script_${pageData._id}_${Date.now()}.js`;
        const scriptFilePath = path.join(scriptDir, scriptFileName);
        
        fs.writeFileSync(scriptFilePath, scriptContent);

        // Update MongoDB to link script to the page
        await PageData.findByIdAndUpdate(pageData._id, { 
            llmScriptFileName: scriptFileName,
            llmScriptGeneratedAt: new Date()
        });

        console.log(`Successfully generated onboarding script: ${scriptFileName}`);
        return scriptFileName; // Return stored filename
    } catch (error) {
        console.error("Error generating LLM script:", error.response ? error.response.data : error.message);
        throw error; // Rethrow to allow proper error handling upstream
    }
}

module.exports = { generateLLMScript };