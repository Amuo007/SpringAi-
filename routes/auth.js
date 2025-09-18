const express = require('express');
const router = express.Router();
const pca = require('../config/msalConfig');
const fetch = require('node-fetch');
const User = require('../models/User');

router.get('/login', (req, res) => {
    const authUrl = pca.getAuthCodeUrl({
        scopes: ["user.read"],
        redirectUri: process.env.AZURE_CALLBACK_URL,
        prompt: "select_account"  // This forces the account selection
    });

    authUrl.then(url => res.redirect(url)).catch(err => res.send(err));
});

router.get('/callback', async (req, res) => {
    try {
        const tokenResponse = await pca.acquireTokenByCode({
            scopes: ["User.Read"],
            redirectUri: process.env.AZURE_CALLBACK_URL,
            code: req.query.code
        });

        console.log('Token Response:', tokenResponse);

        if (!tokenResponse.accessToken) {
            throw new Error('Access Token is missing.');
        }

        req.session.token = tokenResponse.accessToken; // Store correct token

        // Fetch user details using the valid token
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${req.session.token}` }
        });

        const userData = await response.json();
        console.log('Raw Microsoft User Data:', userData);

        if (!userData.id) {
            throw new Error('Microsoft User ID is missing');
        }

        let user = await User.findOne({ microsoftId: userData.id });
 
        if (!user) {
            user = new User({
                microsoftId: userData.id,
                name: userData.displayName || 'Unknown',
                email: userData.mail || userData.userPrincipalName || 'No Email'
            });

            console.log('Saving User to MongoDB:', user);
            await user.save();
        }

        req.session.user = user;
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error retrieving user info');
    }
});
// Add this route to your existing auth.js file
router.get('/logout', (req, res) => {
    // Clear the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
        
        // Redirect to home page after logout
        res.redirect('/');
    });
});



module.exports = router;
