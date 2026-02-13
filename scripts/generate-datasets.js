#!/usr/bin/env node
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Massive Dataset Generator
// Generates ~1GB of training data for all AI engines
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DIRS = ['embeddings', 'corpus', 'sentiment', 'classification', 'code-samples', 'qa', 'ner', 'dictionary', 'recommendations'];

// ─── Utility ─────────────────────────────────────────────────────────────────

function ensureDirs() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    for (const d of DIRS) {
        const p = path.join(DATA_DIR, d);
        if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    }
}

function rng(seed) {
    let s = seed;
    return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
}

function pick(arr, rand) { return arr[Math.floor(rand() * arr.length)]; }

function formatBytes(b) {
    if (b >= 1e9) return (b / 1e9).toFixed(2) + ' GB';
    if (b >= 1e6) return (b / 1e6).toFixed(2) + ' MB';
    if (b >= 1e3) return (b / 1e3).toFixed(2) + ' KB';
    return b + ' B';
}

let totalBytes = 0;
function writeData(filePath, data) {
    fs.writeFileSync(filePath, data);
    const size = Buffer.byteLength(data, 'utf8');
    totalBytes += size;
    console.log(`  ✅ ${path.relative(DATA_DIR, filePath)} — ${formatBytes(size)}`);
}

function writeStream(filePath, generator) {
    const ws = fs.createWriteStream(filePath);
    let size = 0;
    return new Promise((resolve) => {
        function write() {
            const chunk = generator();
            if (chunk === null) { ws.end(); return; }
            size += Buffer.byteLength(chunk, 'utf8');
            if (!ws.write(chunk)) { ws.once('drain', write); } else { setImmediate(write); }
        }
        ws.on('finish', () => { totalBytes += size; console.log(`  ✅ ${path.relative(DATA_DIR, filePath)} — ${formatBytes(size)}`); resolve(size); });
        write();
    });
}

// ─── Word Lists ──────────────────────────────────────────────────────────────

const NOUNS = ['time', 'year', 'people', 'way', 'day', 'man', 'woman', 'child', 'world', 'life', 'hand', 'part', 'place', 'case', 'week', 'company', 'system', 'program', 'question', 'work', 'government', 'number', 'night', 'point', 'home', 'water', 'room', 'mother', 'area', 'money', 'story', 'fact', 'month', 'lot', 'right', 'study', 'book', 'eye', 'job', 'word', 'business', 'issue', 'side', 'kind', 'head', 'house', 'service', 'friend', 'father', 'power', 'hour', 'game', 'line', 'end', 'member', 'law', 'car', 'city', 'community', 'name', 'president', 'team', 'minute', 'idea', 'body', 'information', 'back', 'parent', 'face', 'others', 'level', 'office', 'door', 'health', 'person', 'art', 'war', 'history', 'party', 'result', 'change', 'morning', 'reason', 'research', 'girl', 'guy', 'moment', 'air', 'teacher', 'force', 'education'];
const VERBS = ['be', 'have', 'do', 'say', 'go', 'get', 'make', 'know', 'think', 'take', 'come', 'see', 'want', 'look', 'use', 'find', 'give', 'tell', 'work', 'call', 'try', 'ask', 'need', 'feel', 'become', 'leave', 'put', 'mean', 'keep', 'let', 'begin', 'seem', 'help', 'show', 'hear', 'play', 'run', 'move', 'live', 'believe', 'hold', 'bring', 'happen', 'write', 'provide', 'sit', 'stand', 'lose', 'pay', 'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read', 'allow', 'add', 'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'love', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send', 'expect', 'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain'];
const ADJS = ['good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other', 'old', 'right', 'big', 'high', 'different', 'small', 'large', 'next', 'early', 'young', 'important', 'few', 'public', 'bad', 'same', 'able', 'free', 'sure', 'real', 'full', 'special', 'easy', 'clear', 'recent', 'certain', 'personal', 'open', 'red', 'difficult', 'available', 'likely', 'short', 'single', 'medical', 'current', 'wrong', 'private', 'past', 'foreign', 'fine', 'common', 'poor', 'natural', 'significant', 'similar', 'hot', 'dead', 'central', 'happy', 'serious', 'ready', 'left', 'physical', 'general', 'environmental', 'financial', 'blue', 'democratic', 'dark', 'various', 'entire', 'close', 'legal', 'religious', 'cold', 'final', 'main', 'green', 'nice', 'huge', 'popular', 'traditional', 'cultural'];
const ADVS = ['up', 'so', 'out', 'just', 'now', 'how', 'then', 'more', 'also', 'here', 'well', 'only', 'very', 'even', 'back', 'there', 'down', 'still', 'in', 'as', 'to', 'when', 'never', 'really', 'most', 'about', 'already', 'much', 'ever', 'again', 'on', 'over', 'often', 'away', 'right', 'sometimes', 'always', 'quickly', 'slowly', 'carefully', 'easily', 'finally', 'suddenly', 'actually', 'probably', 'certainly', 'nearly', 'simply', 'generally', 'recently', 'usually', 'clearly', 'apparently', 'obviously'];

