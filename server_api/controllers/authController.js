const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory user store. IMPORTANT: HASH PASSWORDS.
// Generate the hash once and store it. E.g., bcrypt.hashSync('admin', 10)
const users = [
    {
        id: 1,
        username: 'admin',
        // Replace with the actual hash generated for 'admin' password
        passwordHash: '$2a$10$mEZRtyk4AG2.1I5wMX4inOwvPWvqs5oaEHGNX9l9lf.YMH1sJjaC2'
    }
];

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user (in a real app, query your database)
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials (user)' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials (password)' });
        }

        // User matched, create JWT Payload
        const payload = {
            user: {
                id: user.id,
                username: user.username
                // Add roles or other relevant info if needed
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' }, // Token expiration
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, username: user.username } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during login');
    }
};

// Optional: Get current logged-in user (useful for frontend to verify session)
exports.getMe = async (req, res) => {
    try {
        // req.user is set by authMiddleware
        // In a real app, you might fetch fresh user data from DB
        const user = users.find(u => u.id === req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ id: user.id, username: user.username });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};