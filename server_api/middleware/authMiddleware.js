const jwt = require('jsonwebtoken');

// In-memory user store for simplicity. Replace with a database in production.
const users = [
    { id: 1, username: 'admin', passwordHash: '$2a$10$mEZRtyk4AG2.1I5wMX4inOwvPWvqs5oaEHGNX9l9lf.YMH1sJjaC2' }
    // You'd pre-hash 'admin' password with bcrypt and store it
];
// To generate a hash for 'admin':
// const bcrypt = require('bcryptjs');
// const salt = bcrypt.genSaltSync(10);
// const adminPasswordHash = bcrypt.hashSync('admin', salt);
// console.log('Admin hash:', adminPasswordHash); // Store this hash

module.exports = function (req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Check for Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Token is not valid (must be Bearer token)' });
    }
    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Add user from payload
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};