// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — API Router (15 Engines)
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // NEW ENGINES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // ─── Translator ──────────────────────────────────────────────────
    router.post('/translate', (req, res) => {
        try {
            const { text, from, to } = req.body;
            if (!text) return res.status(400).json({ error: 'Text is required' });
            res.json(engines.translator.translate(text, from || 'en', to || 'es'));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.post('/translate/detect', (req, res) => {
        try {
            const { text } = req.body;
            if (!text) return res.status(400).json({ error: 'Text is required' });
            res.json(engines.translator.detectLanguage(text));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.get('/translate/languages', (req, res) => {
        res.json(engines.translator.getSupportedLanguages());
    });

    // ─── Question & Answer ───────────────────────────────────────────
    router.post('/qa', (req, res) => {
        try {
            const { question } = req.body;
            if (!question) return res.status(400).json({ error: 'Question is required' });
            res.json(engines.qa.answer(question));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.get('/qa/topics', (req, res) => {
        res.json(engines.qa.getTopics());
    });

    router.get('/qa/history', (req, res) => {
        res.json(engines.qa.getHistory());
    });

    // ─── Named Entity Recognition ────────────────────────────────────
    router.post('/ner', (req, res) => {
        try {
            const { text } = req.body;
            if (!text) return res.status(400).json({ error: 'Text is required' });
            res.json(engines.ner.extract(text));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.get('/ner/types', (req, res) => {
        res.json(engines.ner.getEntityTypes());
    });

    // ─── Recommender ─────────────────────────────────────────────────
    router.post('/recommend', (req, res) => {
        try {
            const { interests, difficulty, category, limit } = req.body;
            res.json(engines.recommender.recommend({ interests, difficulty, category, limit }));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.post('/recommend/similar', (req, res) => {
        try {
            const { itemId, limit } = req.body;
            if (!itemId) return res.status(400).json({ error: 'itemId is required' });
            res.json(engines.recommender.getSimilar(itemId, limit));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.get('/recommend/categories', (req, res) => {
        res.json(engines.recommender.getCategories());
    });

    // ─── Anomaly Detection ───────────────────────────────────────────
    router.post('/anomaly', (req, res) => {
        try {
            const { data, method, threshold, features } = req.body;
            if (!data) return res.status(400).json({ error: 'Data array is required' });
            res.json(engines.anomaly.detect(data, { method, threshold, features }));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.get('/anomaly/methods', (req, res) => {
        res.json(engines.anomaly.getMethods());
    });

    // ─── Spell Checker ───────────────────────────────────────────────
    router.post('/spellcheck', (req, res) => {
        try {
            const { text } = req.body;
            if (!text) return res.status(400).json({ error: 'Text is required' });
            res.json(engines.spellChecker.check(text));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.post('/spellcheck/add', (req, res) => {
        try {
            const { word } = req.body;
            if (!word) return res.status(400).json({ error: 'Word is required' });
            res.json(engines.spellChecker.addWord(word));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.get('/spellcheck/dictionary', (req, res) => {
        res.json(engines.spellChecker.getDictionarySize());
    });

    // ─── Keyword Extractor ───────────────────────────────────────────
    router.post('/keywords', (req, res) => {
        try {
            const { text, maxKeywords, method } = req.body;
            if (!text) return res.status(400).json({ error: 'Text is required' });
            res.json(engines.keywords.extract(text, { maxKeywords, method }));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.get('/keywords/methods', (req, res) => {
        res.json(engines.keywords.getMethods());
    });

    // ─── Paraphraser ─────────────────────────────────────────────────
    router.post('/paraphrase', (req, res) => {
        try {
            const { text, intensity } = req.body;
            if (!text) return res.status(400).json({ error: 'Text is required' });
            res.json(engines.paraphraser.paraphrase(text, { intensity }));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.post('/paraphrase/synonyms', (req, res) => {
        try {
            const { word } = req.body;
            if (!word) return res.status(400).json({ error: 'Word is required' });
            res.json(engines.paraphraser.getSynonyms(word));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.get('/paraphrase/levels', (req, res) => {
        res.json(engines.paraphraser.getIntensityLevels());
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
                { id: 'classifier', name: 'Text Classifier', icon: '🏷️', description: 'Naive Bayes text classification', status: 'active' },
                { id: 'translator', name: 'Translator', icon: '🌍', description: 'Multi-language dictionary translation', status: 'active' },
                { id: 'qa', name: 'Q&A Engine', icon: '❓', description: 'Knowledge-base question answering', status: 'active' },
                { id: 'ner', name: 'Entity Recognition', icon: '🏷️', description: 'Named entity extraction (NER)', status: 'active' },
                { id: 'recommender', name: 'Recommender', icon: '⭐', description: 'Content-based recommendations', status: 'active' },
                { id: 'anomaly', name: 'Anomaly Detector', icon: '📊', description: 'Statistical anomaly detection', status: 'active' },
                { id: 'spellcheck', name: 'Spell Checker', icon: '✏️', description: 'Dictionary-based spell checking', status: 'active' },
                { id: 'keywords', name: 'Keyword Extractor', icon: '🔑', description: 'TF-IDF keyword extraction', status: 'active' },
                { id: 'paraphrase', name: 'Paraphraser', icon: '🔄', description: 'Rule-based text paraphrasing', status: 'active' }
            ],
            stats: {
                totalEngines: 15,
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
