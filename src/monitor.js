const http = require('http');
const https = require('https');
const { URL } = require('url');
const { checkSSL } = require('./ssl-checker');

class Monitor {
    constructor(config, onResult) {
        this.targets = config.targets || [];
        this.intervalMs = config.checkIntervalMs || 30000;
        this.onResult = onResult;
        this._timers = [];
        this._previousStatus = new Map(); // targetId -> isUp
    }

    /**
     * Start monitoring all targets
     */
    start(targetDbEntries) {
        console.log(`[Monitor] Starting checks for ${targetDbEntries.length} targets every ${this.intervalMs / 1000}s`);

        // Run initial check immediately
        targetDbEntries.forEach(entry => {
            const configTarget = this.targets.find(t => t.url === entry.url);
            if (configTarget) {
                this._checkTarget(entry, configTarget);
            }
        });

        // Schedule periodic checks
        const timer = setInterval(() => {
            targetDbEntries.forEach(entry => {
                const configTarget = this.targets.find(t => t.url === entry.url);
                if (configTarget) {
                    this._checkTarget(entry, configTarget);
                }
            });
        }, this.intervalMs);

        this._timers.push(timer);
    }

    /**
     * Stop all monitoring
     */
    stop() {
        this._timers.forEach(t => clearInterval(t));
        this._timers = [];
    }

    /**
     * Check a single target
     */
    async _checkTarget(dbEntry, configTarget) {
        const startTime = Date.now();
        let statusCode = null;
        let isUp = false;
        let error = null;
        let sslInfo = null;

        try {
            const result = await this._httpRequest(
                configTarget.url,
                configTarget.method || 'GET',
                configTarget.headers || {},
                configTarget.timeoutMs || 10000
            );

            statusCode = result.statusCode;
            const responseTime = Date.now() - startTime;

            // Check expected status code
            const expectedStatus = configTarget.expectedStatus || 200;
            if (statusCode !== expectedStatus) {
                isUp = false;
                error = `Expected status ${expectedStatus}, got ${statusCode}`;
            } else if (configTarget.expectBodyContains && !result.body.includes(configTarget.expectBodyContains)) {
                isUp = false;
                error = `Response body missing expected content`;
            } else {
                isUp = true;
            }

            // Check SSL
            sslInfo = await checkSSL(configTarget.url);

            const checkResult = {
                targetId: dbEntry.id,
                target: { ...dbEntry, ...configTarget },
                statusCode,
                responseTimeMs: responseTime,
                isUp,
                error,
                sslDaysRemaining: sslInfo?.daysRemaining ?? null,
                sslInfo,
                previousStatus: this._previousStatus.get(dbEntry.id)
            };

            // Track status changes for alerting
            const wasUp = this._previousStatus.get(dbEntry.id);
            this._previousStatus.set(dbEntry.id, isUp);
            checkResult.statusChanged = wasUp !== undefined && wasUp !== isUp;

            this.onResult(checkResult);
        } catch (err) {
            const responseTime = Date.now() - startTime;
            const checkResult = {
                targetId: dbEntry.id,
                target: { ...dbEntry, ...configTarget },
                statusCode: null,
                responseTimeMs: responseTime,
                isUp: false,
                error: err.message || 'Connection failed',
                sslDaysRemaining: null,
                sslInfo: null,
                previousStatus: this._previousStatus.get(dbEntry.id)
            };

            const wasUp = this._previousStatus.get(dbEntry.id);
            this._previousStatus.set(dbEntry.id, false);
            checkResult.statusChanged = wasUp !== undefined && wasUp !== false;

            this.onResult(checkResult);
        }
    }

    /**
     * Perform HTTP request
     */
    _httpRequest(urlString, method, headers, timeoutMs) {
        return new Promise((resolve, reject) => {
            const parsed = new URL(urlString);
            const client = parsed.protocol === 'https:' ? https : http;

            const options = {
                method,
                headers: { 'User-Agent': 'NetPulse/1.0', ...headers },
                timeout: timeoutMs
            };

            const req = client.request(parsed, options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => resolve({ statusCode: res.statusCode, body }));
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error(`Timeout after ${timeoutMs}ms`));
            });

            req.end();
        });
    }
}

module.exports = Monitor;
