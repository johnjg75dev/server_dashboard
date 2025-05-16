require('dotenv').config();

const configService = require('./server_api/services/configService');
const express = require('express');
const cors = require('cors');
const path = require('path');

// API Routers
const configRoutes = require('./server_api/routes/configRoutes');
const authRoutes = require('./server_api/routes/authRoutes');
const systemRoutes = require('./server_api/routes/systemRoutes');
const apacheRoutes = require('./server_api/routes/apacheRoutes');
//const mysqlRoutes = require('./server_api/routes/mysqlRoutes');
//const phpRoutes = require('./server_api/routes/phpRoutes');
//const libvirtRoutes = require('./server_api/routes/libvirtRoutes');

const app = express();

// Middleware
app.use(cors({ // Configure CORS properly
    origin: process.env.NODE_ENV === 'production' ? 'http://127.0.0.1/production/' : 'http://localhost:3000', // Allow React dev server
    credentials: true // If you use cookies/sessions
}));
app.use(express.json());

async function startServer() {
    try {
        await configService.loadConfigFromDB(); // Load config first

        const app = express();

        app.use(cors({ // Configure CORS properly
            origin: process.env.NODE_ENV === 'production' ? 'YOUR_PRODUCTION_DOMAIN' : 'http://localhost:3000', // Allow React dev server
            credentials: true // If you use cookies/sessions
        }));
        app.use(express.json());

        // API Routes
        app.get('/api/health', (req, res) => res.json({ message: 'Server Admin Backend API Running' }));
        app.use('/api/auth', authRoutes);
        app.use('/api/system', systemRoutes);
        app.use('/api/apache', apacheRoutes);
        //app.use('/api/mysql', mysqlRoutes);
        //app.use('/api/php', phpRoutes);
        //app.use('/api/libvirt', libvirtRoutes);
        app.use('/api/settings', configRoutes);

        // Serve React App
        // Serve React App in Production
        const clientBuildPath = path.join(__dirname, 'client/build');
        app.use(express.static(clientBuildPath));

        app.get('*', (req, res) => {
            // Check if the request is for an API route before sending index.html
            if (!req.originalUrl.startsWith('/api')) {
                res.sendFile(path.join(clientBuildPath, 'index.html'));
            } else {
                // If it's an API route not handled, send 404
                res.status(404).json({ message: 'API route not found' });
            }
        });

        const PORT = process.env.PORT || 5001;
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            if (process.env.NODE_ENV === 'production') {
                console.log(`Serving frontend from: ${clientBuildPath}`);
            } else {
                console.log(`React Dev Server expected on http://localhost:3000`);
            }
        });

            // Optional: Initial Libvirt connection
            // Avoid running this during test environments or if libvirt is not always expected
            /*if (process.env.NODE_ENV !== 'test' && process.env.LIBVIRT_URI) {
                const { connectLibvirt } = require('./server_api/services/libvirtService');
                connectLibvirt().catch(err => console.warn("Initial Libvirt connection attempt failed:", err.message));
            }*/

    }
    catch (error) {
        console.error("Failed to start the server:", error);
        process.exit(1); // Exit if critical setup (like config loading) fails
    }
}

startServer();