const TOPICS_LIST = ['artificial intelligence', 'machine learning', 'deep learning', 'natural language processing', 'computer vision', 'robotics', 'blockchain', 'quantum computing', 'cybersecurity', 'cloud computing', 'data science', 'web development', 'mobile development', 'game development', 'devops', 'microservices', 'databases', 'algorithms', 'neural networks', 'reinforcement learning', 'generative ai', 'transformers', 'large language models', 'edge computing', 'iot', 'augmented reality', 'virtual reality', 'autonomous vehicles', 'bioinformatics', 'computational biology'];

const EMOTIONS = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation'];
const SENTIMENTS = ['very positive', 'positive', 'slightly positive', 'neutral', 'slightly negative', 'negative', 'very negative'];

const LANGUAGES = ['javascript', 'python', 'java', 'csharp', 'go', 'rust', 'typescript', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'cpp', 'c', 'sql', 'html', 'css', 'bash', 'r', 'matlab'];

const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa', 'Timothy', 'Deborah'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

const ENTITIES_ORGS = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'OpenAI', 'DeepMind', 'Tesla', 'SpaceX', 'Netflix', 'Anthropic', 'NVIDIA', 'Intel', 'AMD', 'IBM', 'Oracle', 'Salesforce', 'Adobe', 'Uber', 'Airbnb', 'Twitter', 'LinkedIn', 'Spotify', 'Slack', 'Zoom', 'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'MongoDB'];
const ENTITIES_LOCS = ['New York', 'San Francisco', 'London', 'Tokyo', 'Berlin', 'Paris', 'Sydney', 'Toronto', 'Singapore', 'Dubai', 'Beijing', 'Seoul', 'Mumbai', 'São Paulo', 'Moscow', 'Cairo', 'Lagos', 'Jakarta', 'Bangkok', 'Istanbul'];

// ─── Generator Functions ─────────────────────────────────────────────────────

function generateSentence(rand) {
    const templates = [
        () => `The ${pick(ADJS, rand)} ${pick(NOUNS, rand)} ${pick(ADVS, rand)} ${pick(VERBS, rand)}s the ${pick(ADJS, rand)} ${pick(NOUNS, rand)}.`,
        () => `${pick(FIRST_NAMES, rand)} ${pick(LAST_NAMES, rand)} ${pick(VERBS, rand)}s ${pick(ADVS, rand)} at ${pick(ENTITIES_ORGS, rand)}.`,
        () => `In ${pick(ENTITIES_LOCS, rand)}, the ${pick(NOUNS, rand)} of ${pick(TOPICS_LIST, rand)} continues to ${pick(VERBS, rand)}.`,
        () => `The ${pick(ADJS, rand)} ${pick(NOUNS, rand)} is a ${pick(ADJS, rand)} ${pick(NOUNS, rand)} that ${pick(VERBS, rand)}s ${pick(NOUNS, rand)}.`,
        () => `According to ${pick(FIRST_NAMES, rand)} ${pick(LAST_NAMES, rand)}, ${pick(TOPICS_LIST, rand)} will ${pick(ADVS, rand)} ${pick(VERBS, rand)} the ${pick(NOUNS, rand)}.`,
        () => `${pick(ENTITIES_ORGS, rand)} announced a ${pick(ADJS, rand)} ${pick(NOUNS, rand)} for ${pick(TOPICS_LIST, rand)} ${pick(NOUNS, rand)}.`,
        () => `The ${pick(NOUNS, rand)} of ${pick(NOUNS, rand)} ${pick(ADVS, rand)} ${pick(VERBS, rand)}s when the ${pick(NOUNS, rand)} ${pick(VERBS, rand)}s.`,
        () => `Many ${pick(ADJS, rand)} ${pick(NOUNS, rand)}s ${pick(ADVS, rand)} ${pick(VERBS, rand)} the ${pick(ADJS, rand)} ${pick(NOUNS, rand)} every ${pick(NOUNS, rand)}.`,
    ];
    return pick(templates, rand)();
}

