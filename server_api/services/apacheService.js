const {
    isWindows,
    executeCommand,
    getApacheServiceLinux, // Use this
    getApacheServiceWindows, // Use this
    getLogPath
} = require('./osCommandService');

async function getApacheStatus() {
    const serviceName = isWindows ? getApacheServiceWindows() : getApacheServiceLinux();
    const command = isWindows ? `sc query "${serviceName}"` : `sudo systemctl is-active ${serviceName}`;
    try {
        const output = await executeCommand(command);
        if (isWindows) {
            return output.includes("RUNNING") ? "Running" : "Stopped";
        } else {
            return output.trim() === "active" ? "Running" : "Stopped/Inactive";
        }
    } catch (error) {
        console.error(`Error getting Apache status: ${error.message}`);
        // If systemctl is-active returns non-zero, it's inactive or error
        if (!isWindows && error.message.includes('exit code')) return "Stopped/Error";
        return "Error fetching status";
    }
}

async function controlApache(action) { // action: 'start', 'stop', 'restart'
    const serviceName = isWindows ? APACHE_SERVICE_WINDOWS : APACHE_SERVICE_LINUX;
    let command;
    if (isWindows) {
        command = `net ${action} "${serviceName}"`; // Ensure service name is quoted if it contains spaces
        if (action === 'restart') { // Windows net command doesn't have restart directly for services like Apache
             await executeCommand(`net stop "${serviceName}"`);
             await new Promise(resolve => setTimeout(resolve, 2000)); // Wait a bit
             command = `net start "${serviceName}"`;
        }
    } else {
        command = `sudo systemctl ${action} ${serviceName}`;
    }
    try {
        const output = await executeCommand(command);
        return `Apache ${action} command executed. Output: ${output || 'No output'}`;
    } catch (error) {
        throw new Error(`Failed to ${action} Apache: ${error.message}`);
    }
}

async function getApacheLog(logType, lines = 50) { // logType: 'error' or 'access'
    const logPath = getLogPath('apache', logType);
    if (!logPath) throw new Error(`Log path for apache_${logType} not configured.`);

    // IMPORTANT: Ensure logPath is from a whitelist and not user-supplied directly here
    const command = isWindows
        ? `powershell -Command "Get-Content -Path '${logPath}' -Tail ${lines} | Out-String"`
        : `sudo tail -n ${lines} "${logPath}"`; // Quote path
    try {
        const output = await executeCommand(command);
        return output;
    } catch (error) {
        // Log file might not exist or be readable
        if (error.message.toLowerCase().includes('cannot find path') || error.message.toLowerCase().includes('no such file')) {
            return `Log file not found or not accessible: ${logPath}`;
        }
        throw new Error(`Failed to read Apache ${logType} log: ${error.message}`);
    }
}

module.exports = {
    getApacheStatus,
    startApache: () => controlApache('start'),
    stopApache: () => controlApache('stop'),
    restartApache: () => controlApache('restart'),
    getApacheErrorLog: (lines) => getApacheLog('error', lines),
    getApacheAccessLog: (lines) => getApacheLog('access', lines),
};