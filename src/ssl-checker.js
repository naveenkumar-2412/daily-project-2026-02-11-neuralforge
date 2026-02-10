const tls = require('tls');
const { URL } = require('url');

/**
 * Check SSL certificate for a given HTTPS URL
 * Returns days until expiry and certificate details
 */
function checkSSL(urlString) {
    return new Promise((resolve) => {
        try {
            const parsed = new URL(urlString);

            if (parsed.protocol !== 'https:') {
                return resolve(null);
            }

            const port = parsed.port || 443;
            const host = parsed.hostname;

            const socket = tls.connect(
                { host, port: parseInt(port), servername: host, rejectUnauthorized: false },
                () => {
                    try {
                        const cert = socket.getPeerCertificate();
                        if (!cert || !cert.valid_to) {
                            socket.destroy();
                            return resolve(null);
                        }

                        const expiryDate = new Date(cert.valid_to);
                        const now = new Date();
                        const daysRemaining = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));

                        socket.destroy();
                        resolve({
                            daysRemaining,
                            validFrom: cert.valid_from,
                            validTo: cert.valid_to,
                            issuer: cert.issuer?.O || 'Unknown',
                            subject: cert.subject?.CN || host
                        });
                    } catch {
                        socket.destroy();
                        resolve(null);
                    }
                }
            );

            socket.setTimeout(5000);
            socket.on('timeout', () => { socket.destroy(); resolve(null); });
            socket.on('error', () => { resolve(null); });
        } catch {
            resolve(null);
        }
    });
}

module.exports = { checkSSL };
