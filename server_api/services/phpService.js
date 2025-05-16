const { executeCommand } = require('./osCommandService');

async function getPhpVersion() {
    try {
        const output = await executeCommand('php -v');
        return output.split('\n')[0]; // Get the first line
    } catch (error) {
        console.error(`Error getting PHP version: ${error.message}`);
        return "Error fetching PHP version";
    }
}

async function getPhpExtensions() {
    try {
        const output = await executeCommand('php -m');
        return output.split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('[') && !s.startsWith(' '));
    } catch (error) {
        console.error(`Error getting PHP extensions: ${error.message}`);
        return ["Error fetching extensions"];
    }
}

async function getPhpIniPath() {
    try {
        const output = await executeCommand('php --ini');
        const match = output.match(/Loaded Configuration File:\s*([^\s]+)/);
        return match ? match[1] : "php.ini path not found";
    } catch (error) {
        console.error(`Error getting php.ini path: ${error.message}`);
        return "Error fetching php.ini path";
    }
}
// ... (add PHP-FPM management if needed, similar to Apache/MySQL service control)

module.exports = {
    getPhpVersion,
    getPhpExtensions,
    getPhpIniPath,
};