function generateParagraph(rand, sentences = 5) {
    return Array.from({ length: sentences }, () => generateSentence(rand)).join(' ');
}

// ─── 1. Word Embeddings (~300MB) ─────────────────────────────────────────────

async function generateEmbeddings() {
    console.log('\n📦 Generating word embeddings...');
    const rand = rng(42);

    // Generate 150K word vectors in batches
    const TOTAL_WORDS = 150000;
    const DIM = 300;
    const BATCH = 10000;

    for (let batch = 0; batch < TOTAL_WORDS / BATCH; batch++) {
        let idx = 0;
        const filePath = path.join(DATA_DIR, 'embeddings', `vectors_${String(batch).padStart(3, '0')}.json`);
        await writeStream(filePath, () => {
            if (idx >= BATCH) return null;
            const wordBase = NOUNS.concat(VERBS, ADJS, ADVS);
            const word = idx < wordBase.length ? wordBase[idx] : `w${batch * BATCH + idx}_${crypto.randomBytes(4).toString('hex')}`;
            const vec = Array.from({ length: DIM }, () => (rand() * 2 - 1).toFixed(6));
            const line = JSON.stringify({ w: word, v: vec }) + '\n';
            idx++;
            return line;
        });
    }

    // Generate analogy pairs
    const analogies = [];
    for (let i = 0; i < 50000; i++) {
        analogies.push({
            a: pick(NOUNS, rand), b: pick(NOUNS, rand),
            c: pick(NOUNS, rand), d: pick(NOUNS, rand),
            score: rand().toFixed(4)
        });
    }
    writeData(path.join(DATA_DIR, 'embeddings', 'analogies.json'), JSON.stringify(analogies, null, 1));

    // Generate word similarity pairs
    const similarities = [];
    for (let i = 0; i < 100000; i++) {
        similarities.push({
            w1: pick(NOUNS.concat(VERBS, ADJS), rand),
            w2: pick(NOUNS.concat(VERBS, ADJS), rand),
            sim: rand().toFixed(6),
            freq1: Math.floor(rand() * 100000),
            freq2: Math.floor(rand() * 100000)
        });
    }
    writeData(path.join(DATA_DIR, 'embeddings', 'similarities.json'), JSON.stringify(similarities, null, 1));
}

// ─── 2. NLP Corpus (~200MB) ──────────────────────────────────────────────────

