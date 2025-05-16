const si = require('systeminformation');

exports.getSystemInfo = async (req, res) => {
    try {
        const cpu = await si.cpu();
        const mem = await si.mem();
        const osInfo = await si.osInfo();
        const currentLoad = await si.currentLoad(); // CPU load
        const fsSize = await si.fsSize(); // Filesystem/disk size
        const time = si.time(); // System time, uptime

        res.json({
            success: true,
            data: {
                cpu: {
                    manufacturer: cpu.manufacturer,
                    brand: cpu.brand,
                    speed: cpu.speed, // GHz
                    cores: cpu.cores,
                    physicalCores: cpu.physicalCores,
                    currentLoad: currentLoad.currentLoad.toFixed(2), // %
                },
                memory: {
                    total: mem.total,
                    free: mem.free,
                    used: mem.used,
                    active: mem.active, // More relevant than 'used' sometimes
                    available: mem.available, // More relevant than 'free'
                    swaptotal: mem.swaptotal,
                    swapused: mem.swapused,
                },
                os: {
                    platform: osInfo.platform,
                    distro: osInfo.distro,
                    release: osInfo.release,
                    kernel: osInfo.kernel,
                    arch: osInfo.arch,
                    hostname: osInfo.hostname,
                },
                disks: fsSize.map(d => ({
                    filesystem: d.fs,
                    type: d.type,
                    size: d.size,
                    used: d.used,
                    available: d.available,
                    use: d.use, // % used
                    mount: d.mount,
                })),
                time: {
                    current: time.current, // ISO timestamp
                    uptime: time.uptime, // seconds
                    timezone: time.timezone,
                }
            }
        });
    } catch (error) {
        console.error('Error fetching system info:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve system information.' });
    }
};