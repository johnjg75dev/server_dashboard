const configService = require('../services/configService');

exports.getAllSettings = async (req, res) => {
    try {
        const settings = await configService.getAllConfigsForDisplay();
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve settings.' });
    }
};

exports.updateSettings = async (req, res) => {
    // Expects an array of settings objects: [{ key, value, description, is_json }]
    const { settings } = req.body;
    if (!Array.isArray(settings) || settings.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid settings format. Expected an array.' });
    }

    try {
        // Basic validation for each setting object
        for (const setting of settings) {
            if (!setting.key || setting.value === undefined) { // value can be empty string or null
                return res.status(400).json({ success: false, message: `Invalid setting object. Missing key or value for: ${JSON.stringify(setting)}` });
            }
        }

        await configService.updateMultipleConfigs(settings.map(s => ({
            key: s.config_key, // From DB when fetching, map to 'key' for update service
            value: s.config_value,
            is_json: s.is_json || false,
            description: s.description || null
        })));
        res.json({ success: true, message: 'Settings updated successfully. Changes will apply on next relevant operation or app restart for some settings.' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Failed to update settings: ${error.message}` });
    }
};