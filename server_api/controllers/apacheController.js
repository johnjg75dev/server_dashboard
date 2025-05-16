const apacheService = require('../services/apacheService');

exports.getStatus = async (req, res) => {
    try {
        const status = await apacheService.getApacheStatus();
        res.json({ success: true, status });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.start = async (req, res) => {
    try {
        const message = await apacheService.startApache();
        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.stop = async (req, res) => {
    try {
        const message = await apacheService.stopApache();
        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.restart = async (req, res) => {
    try {
        const message = await apacheService.restartApache();
        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getErrorLog = async (req, res) => {
    try {
        const lines = parseInt(req.query.lines) || 50;
        const logData = await apacheService.getApacheErrorLog(lines);
        res.json({ success: true, logData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAccessLog = async (req, res) => {
    try {
        const lines = parseInt(req.query.lines) || 50;
        const logData = await apacheService.getApacheAccessLog(lines);
        res.json({ success: true, logData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};