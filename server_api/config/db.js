// server_api/config/db.js
const mysql = require('mysql2/promise'); // Using promise-based version

// Load from .env
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'PassworD!',
    database: process.env.DB_NAME || 'server_admin_dashboard_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection (optional, but good for startup)
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the MySQL database.');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to MySQL database:', err.message);
        // You might want to exit the process if DB connection is critical
        // process.exit(1);
    });

module.exports = pool;