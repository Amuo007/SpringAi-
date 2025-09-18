require('dotenv').config();
const msal = require('@azure/msal-node');

const msalConfig = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
        clientSecret: process.env.AZURE_CLIENT_SECRET
    },
    system: {
        loggerOptions: { logLevel: "info" }
    }
};

const pca = new msal.ConfidentialClientApplication(msalConfig);
module.exports = pca;

