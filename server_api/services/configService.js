// server_api/services/configService.js
const dbPool = require('../config/db');

let appConfig = {}; // In-memory cache of the config

// Load all configurations from DB into memory
async function loadConfigFromDB() {
    try {
        const [rows] = await dbPool.query('SELECT config_key, config_value, is_json FROM configurations');
        const newConfig = {};
        rows.forEach(row => {
            if (row.is_json) {
                try {
                    newConfig[row.config_key] = JSON.parse(row.config_value);
                } catch (e) {
                    console.error(`Failed to parse JSON for config key ${row.config_key}:`, e.message);
                    newConfig[row.config_key] = row.config_value; // Fallback to string
                }
            } else {
                newConfig[row.config_key] = row.config_value;
            }
        });
        appConfig = newConfig;
        console.log('Application configuration loaded from database.');
        return appConfig;
    } catch (error) {
        console.error('Failed to load configuration from database:', error);
        // Fallback to environment variables or defaults if DB load fails?
        // For now, we'll just throw or log. Critical settings might need fallbacks.
        throw error;
    }
}

// Get a specific config value (from cache)
function getConfig(key, defaultValue = undefined) {
    return appConfig[key] !== undefined ? appConfig[key] : defaultValue;
}

// Get all configurations (for the settings page)
async function getAllConfigsForDisplay() {
    try {
        // Fetching with description for UI purposes
        const [rows] = await dbPool.query('SELECT id, config_key, config_value, description, is_json, updated_at FROM configurations ORDER BY config_key');
        return rows;
    } catch (error) {
        console.error('Failed to fetch all configurations:', error);
        throw error;
    }
}

// Update a configuration value
async function updateConfig(key, value, isJson = false) {
    try {
        const valueToStore = isJson && typeof value !== 'string' ? JSON.stringify(value) : value;
        // Using INSERT ... ON DUPLICATE KEY UPDATE to handle existing or new keys
        // Assumes config_key is UNIQUE
        const [result] = await dbPool.query(
            'INSERT INTO configurations (config_key, config_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), updated_at = NOW()',
            [key, valueToStore]
        );

        if (result.affectedRows > 0 || result.insertId > 0) {
            // Update in-memory cache
            if (isJson) {
                try {
                    appConfig[key] = JSON.parse(valueToStore);
                } catch (e) {
                    appConfig[key] = valueToStore; // Fallback
                }
            } else {
                appConfig[key] = value;
            }
            console.log(`Configuration updated for key: ${key}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Failed to update configuration for key ${key}:`, error);
        throw error;
    }
}

// Update multiple configurations (batch update)
async function updateMultipleConfigs(configsToUpdate) { // [{key, value, is_json(optional)}]
    const connection = await dbPool.getConnection();
    try {
        await connection.beginTransaction();
        for (const config of configsToUpdate) {
            const valueToStore = config.is_json && typeof config.value !== 'string' ? JSON.stringify(config.value) : config.value;
            await connection.query(
                'INSERT INTO configurations (config_key, config_value, is_json, description) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), is_json = VALUES(is_json), description = VALUES(description), updated_at = NOW()',
                [config.key, valueToStore, config.is_json || false, config.description || null]
            );
        }
        await connection.commit();
        await loadConfigFromDB(); // Reload all configs into cache
        console.log('Multiple configurations updated successfully.');
        return true;
    } catch (error) {
        await connection.rollback();
        console.error('Failed to update multiple configurations:', error);
        throw error;
    } finally {
        connection.release();
    }
}


module.exports = {
    loadConfigFromDB,
    getConfig,
    getAllConfigsForDisplay,
    updateConfig,
    updateMultipleConfigs
};