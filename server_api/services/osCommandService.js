const { exec } = require('child_process');
const os = require('os');
const util = require('util');
const { getConfig } = require('./configService'); 
const execPromise = util.promisify(exec);

const isWindows = os.platform() === 'win32';

/**
 * Executes a shell command and returns its output.
 * @param {string} command The command to execute.
 * @param {object} options Options for child_process.exec.
 * @returns {Promise<string>} The stdout of the command.
 * @throws {Error} If the command fails or produces stderr.
 */
async function executeCommand(command, options = {}) {
    console.log(`Executing command: ${command}`);
    try {
        const { stdout, stderr } = await execPromise(command, options);
        if (stderr && !command.startsWith('sc query')) { // sc query often puts info in stderr
            // Heuristic: if stderr contains common success keywords for status, treat as stdout
            // This part needs careful handling as stderr can be used for non-error output by some tools
            if (/running|active \(running\)|listening/i.test(stderr.toLowerCase())) {
                console.warn(`Command "${command}" produced info on stderr, treating as output: ${stderr.substring(0,100)}...`);
                return (stdout || stderr).trim();
            }
            // If it's not clearly informational, and there's no stdout, it's likely an error
            if (!stdout) {
                console.error(`Command "${command}" failed with stderr: ${stderr}`);
                throw new Error(`Command failed: ${stderr.trim()}`);
            }
            // If there's stdout, stderr might just be warnings
            console.warn(`Command "${command}" produced stderr (but also stdout): ${stderr.substring(0,100)}...`);
        }
        return (stdout || (command.startsWith('sc query') ? stderr : '')).trim();
    } catch (error) {
        // error object from execPromise often has stdout and stderr properties
        const errorMessage = error.stderr || error.stdout || error.message || 'Unknown execution error';
        console.error(`Error executing command "${command}": ${errorMessage}`);
        throw new Error(`Failed to execute: ${command}. Output: ${errorMessage.trim()}`);
    }
}

// --- Service Name and Path Configuration ---
// These might need to be configurable via .env or a config file eventually
//const APACHE_SERVICE_LINUX = process.env.APACHE_SERVICE_LINUX || 'apache2'; // e.g., httpd for CentOS/RHEL
//const APACHE_SERVICE_WINDOWS = process.env.APACHE_SERVICE_WINDOWS || 'Apache2.4'; // Check your Apache service name on Windows
//const MYSQL_SERVICE_LINUX = process.env.MYSQL_SERVICE_LINUX || 'mysql'; // e.g., mysqld
//const MYSQL_SERVICE_WINDOWS = process.env.MYSQL_SERVICE_WINDOWS || 'MySQL80'; // Check your MySQL service name
function getApacheServiceLinux() { return getConfig('APACHE_SERVICE_LINUX', 'apache2'); }
function getApacheServiceWindows() { return getConfig('APACHE_SERVICE_WINDOWS', 'Apache2.4'); }
function getMySQLServiceLinux() { return getConfig('MYSQL_SERVICE_LINUX', 'mysql'); }
function getMySQLServiceWindows() { return getConfig('MYSQL_SERVICE_WINDOWS', 'MySQL80'); }

const getLogPath = (service, type) => {
    const platformKey = isWindows ? 'WINDOWS' : 'LINUX';
    const key = `LOG_PATH_${service.toUpperCase()}_${type.toUpperCase()}_${platformKey}`;
    const path = getConfig(key); // e.g., getConfig('LOG_PATH_APACHE_ERROR_LINUX')
    if (!path) console.warn(`Log path for ${key} not found in DB config.`);
    return path;
};

module.exports = {
    isWindows,
    executeCommand,
    getApacheServiceLinux, // Export functions that use getConfig
    getApacheServiceWindows,
    getMySQLServiceLinux,
    getMySQLServiceWindows,
    getLogPath
};