async function generateCorpus() {
    console.log('\n📦 Generating NLP corpus...');
    const rand = rng(123);

    // Generate conversation corpus (for chatbot training)
    for (let file = 0; file < 10; file++) {
        let idx = 0;
        const MAX = 30000;
        const filePath = path.join(DATA_DIR, 'corpus', `conversations_${String(file).padStart(3, '0')}.jsonl`);
        await writeStream(filePath, () => {
            if (idx >= MAX) return null;
            const turns = Math.floor(rand() * 6) + 2;
            const conv = { id: `conv_${file}_${idx}`, turns: [] };
            for (let t = 0; t < turns; t++) {
                conv.turns.push({
                    role: t % 2 === 0 ? 'user' : 'assistant',
                    text: generateParagraph(rand, Math.floor(rand() * 3) + 1),
                    timestamp: Date.now() - Math.floor(rand() * 1e9)
                });
            }
            idx++;
            return JSON.stringify(conv) + '\n';
        });
    }

    // Generate article corpus (for summarizer and text generator)
    for (let file = 0; file < 10; file++) {
        let idx = 0;
        const MAX = 10000;
        const filePath = path.join(DATA_DIR, 'corpus', `articles_${String(file).padStart(3, '0')}.jsonl`);
        await writeStream(filePath, () => {
            if (idx >= MAX) return null;
            const pCount = Math.floor(rand() * 8) + 3;
            const article = {
                id: `art_${file}_${idx}`,
                title: `${pick(ADJS, rand)} ${pick(NOUNS, rand)} in ${pick(TOPICS_LIST, rand)}`.replace(/\b\w/g, l => l.toUpperCase()),
                author: `${pick(FIRST_NAMES, rand)} ${pick(LAST_NAMES, rand)}`,
                topic: pick(TOPICS_LIST, rand),
                date: new Date(Date.now() - Math.floor(rand() * 3e10)).toISOString().split('T')[0],
                paragraphs: Array.from({ length: pCount }, () => generateParagraph(rand, Math.floor(rand() * 6) + 3)),
                tags: Array.from({ length: Math.floor(rand() * 5) + 2 }, () => pick(TOPICS_LIST, rand)),
                wordCount: 0
            };
            article.wordCount = article.paragraphs.join(' ').split(/\s+/).length;
            idx++;
            return JSON.stringify(article) + '\n';
        });
    }
}

// ─── 3. Sentiment Data (~100MB) ──────────────────────────────────────────────

async function generateSentimentData() {
    console.log('\n📦 Generating sentiment datasets...');
    const rand = rng(456);

    for (let file = 0; file < 5; file++) {
        let idx = 0;
        const MAX = 50000;
        const filePath = path.join(DATA_DIR, 'sentiment', `sentiment_${String(file).padStart(3, '0')}.jsonl`);
        await writeStream(filePath, () => {
            if (idx >= MAX) return null;
            const scoreRaw = rand() * 2 - 1;
            const entry = {
                id: `sent_${file}_${idx}`,
                text: generateParagraph(rand, Math.floor(rand() * 3) + 1),
                label: pick(SENTIMENTS, rand),
                score: parseFloat(scoreRaw.toFixed(4)),
                emotions: Object.fromEntries(EMOTIONS.map(e => [e, parseFloat((rand() * (e === pick(EMOTIONS, rand) ? 1 : 0.3)).toFixed(4))])),
                source: pick(['twitter', 'reddit', 'review', 'news', 'blog', 'forum'], rand),
                language: 'en',
                confidence: parseFloat((0.5 + rand() * 0.5).toFixed(4))
            };
            idx++;
            return JSON.stringify(entry) + '\n';
        });
    }

    // Emotion lexicon
    const lexicon = {};
    const allWords = [...new Set([...NOUNS, ...VERBS, ...ADJS, ...ADVS])];
    for (const word of allWords) {
        lexicon[word] = {
            valence: parseFloat((rand() * 2 - 1).toFixed(4)),
            arousal: parseFloat(rand().toFixed(4)),
            dominance: parseFloat(rand().toFixed(4)),
            emotions: Object.fromEntries(EMOTIONS.map(e => [e, parseFloat(rand().toFixed(4))]))
        };
    }
    // Expand lexicon with generated words
    for (let i = 0; i < 20000; i++) {
        const word = `${pick(ADJS, rand)}${pick(NOUNS, rand)}${i}`;
        lexicon[word] = {
            valence: parseFloat((rand() * 2 - 1).toFixed(4)),
            arousal: parseFloat(rand().toFixed(4)),
            dominance: parseFloat(rand().toFixed(4)),
            emotions: Object.fromEntries(EMOTIONS.map(e => [e, parseFloat(rand().toFixed(4))]))
        };
    }
    writeData(path.join(DATA_DIR, 'sentiment', 'emotion_lexicon.json'), JSON.stringify(lexicon, null, 1));
}

// ─── 4. Classification Data (~100MB) ─────────────────────────────────────────

