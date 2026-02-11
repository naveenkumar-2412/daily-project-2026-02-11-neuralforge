// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Express + Socket.IO Server
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const http = require('http');
const express = require('express');
const { Server: SocketIOServer } = require('socket.io');
const path = require('path');
const createRouter = require('./router');

function createServer(config, engines) {
    const app = express();
    const server = http.createServer(app);
    const io = new SocketIOServer(server, { cors: { origin: '*' } });

    // Middleware
    app.use(express.json({ limit: '5mb' }));
    app.use(express.static(path.join(__dirname, '..', 'public')));

    // API Routes
    app.use('/api', createRouter(engines, io));

    // Health endpoint
    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
            name: 'NeuralForge AI Studio',
            version: '1.0.0',
            uptime: process.uptime(),
            engines: Object.keys(engines),
            timestamp: new Date().toISOString()
        });
    });

    // Socket.IO connection handling
    io.on('connection', (socket) => {
        console.log(`[NeuralForge] Client connected: ${socket.id}`);

        // Real-time chat
        socket.on('chat:message', (data) => {
            try {
                const result = engines.chatbot.chat(data.message);
                socket.emit('chat:response', result);
            } catch (err) {
                socket.emit('chat:error', { error: err.message });
            }
        });

        // Real-time neural network training
        socket.on('neural:train', (data) => {
            try {
                const NeuralNetwork = require('./ai/neural-network');
                const dataset = NeuralNetwork.getDataset(data.dataset);
                if (!dataset) { socket.emit('neural:error', { error: 'Unknown dataset' }); return; }

                const layers = data.layers || [dataset.inputSize, 8, 4, dataset.outputSize];
                const nn = new NeuralNetwork(layers, data.activation || 'sigmoid', data.learningRate || 0.5);
                const epochs = Math.min(data.epochs || 500, 2000);

                socket.emit('neural:started', { layers, activation: data.activation, epochs, dataset: data.dataset });

                // Train with progress callbacks
                const history = nn.train(dataset.inputs, dataset.outputs, epochs, (progress) => {
                    socket.emit('neural:progress', progress);
                });

                // Send final results
                const boundary = nn.getDecisionBoundary(30);
                const state = nn.getNetworkState();
                socket.emit('neural:complete', { history, boundary, state, dataset: data.dataset });
            } catch (err) {
                socket.emit('neural:error', { error: err.message });
            }
        });

        socket.on('disconnect', () => {
            console.log(`[NeuralForge] Client disconnected: ${socket.id}`);
        });
    });

    // SPA fallback
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    });

    return {
        listen: (port) => new Promise((resolve) => {
            server.listen(port, () => resolve());
        }),
        io
    };
}

module.exports = createServer;
