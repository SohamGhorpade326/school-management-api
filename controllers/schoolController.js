const db = require('../db'); // We will create db.js next

/**
 * Haversine formula to calculate distance between two lat/lng points.
 * @param {number} lat1 User's latitude
 * @param {number} lon1 User's longitude
 * @param {number} lat2 School's latitude
 * @param {number} lon2 School's longitude
 * @returns {number} Distance in kilometers
 */
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
}

// @desc    Add a new school
// @route   POST /api/addSchool
exports.addSchool = async (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Basic validation
    if (!name || !address || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ message: 'All fields are required: name, address, latitude, longitude.' });
    }
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ message: 'Latitude and longitude must be numbers.' });
    }

    try {
        const [result] = await db.promise().query(
            'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
            [name, address, latitude, longitude]
        );
        res.status(201).json({ id: result.insertId, name, address, latitude, longitude });
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ message: 'Failed to add school.' });
    }
};

// @desc    List schools sorted by proximity
// @route   GET /api/listSchools
exports.listSchools = async (req, res) => {
    const { lat, lon } = req.query;

    // Basic validation
    if (!lat || !lon) {
        return res.status(400).json({ message: 'User latitude (lat) and longitude (lon) are required as query parameters.' });
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    if (isNaN(userLat) || isNaN(userLon)) {
        return res.status(400).json({ message: 'Invalid latitude or longitude.' });
    }

    try {
        const [schools] = await db.promise().query('SELECT * FROM schools');

        // Calculate distance for each school
        const schoolsWithDistance = schools.map(school => ({
            ...school,
            distance: getDistance(userLat, userLon, school.latitude, school.longitude)
        }));

        // Sort schools by distance (ascending)
        schoolsWithDistance.sort((a, b) => a.distance - b.distance);

        res.status(200).json(schoolsWithDistance);
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ message: 'Failed to retrieve schools.' });
    }
};