async function generateClassificationData() {
    console.log('\n📦 Generating classification datasets...');
    const rand = rng(789);
    const categories = ['technology', 'science', 'sports', 'politics', 'entertainment', 'business', 'health', 'education', 'environment', 'travel'];

    for (let file = 0; file < 5; file++) {
        let idx = 0;
        const MAX = 40000;
        const filePath = path.join(DATA_DIR, 'classification', `topics_${String(file).padStart(3, '0')}.jsonl`);
        await writeStream(filePath, () => {
            if (idx >= MAX) return null;
            const cat = pick(categories, rand);
            const entry = {
                id: `cls_${file}_${idx}`,
                text: generateParagraph(rand, Math.floor(rand() * 4) + 2),
                category: cat,
                subcategory: `${cat}_${Math.floor(rand() * 5)}`,
                confidence: parseFloat((0.6 + rand() * 0.4).toFixed(4)),
                features: Array.from({ length: 20 }, () => pick(NOUNS.concat(ADJS), rand)),
                tfidf: Object.fromEntries(Array.from({ length: 10 }, () => [pick(NOUNS, rand), parseFloat(rand().toFixed(6))]))
            };
            idx++;
            return JSON.stringify(entry) + '\n';
        });
    }

    // Spam dataset (large)
    let idx = 0;
    const SPAM_MAX = 100000;
    const spamPath = path.join(DATA_DIR, 'classification', 'spam_dataset.jsonl');
    await writeStream(spamPath, () => {
        if (idx >= SPAM_MAX) return null;
        const isSpam = rand() < 0.3;
        const entry = {
            text: generateParagraph(rand, Math.floor(rand() * 2) + 1),
            label: isSpam ? 'spam' : 'ham',
            features: { length: Math.floor(rand() * 500), caps_ratio: parseFloat(rand().toFixed(4)), link_count: Math.floor(rand() * 5), exclamation_count: Math.floor(rand() * 10) }
        };
        idx++;
        return JSON.stringify(entry) + '\n';
    });
}

// ─── 5. Code Samples (~100MB) ────────────────────────────────────────────────

function generateCodeSnippet(rand, lang) {
    const templates = {
        javascript: [
            () => `function ${pick(VERBS, rand)}${pick(NOUNS, rand).charAt(0).toUpperCase() + pick(NOUNS, rand).slice(1)}(${pick(NOUNS, rand)}, ${pick(NOUNS, rand)}) {\n  const result = ${pick(NOUNS, rand)}.${pick(VERBS, rand)}(${pick(NOUNS, rand)});\n  if (result.${pick(NOUNS, rand)} > ${Math.floor(rand() * 100)}) {\n    return result.${pick(VERBS, rand)}();\n  }\n  return null;\n}`,
            () => `class ${pick(NOUNS, rand).charAt(0).toUpperCase() + pick(NOUNS, rand).slice(1)}Manager {\n  constructor(${pick(NOUNS, rand)}) {\n    this.${pick(NOUNS, rand)} = ${pick(NOUNS, rand)};\n    this.${pick(NOUNS, rand)} = [];\n  }\n\n  async ${pick(VERBS, rand)}(${pick(NOUNS, rand)}) {\n    try {\n      const data = await this.${pick(NOUNS, rand)}.${pick(VERBS, rand)}(${pick(NOUNS, rand)});\n      return { success: true, data };\n    } catch (err) {\n      console.error(err);\n      return { success: false };\n    }\n  }\n}`,
        ],
        python: [
            () => `def ${pick(VERBS, rand)}_${pick(NOUNS, rand)}(${pick(NOUNS, rand)}, ${pick(NOUNS, rand)}=None):\n    \"\"\"${pick(ADJS, rand)} ${pick(NOUNS, rand)} processor.\"\"\"\n    result = []\n    for item in ${pick(NOUNS, rand)}:\n        if item.${pick(NOUNS, rand)} > ${Math.floor(rand() * 100)}:\n            result.append(item.${pick(VERBS, rand)}())\n    return result if result else None`,
            () => `class ${pick(NOUNS, rand).charAt(0).toUpperCase() + pick(NOUNS, rand).slice(1)}Engine:\n    def __init__(self, ${pick(NOUNS, rand)}: str, ${pick(NOUNS, rand)}: int = ${Math.floor(rand() * 100)}):\n        self.${pick(NOUNS, rand)} = ${pick(NOUNS, rand)}\n        self._${pick(NOUNS, rand)} = []\n\n    def ${pick(VERBS, rand)}(self, ${pick(NOUNS, rand)}):\n        try:\n            data = self._${pick(VERBS, rand)}_${pick(NOUNS, rand)}(${pick(NOUNS, rand)})\n            return {"status": "ok", "data": data}\n        except Exception as e:\n            return {"status": "error", "msg": str(e)}`,
        ],
    };
    const available = templates[lang] || templates.javascript;
    return pick(available, rand)();
}

