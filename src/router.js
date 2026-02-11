// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — API Router
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const express = require('express');
const NeuralNetwork = require('./ai/neural-network');
const TextClassifier = require('./ai/classifier');

function createRouter(engines, io) {
    const router = express.Router();

    // ─── Chat ────────────────────────────────────────────────────────
    router.post('/chat', (req, res) => {
        try {
            const { message, personality } = req.body;
            if (!message) return res.status(400).json({ error: 'Message is required' });
            if (personality) engines.chatbot.setPersonality(personality);
            const result = engines.chatbot.chat(message);
            res.json(result);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.get('/chat/personalities', (req, res) => {
        res.json(engines.chatbot.getPersonalities());
    });

    router.post('/chat/personality', (req, res) => {
        const result = engines.chatbot.setPersonality(req.body.personality);
        res.json(result);
    });

    router.post('/chat/clear', (req, res) => {
        res.json(engines.chatbot.clearContext());
    });

    // ─── Sentiment ───────────────────────────────────────────────────
    router.post('/sentiment', (req, res) => {
        try {
            const { text } = req.body;
            if (!text) return res.status(400).json({ error: 'Text is required' });
            res.json(engines.sentiment.analyze(text));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.get('/sentiment/history', (req, res) => {
        res.json(engines.sentiment.getHistory());
    });

    // ─── Summarizer ──────────────────────────────────────────────────
    router.post('/summarize', (req, res) => {
        try {
            const { text, ratio } = req.body;
            if (!text) return res.status(400).json({ error: 'Text is required' });
            res.json(engines.summarizer.summarize(text, { ratio: ratio || 0.3 }));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // ─── Code Analyzer ───────────────────────────────────────────────
    router.post('/code-analyze', (req, res) => {
        try {
            const { code, language } = req.body;
            if (!code) return res.status(400).json({ error: 'Code is required' });
            res.json(engines.codeAnalyzer.analyze(code, language));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // ─── Neural Network ──────────────────────────────────────────────
    router.get('/neural/datasets', (req, res) => {
        res.json(NeuralNetwork.getDatasets());
    });

    router.get('/neural/activations', (req, res) => {
        res.json(NeuralNetwork.getActivations());
    });

    router.post('/neural/train', (req, res) => {
        try {
            const { dataset: datasetId, layers, activation, learningRate, epochs } = req.body;
            const dataset = NeuralNetwork.getDataset(datasetId || 'xor');
            if (!dataset) return res.status(400).json({ error: 'Unknown dataset' });

            const layerSizes = layers || [dataset.inputSize, 8, 4, dataset.outputSize];
            const nn = new NeuralNetwork(layerSizes, activation || 'sigmoid', learningRate || 0.5);
            const history = nn.train(dataset.inputs, dataset.outputs, Math.min(epochs || 500, 2000));
            const boundary = nn.getDecisionBoundary(30);
            const state = nn.getNetworkState();

            res.json({ history, boundary, state, dataset: datasetId });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.post('/neural/predict', (req, res) => {
        try {
            const { input, layers, activation } = req.body;
            const nn = new NeuralNetwork(layers || [2, 4, 1], activation || 'sigmoid');
            res.json(nn.predict(input));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // ─── Text Generator ──────────────────────────────────────────────
    router.post('/generate', (req, res) => {
        try {
            const { style, maxWords, temperature, order } = req.body;
            res.json(engines.textGenerator.generate(style || 'tech', { maxWords, temperature, order }));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.get('/generate/styles', (req, res) => {
        res.json(engines.textGenerator.getStyles());
    });

    // ─── Classifier ──────────────────────────────────────────────────
    router.post('/classify/train', (req, res) => {
        try {
            const { data, dataset } = req.body;
            if (dataset) {
                res.json(engines.classifier.loadDemoDataset(dataset));
            } else if (data) {
                res.json(engines.classifier.train(data));
            } else {
                res.status(400).json({ error: 'Provide training data array or dataset ID' });
            }
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.post('/classify/predict', (req, res) => {
        try {
            const { text } = req.body;
            if (!text) return res.status(400).json({ error: 'Text is required' });
            res.json(engines.classifier.predict(text));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.get('/classify/datasets', (req, res) => {
        res.json(TextClassifier.getDemoDatasets());
    });

    // ─── Dashboard Summary ───────────────────────────────────────────
    router.get('/dashboard', (req, res) => {
        res.json({
            engines: [
                { id: 'chat', name: 'AI Chat', icon: '💬', description: 'Conversational AI with personality system', status: 'active' },
                { id: 'sentiment', name: 'Sentiment Analysis', icon: '😊', description: 'Multi-dimensional emotion detection', status: 'active' },
                { id: 'summarizer', name: 'Text Summarizer', icon: '📝', description: 'TF-IDF extractive summarization', status: 'active' },
                { id: 'codeAnalyzer', name: 'Code Analyzer', icon: '🔍', description: 'Multi-language code quality analysis', status: 'active' },
                { id: 'neural', name: 'Neural Playground', icon: '🧠', description: 'Interactive neural network trainer', status: 'active' },
                { id: 'generator', name: 'Text Generator', icon: '✍️', description: 'Markov chain text generation', status: 'active' },
                { id: 'classifier', name: 'Text Classifier', icon: '🏷️', description: 'Naive Bayes text classification', status: 'active' }
            ],
            stats: {
                chatMessages: engines.chatbot.getMetrics().messagesReceived,
                sentimentAnalyses: engines.sentiment.getHistory().length,
                generatedTexts: engines.textGenerator.getHistory().length,
                classifications: engines.classifier.getHistory().length
            },
            uptime: process.uptime()
        });
    });

    return router;
}

module.exports = createRouter;
