const fs = require('fs');
const path = require('path');
const database = require('./database');
const createServer = require('./server');
const Monitor = require('./monitor');
const Alerter = require('./alerter');

// ─── Load Configuration ──────────────────────────────────

const configPath = path.join(__dirname, '..', 'config.json');
const exampleConfigPath = path.join(__dirname, '..', 'config.example.json');

let config;
if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log('[NetPulse] Loaded config.json');
} else if (fs.existsSync(exampleConfigPath)) {
    // Copy example config for first run
    fs.copyFileSync(exampleConfigPath, configPath);
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log('[NetPulse] Created config.json from config.example.json');
} else {
    console.error('[NetPulse] No config.json or config.example.json found!');
    process.exit(1);
}

// ─── Initialize ──────────────────────────────────────────

async function main() {
    // Init database
    await database.init();
    console.log('[NetPulse] Database initialized');

    // Sync targets from config to DB
    const targetDbEntries = config.targets.map(target => {
        const id = database.upsertTarget(target);
        return { id, ...target };
    });
    console.log(`[NetPulse] ${targetDbEntries.length} targets synced`);

    // Init alerter
    const alerter = new Alerter(config.alerts);

    // Create server
    const { listen, broadcastCheckResult } = createServer(config);

    // Init monitor with result handler
    const monitor = new Monitor(config, async (result) => {
        // Store in database
        database.insertCheck({
            targetId: result.targetId,
            statusCode: result.statusCode,
            responseTimeMs: result.responseTimeMs,
            isUp: result.isUp,
            error: result.error,
            sslDaysRemaining: result.sslDaysRemaining
        });

        // Broadcast to dashboard
        broadcastCheckResult(result);

        // Send alerts on status change
        if (result.statusChanged) {
            await alerter.alert(result.target, result, result.previousStatus);
        }

        const statusIcon = result.isUp ? '✅' : '❌';
        console.log(
            `${statusIcon} ${result.target.name} | ${result.statusCode || 'ERR'} | ${result.responseTimeMs}ms${result.sslDaysRemaining !== null ? ` | SSL: ${result.sslDaysRemaining}d` : ''}`
        );
    });

    // Start server
    const port = config.port || 3000;
    await listen(port);

    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║          ⚡ NetPulse is running ⚡            ║');
    console.log(`║   Dashboard: http://localhost:${port}             ║`);
    console.log(`║   API:       http://localhost:${port}/api          ║`);
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');

    // Start monitoring
    monitor.start(targetDbEntries);

    // Cleanup old data daily
    setInterval(() => {
        const deleted = database.cleanupOldData(config.dataRetentionDays || 30);
        if (deleted > 0) console.log(`[NetPulse] Cleaned up ${deleted} old records`);
    }, 24 * 60 * 60 * 1000);

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n[NetPulse] Shutting down...');
        monitor.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n[NetPulse] Shutting down...');
        monitor.stop();
        process.exit(0);
    });
}

main().catch(err => {
    console.error('[NetPulse] Fatal error:', err);
    process.exit(1);
});
