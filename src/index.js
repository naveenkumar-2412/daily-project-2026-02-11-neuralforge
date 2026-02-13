// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Entry Point (15 AI Engines)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fs = require('fs');
const path = require('path');
const database = require('./database');
const createServer = require('./server');

// Original AI Engines
const Chatbot = require('./ai/chatbot');
const SentimentAnalyzer = require('./ai/sentiment');
const Summarizer = require('./ai/summarizer');
const CodeAnalyzer = require('./ai/code-analyzer');
const TextGenerator = require('./ai/text-generator');
const TextClassifier = require('./ai/classifier');

// New AI Engines
const Translator = require('./ai/translator');
const QAEngine = require('./ai/qa-engine');
const NEREngine = require('./ai/ner');
const Recommender = require('./ai/recommender');
const AnomalyDetector = require('./ai/anomaly-detector');
const SpellChecker = require('./ai/spell-checker');
const KeywordExtractor = require('./ai/keyword-extractor');
const Paraphraser = require('./ai/paraphraser');

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
    console.log('  ║           15 AI Engines Loaded                  ║');
    console.log('  ╚══════════════════════════════════════════════════╝');
    console.log('');

    // Initialize database
    await database.init();
    console.log('  ✅ Database initialized');

    // Initialize all 15 AI engines
    const engines = {
        chatbot: new Chatbot(),
        sentiment: new SentimentAnalyzer(),
        summarizer: new Summarizer(),
        codeAnalyzer: new CodeAnalyzer(),
        textGenerator: new TextGenerator(),
        classifier: new TextClassifier(),
        translator: new Translator(),
        qa: new QAEngine(),
        ner: new NEREngine(),
        recommender: new Recommender(),
        anomaly: new AnomalyDetector(),
        spellChecker: new SpellChecker(),
        keywords: new KeywordExtractor(),
        paraphraser: new Paraphraser()
    };

    console.log('  ✅ AI Engines loaded:');
    console.log('     ┌─ Core Engines ──────────────────────────');
    console.log('     │  • Chatbot (Intent Classification + Context)');
    console.log('     │  • Sentiment Analyzer (Multi-dimensional)');
    console.log('     │  • Text Summarizer (TF-IDF Extractive)');
    console.log('     │  • Code Analyzer (Multi-language)');
    console.log('     │  • Neural Network (Backpropagation)');
    console.log('     │  • Text Generator (Markov Chain)');
    console.log('     │  • Text Classifier (Naive Bayes)');
    console.log('     ├─ New Engines ───────────────────────────');
    console.log('     │  • Translator (5 Language Pairs)');
    console.log('     │  • Q&A Engine (Knowledge Base)');
    console.log('     │  • NER (Named Entity Recognition)');
    console.log('     │  • Recommender (Content-Based Filtering)');
    console.log('     │  • Anomaly Detector (Z-Score/IQR/Isolation)');
    console.log('     │  • Spell Checker (Levenshtein Distance)');
    console.log('     │  • Keyword Extractor (TF-IDF/TextRank)');
    console.log('     │  • Paraphraser (Synonym Replacement)');
    console.log('     └────────────────────────────────────────');

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
    console.log('  ║   🧠 15 AI engines active                       ║');
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
