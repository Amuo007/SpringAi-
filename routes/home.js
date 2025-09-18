const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('welcome')
});
router.get('/Contact', (req, res) => {
    res.render('contactPage')
});



module.exports = router;



 