async function generateCodeSamples() {
    console.log('\n📦 Generating code samples...');
    const rand = rng(321);

    for (const lang of LANGUAGES) {
        let idx = 0;
        const MAX = 5000;
        const filePath = path.join(DATA_DIR, 'code-samples', `${lang}_samples.jsonl`);
        await writeStream(filePath, () => {
            if (idx >= MAX) return null;
            const useLang = (lang === 'javascript' || lang === 'python') ? lang : 'javascript';
            const entry = {
                id: `code_${lang}_${idx}`,
                language: lang,
                code: generateCodeSnippet(rand, useLang),
                complexity: Math.floor(rand() * 10) + 1,
                quality: pick(['A', 'B', 'C', 'D', 'F'], rand),
                issues: Math.floor(rand() * 8),
                lines: Math.floor(rand() * 200) + 5,
                metrics: {
                    cyclomaticComplexity: Math.floor(rand() * 20) + 1,
                    maintainabilityIndex: Math.floor(rand() * 100),
                    halsteadDifficulty: parseFloat((rand() * 50).toFixed(2)),
                    linesOfCode: Math.floor(rand() * 200) + 5,
                    commentRatio: parseFloat(rand().toFixed(4))
                }
            };
            idx++;
            return JSON.stringify(entry) + '\n';
        });
    }
}

// ─── 6. Q&A Data (~50MB) ─────────────────────────────────────────────────────

async function generateQAData() {
    console.log('\n📦 Generating Q&A datasets...');
    const rand = rng(654);

    let idx = 0;
    const MAX = 100000;
    const filePath = path.join(DATA_DIR, 'qa', 'qa_pairs.jsonl');
    await writeStream(filePath, () => {
        if (idx >= MAX) return null;
        const topic = pick(TOPICS_LIST, rand);
        const entry = {
            id: `qa_${idx}`,
            question: `What is the ${pick(ADJS, rand)} ${pick(NOUNS, rand)} of ${topic} and how does it ${pick(VERBS, rand)} the ${pick(NOUNS, rand)}?`,
            answer: generateParagraph(rand, Math.floor(rand() * 3) + 2),
            topic: topic,
            difficulty: pick(['easy', 'medium', 'hard', 'expert'], rand),
            confidence: parseFloat((0.5 + rand() * 0.5).toFixed(4)),
            sources: Array.from({ length: Math.floor(rand() * 3) + 1 }, () => `https://${pick(['arxiv.org', 'wikipedia.org', 'docs.dev', 'papers.io'], rand)}/article/${Math.floor(rand() * 99999)}`)
        };
        idx++;
        return JSON.stringify(entry) + '\n';
    });

    // Knowledge graph
    const graph = { nodes: [], edges: [] };
    for (let i = 0; i < 50000; i++) {
        graph.nodes.push({
            id: `n${i}`,
            label: `${pick(ADJS, rand)} ${pick(NOUNS, rand)}`,
            type: pick(['concept', 'entity', 'relation', 'property'], rand),
            topic: pick(TOPICS_LIST, rand),
            weight: parseFloat(rand().toFixed(4))
        });
    }
    for (let i = 0; i < 200000; i++) {
        graph.edges.push({
            source: `n${Math.floor(rand() * 50000)}`,
            target: `n${Math.floor(rand() * 50000)}`,
            relation: pick(['is_a', 'part_of', 'related_to', 'causes', 'used_for', 'instance_of', 'has_property'], rand),
            weight: parseFloat(rand().toFixed(4))
        });
    }
    writeData(path.join(DATA_DIR, 'qa', 'knowledge_graph.json'), JSON.stringify(graph, null, 1));
}

