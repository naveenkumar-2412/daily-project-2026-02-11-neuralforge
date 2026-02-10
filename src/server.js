const express = require('express');
const http = require('http');
const { Server: SocketIO } = require('socket.io');
const path = require('path');
const database = require('./database');

function createServer(config) {
    const app = express();
    const server = http.createServer(app);
    const io = new SocketIO(server, { cors: { origin: '*' } });

    // Serve static frontend
    app.use(express.static(path.join(__dirname, '..', 'public')));
    app.use(express.json());

    // ─── REST API ──────────────────────────────────────────

    // GET /api/summary - Overall monitoring summary
    app.get('/api/summary', (req, res) => {
        try {
            const summary = database.getSummary();
            res.json(summary);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // GET /api/targets - All targets with latest status
    app.get('/api/targets', (req, res) => {
        try {
            const targets = database.getTargets();
            res.json(targets);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // GET /api/targets/:id/history - Historical checks for a target
    app.get('/api/targets/:id/history', (req, res) => {
        try {
            const hours = parseInt(req.query.hours) || 24;
            const history = database.getTargetHistory(parseInt(req.params.id), hours);
            res.json(history);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Health check
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', uptime: process.uptime() });
    });

    // ─── WebSocket ─────────────────────────────────────────

    io.on('connection', (socket) => {
        // Send initial data on connect
        try {
            const targets = database.getTargets();
            const summary = database.getSummary();
            socket.emit('init', { targets, summary });
        } catch (err) {
            console.error('[WS] Error sending initial data:', err.message);
        }

        socket.on('requestHistory', ({ targetId, hours }) => {
            try {
                const history = database.getTargetHistory(targetId, hours || 24);
                socket.emit('history', { targetId, data: history });
            } catch (err) {
                socket.emit('error', { message: err.message });
            }
        });
    });

    /**
     * Broadcast a check result to all connected clients
     */
    function broadcastCheckResult(result) {
        const targets = database.getTargets();
        const summary = database.getSummary();
        io.emit('checkResult', { result, targets, summary });
    }

    /**
     * Start listening
     */
    function listen(port) {
        return new Promise((resolve) => {
            server.listen(port, () => {
                resolve(server);
            });
        });
    }

    return { app, server, io, listen, broadcastCheckResult };
}

module.exports = createServer;
