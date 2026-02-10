const http = require('http');
const https = require('https');
const { URL } = require('url');

/**
 * Send webhook alert for target status changes
 */
class Alerter {
    constructor(config) {
        this.enabled = config?.enabled || false;
        this.webhooks = config?.webhooks || [];
        this.cooldownMinutes = config?.cooldownMinutes || 5;
        this._lastAlerts = new Map(); // targetId -> timestamp
    }

    /**
     * Check if we should send an alert (cooldown check)
     */
    _shouldAlert(targetId) {
        const lastAlert = this._lastAlerts.get(targetId);
        if (!lastAlert) return true;
        const elapsed = (Date.now() - lastAlert) / 1000 / 60;
        return elapsed >= this.cooldownMinutes;
    }

    /**
     * Send alert for a target status change
     */
    async alert(target, check, previousStatus) {
        if (!this.enabled || this.webhooks.length === 0) return;
        if (!this._shouldAlert(target.id)) return;

        const isDown = !check.isUp;
        const statusEmoji = isDown ? '🔴' : '🟢';
        const statusText = isDown ? 'DOWN' : 'UP';
        const title = `${statusEmoji} ${target.name} is ${statusText}`;
        const message = isDown
            ? `**${target.name}** (${target.url}) is DOWN!\nError: ${check.error || `HTTP ${check.statusCode}`}\nTime: ${new Date().toISOString()}`
            : `**${target.name}** (${target.url}) is back UP!\nResponse Time: ${check.responseTimeMs}ms\nTime: ${new Date().toISOString()}`;

        this._lastAlerts.set(target.id, Date.now());

        const promises = this.webhooks.map(webhook => this._sendWebhook(webhook, title, message));
        await Promise.allSettled(promises);
    }

    /**
     * Send to a specific webhook
     */
    async _sendWebhook(webhook, title, message) {
        try {
            let body;

            switch (webhook.type) {
                case 'discord':
                    body = JSON.stringify({
                        embeds: [{
                            title,
                            description: message,
                            color: title.includes('DOWN') ? 0xFF0000 : 0x00FF00,
                            timestamp: new Date().toISOString()
                        }]
                    });
                    break;

                case 'slack':
                    body = JSON.stringify({
                        text: title,
                        blocks: [
                            { type: 'header', text: { type: 'plain_text', text: title } },
                            { type: 'section', text: { type: 'mrkdwn', text: message.replace(/\*\*/g, '*') } }
                        ]
                    });
                    break;

                default:
                    body = JSON.stringify({ title, message, timestamp: new Date().toISOString() });
            }

            await this._httpPost(webhook.url, body);
        } catch (err) {
            console.error(`[Alerter] Failed to send ${webhook.type} webhook:`, err.message);
        }
    }

    /**
     * Simple HTTP POST
     */
    _httpPost(urlString, body) {
        return new Promise((resolve, reject) => {
            const parsed = new URL(urlString);
            const client = parsed.protocol === 'https:' ? https : http;

            const req = client.request(parsed, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });

            req.on('error', reject);
            req.setTimeout(5000, () => { req.destroy(); reject(new Error('Webhook timeout')); });
            req.write(body);
            req.end();
        });
    }
}

module.exports = Alerter;