// ─── 7. NER Data (~50MB) ─────────────────────────────────────────────────────

async function generateNERData() {
    console.log('\n📦 Generating NER datasets...');
    const rand = rng(987);

    let idx = 0;
    const MAX = 80000;
    const filePath = path.join(DATA_DIR, 'ner', 'ner_training.jsonl');
    await writeStream(filePath, () => {
        if (idx >= MAX) return null;
        const name = `${pick(FIRST_NAMES, rand)} ${pick(LAST_NAMES, rand)}`;
        const org = pick(ENTITIES_ORGS, rand);
        const loc = pick(ENTITIES_LOCS, rand);
        const text = `${name} works at ${org} in ${loc}. The ${pick(ADJS, rand)} ${pick(NOUNS, rand)} ${pick(ADVS, rand)} ${pick(VERBS, rand)}s.`;
        const entry = {
            id: `ner_${idx}`,
            text,
            entities: [
                { text: name, label: 'PERSON', start: 0, end: name.length },
                { text: org, label: 'ORG', start: text.indexOf(org), end: text.indexOf(org) + org.length },
                { text: loc, label: 'LOC', start: text.indexOf(loc), end: text.indexOf(loc) + loc.length },
            ],
            tokens: text.split(/\s+/).map(t => ({ text: t, pos: pick(['NN', 'VB', 'JJ', 'RB', 'NNP', 'IN', 'DT'], rand) }))
        };
        idx++;
        return JSON.stringify(entry) + '\n';
    });

    // Entity dictionary
    const entityDict = { persons: [], organizations: [], locations: [], products: [], events: [] };
    for (let i = 0; i < 30000; i++) {
        entityDict.persons.push({ name: `${pick(FIRST_NAMES, rand)} ${pick(LAST_NAMES, rand)}`, aliases: [`${pick(FIRST_NAMES, rand)}`, `Dr. ${pick(LAST_NAMES, rand)}`], frequency: Math.floor(rand() * 10000) });
    }
    for (let i = 0; i < 10000; i++) {
        entityDict.organizations.push({ name: `${pick(ADJS, rand)} ${pick(NOUNS, rand)} ${pick(['Inc', 'Corp', 'Labs', 'AI', 'Tech', 'Systems'], rand)}`.replace(/\b\w/g, l => l.toUpperCase()), type: pick(['company', 'nonprofit', 'government', 'university'], rand), founded: 1900 + Math.floor(rand() * 125) });
    }
    for (let i = 0; i < 5000; i++) {
        entityDict.locations.push({ name: `${pick(ADJS, rand)} ${pick(NOUNS, rand)}`.replace(/\b\w/g, l => l.toUpperCase()), type: pick(['city', 'country', 'region', 'landmark'], rand), pop: Math.floor(rand() * 10000000) });
    }
    writeData(path.join(DATA_DIR, 'ner', 'entity_dictionary.json'), JSON.stringify(entityDict, null, 1));
}

// ─── 8. Dictionary (~50MB) ───────────────────────────────────────────────────

