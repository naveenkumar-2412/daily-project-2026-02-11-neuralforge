// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Entry Point
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fs = require('fs');
const path = require('path');
const database = require('./database');
const createServer = require('./server');

// AI Engines
const Chatbot = require('./ai/chatbot');
const SentimentAnalyzer = require('./ai/sentiment');
const Summarizer = require('./ai/summarizer');
const CodeAnalyzer = require('./ai/code-analyzer');
const TextGenerator = require('./ai/text-generator');
const TextClassifier = require('./ai/classifier');

// ─── Load Config ─────────────────────────────────────────────────────────────

const configPath = path.join(__dirname, '..', 'config.json');
const exampleConfigPath = path.join(__dirname, '..', 'config.example.json');

let config;
if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} else if (fs.existsSync(exampleConfigPath)) {
    fs.copyFileSync(exampleConfigPath, configPath);
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log('[NeuralForge] Created config.json from example');
} else {
    config = { port: 3000 };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════════╗');
    console.log('  ║     🧠  NeuralForge AI Studio  🧠               ║');
    console.log('  ╚══════════════════════════════════════════════════╝');
    console.log('');

    // Initialize database
    await database.init();
    console.log('  ✅ Database initialized');

    // Initialize AI engines
    const engines = {
        chatbot: new Chatbot(),
        sentiment: new SentimentAnalyzer(),
        summarizer: new Summarizer(),
        codeAnalyzer: new CodeAnalyzer(),
        textGenerator: new TextGenerator(),
        classifier: new TextClassifier()
    };

    console.log('  ✅ AI Engines loaded:');
    console.log('     • Chatbot (Markov Chain + Rule-based)');
    console.log('     • Sentiment Analyzer (Multi-dimensional)');
    console.log('     • Text Summarizer (TF-IDF Extractive)');
    console.log('     • Code Analyzer (Multi-language)');
    console.log('     • Neural Network (Backpropagation)');
    console.log('     • Text Generator (Markov Chain)');
    console.log('     • Text Classifier (Naive Bayes)');

    // Pre-load classifier with demo data
    engines.classifier.loadDemoDataset('spam');
    console.log('  ✅ Classifier pre-loaded with spam dataset');

    // Start server
    const port = config.port || 3000;
    const { listen } = createServer(config, engines);
    await listen(port);

    console.log('');
    console.log('  ╔══════════════════════════════════════════════════╗');
    console.log(`  ║   🚀 Server running at http://localhost:${port}      ║`);
    console.log('  ║   📡 API available at /api                      ║');
    console.log('  ║   🔌 WebSocket enabled for real-time features   ║');
    console.log('  ╚══════════════════════════════════════════════════╝');
    console.log('');

    // Graceful shutdown
    const shutdown = () => {
        console.log('\n  [NeuralForge] Shutting down...');
        process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

main().catch(err => {
    console.error('[NeuralForge] Fatal error:', err);
    process.exit(1);
});
