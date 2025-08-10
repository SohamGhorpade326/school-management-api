const express = require('express');
const router = express.Router();
const { addSchool, listSchools } = require('../controllers/schoolController');

// Route to add a new school
router.post('/addSchool', addSchool);

// Route to list schools by proximity
router.get('/listSchools', listSchools);

module.exports = router;