async function generateDictionary() {
    console.log('\n📦 Generating dictionary...');
    const rand = rng(111);

    const dict = {};
    const allWords = [...new Set([...NOUNS, ...VERBS, ...ADJS, ...ADVS])];
    for (const word of allWords) {
        dict[word] = {
            definitions: Array.from({ length: Math.floor(rand() * 3) + 1 }, () => generateSentence(rand)),
            pos: pick(['noun', 'verb', 'adjective', 'adverb'], rand),
            synonyms: Array.from({ length: Math.floor(rand() * 5) + 1 }, () => pick(allWords, rand)),
            antonyms: Array.from({ length: Math.floor(rand() * 3) }, () => pick(allWords, rand)),
            frequency: Math.floor(rand() * 100000),
            syllables: Math.floor(rand() * 4) + 1,
            phonetic: `/ˈ${word.slice(0, 3)}.${word.slice(3)}/`,
            examples: Array.from({ length: Math.floor(rand() * 3) + 1 }, () => generateSentence(rand)),
            etymology: `From ${pick(['Latin', 'Greek', 'Old English', 'French', 'German', 'Norse'], rand)} root "${word.slice(0, 4)}-"`,
            relatedWords: Array.from({ length: Math.floor(rand() * 5) + 1 }, () => pick(allWords, rand))
        };
    }
    // Expand with generated words
    for (let i = 0; i < 50000; i++) {
        const word = `${pick(ADJS, rand).slice(0, 4)}${pick(NOUNS, rand).slice(0, 5)}`;
        dict[word + i] = {
            definitions: [generateSentence(rand)],
            pos: pick(['noun', 'verb', 'adjective', 'adverb'], rand),
            synonyms: Array.from({ length: 3 }, () => pick(allWords, rand)),
            frequency: Math.floor(rand() * 1000),
            syllables: Math.floor(rand() * 4) + 1,
        };
    }
    writeData(path.join(DATA_DIR, 'dictionary', 'english_dictionary.json'), JSON.stringify(dict, null, 1));

    // Spell-check word list
    const wordList = Object.keys(dict).concat(allWords);
    for (let i = 0; i < 100000; i++) {
        wordList.push(crypto.randomBytes(Math.floor(rand() * 8) + 3).toString('hex').slice(0, Math.floor(rand() * 10) + 3));
    }
    writeData(path.join(DATA_DIR, 'dictionary', 'wordlist.json'), JSON.stringify(wordList));
}

// ─── 9. Recommendations (~50MB) ──────────────────────────────────────────────

async function generateRecommendations() {
    console.log('\n📦 Generating recommendation datasets...');
    const rand = rng(222);

    // User-item matrix
    let idx = 0;
    const MAX = 200000;
    const filePath = path.join(DATA_DIR, 'recommendations', 'user_interactions.jsonl');
    await writeStream(filePath, () => {
        if (idx >= MAX) return null;
        const entry = {
            userId: `user_${Math.floor(rand() * 10000)}`,
            itemId: `item_${Math.floor(rand() * 50000)}`,
            rating: Math.floor(rand() * 5) + 1,
            timestamp: Date.now() - Math.floor(rand() * 1e10),
            category: pick(TOPICS_LIST, rand),
            features: Object.fromEntries(Array.from({ length: 8 }, (_, i) => [`f${i}`, parseFloat(rand().toFixed(4))])),
            context: { device: pick(['mobile', 'desktop', 'tablet'], rand), time: pick(['morning', 'afternoon', 'evening', 'night'], rand) }
        };
        idx++;
        return JSON.stringify(entry) + '\n';
    });

    // Item catalog
    const items = [];
    for (let i = 0; i < 50000; i++) {
        items.push({
            id: `item_${i}`,
            title: `${pick(ADJS, rand)} ${pick(NOUNS, rand)} ${pick(NOUNS, rand)}`.replace(/\b\w/g, l => l.toUpperCase()),
            category: pick(TOPICS_LIST, rand),
            tags: Array.from({ length: Math.floor(rand() * 5) + 2 }, () => pick(NOUNS.concat(ADJS), rand)),
            features: Object.fromEntries(Array.from({ length: 20 }, (_, j) => [`f${j}`, parseFloat(rand().toFixed(4))])),
            popularity: parseFloat(rand().toFixed(4)),
            avgRating: parseFloat((1 + rand() * 4).toFixed(2)),
            ratingCount: Math.floor(rand() * 5000)
        });
    }
    writeData(path.join(DATA_DIR, 'recommendations', 'item_catalog.json'), JSON.stringify(items, null, 1));
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  🧠 NeuralForge — Dataset Generator');
    console.log('  Generating ~1GB of training data...');
    console.log('═══════════════════════════════════════════════════');

    const start = Date.now();
    ensureDirs();

    await generateEmbeddings();
    await generateCorpus();
    await generateSentimentData();
    await generateClassificationData();
    await generateCodeSamples();
    await generateQAData();
    await generateNERData();
    await generateDictionary();
    await generateRecommendations();

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ Done! Generated ${formatBytes(totalBytes)}`);
    console.log(`  ⏱  Time: ${elapsed}s`);
    console.log(`  📁 Location: ${DATA_DIR}`);
    console.log('═══════════════════════════════════════════════════');
}

main().catch(console.error);
