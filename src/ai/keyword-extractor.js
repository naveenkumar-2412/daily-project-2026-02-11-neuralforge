// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — TF-IDF Keyword Extraction Engine
// Extracts key phrases using TF-IDF scoring, n-gram analysis, and TextRank
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was',
    'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may',
    'might', 'can', 'could', 'must', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that', 'these', 'those',
    'i', 'me', 'my', 'mine', 'we', 'us', 'our', 'ours', 'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers',
    'they', 'them', 'their', 'theirs', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'all',
    'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'just', 'because', 'if', 'then', 'else', 'about', 'up', 'out', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'between', 'under', 'over', 'again', 'further', 'once', 'here',
    'there', 'any', 'also', 'much', 'many', 'well', 'still', 'even', 'back', 'also', 'however', 'although', 'though',
]);

class KeywordExtractor {
    constructor() {
        this.idfCache = new Map();
    }

    extract(text, options = {}) {
        const startTime = Date.now();
        const { maxKeywords = 10, method = 'tfidf', ngramRange = [1, 3] } = options;

        const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
        const words = this._tokenize(text);

        let keywords;
        switch (method) {
            case 'tfidf': keywords = this._tfidfExtract(words, sentences, maxKeywords, ngramRange); break;
            case 'textrank': keywords = this._textRankExtract(words, maxKeywords); break;
            case 'frequency': keywords = this._frequencyExtract(words, maxKeywords); break;
            default: keywords = this._tfidfExtract(words, sentences, maxKeywords, ngramRange);
        }

        const categories = this._categorizeKeywords(keywords);

        return {
            text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
            keywords,
            keywordCount: keywords.length,
            categories,
            wordCount: words.length,
            uniqueWords: new Set(words).size,
            method,
            processingTimeMs: Date.now() - startTime
        };
    }

    _tokenize(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9\s'-]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 1 && !STOP_WORDS.has(w));
    }

    _tfidfExtract(words, sentences, max, ngramRange) {
        const tf = new Map();
        const docFreq = new Map();

        // Calculate TF
        for (const w of words) {
            tf.set(w, (tf.get(w) || 0) + 1);
        }

        // Calculate document frequency (treat each sentence as a document)
        for (const sent of sentences) {
            const sentWords = new Set(this._tokenize(sent));
            for (const w of sentWords) {
                docFreq.set(w, (docFreq.get(w) || 0) + 1);
            }
        }

        const numDocs = sentences.length;
        const scores = new Map();

        // Unigram TF-IDF
        for (const [word, count] of tf) {
            const tfScore = count / words.length;
            const idf = Math.log(numDocs / (1 + (docFreq.get(word) || 0)));
            scores.set(word, tfScore * Math.max(0.1, idf));
        }

        // N-gram scoring
        if (ngramRange[1] >= 2) {
            const ngrams = this._getNgrams(words, ngramRange[0], ngramRange[1]);
            for (const [ngram, count] of ngrams) {
                const boost = ngram.split(' ').length * 0.5;
                const tfScore = count / words.length;
                scores.set(ngram, tfScore * boost * 2);
            }
        }

        return Array.from(scores.entries())
            .map(([keyword, score]) => ({
                keyword,
                score: parseFloat(score.toFixed(6)),
                frequency: tf.get(keyword) || 1,
                type: keyword.includes(' ') ? `${keyword.split(' ').length}-gram` : 'unigram'
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, max);
    }

    _textRankExtract(words, max) {
        // Build co-occurrence graph
        const windowSize = 4;
        const graph = new Map();
        const allWords = [...new Set(words)];

        for (const w of allWords) graph.set(w, new Map());

        for (let i = 0; i < words.length; i++) {
            for (let j = i + 1; j < Math.min(i + windowSize, words.length); j++) {
                const a = words[i], b = words[j];
                if (a === b) continue;
                graph.get(a).set(b, (graph.get(a).get(b) || 0) + 1);
                graph.get(b).set(a, (graph.get(b).get(a) || 0) + 1);
            }
        }

        // PageRank-style iteration
        const scores = new Map();
        const d = 0.85;
        for (const w of allWords) scores.set(w, 1.0);

        for (let iter = 0; iter < 30; iter++) {
            for (const w of allWords) {
                let sum = 0;
                const neighbors = graph.get(w);
                for (const [neighbor, weight] of neighbors) {
                    const neighborTotal = Array.from(graph.get(neighbor).values()).reduce((a, b) => a + b, 0);
                    if (neighborTotal > 0) sum += (weight / neighborTotal) * scores.get(neighbor);
                }
                scores.set(w, (1 - d) + d * sum);
            }
        }

        return Array.from(scores.entries())
            .map(([keyword, score]) => ({
                keyword, score: parseFloat(score.toFixed(6)),
                frequency: words.filter(w => w === keyword).length,
                type: 'textrank'
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, max);
    }

    _frequencyExtract(words, max) {
        const freq = new Map();
        for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);

        return Array.from(freq.entries())
            .map(([keyword, count]) => ({
                keyword, score: parseFloat((count / words.length).toFixed(6)),
                frequency: count, type: 'frequency'
            }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, max);
    }

    _getNgrams(words, minN, maxN) {
        const ngrams = new Map();
        for (let n = minN; n <= maxN; n++) {
            if (n < 2) continue;
            for (let i = 0; i <= words.length - n; i++) {
                const gram = words.slice(i, i + n).join(' ');
                ngrams.set(gram, (ngrams.get(gram) || 0) + 1);
            }
        }
        // Only keep ngrams that appear more than once
        for (const [k, v] of ngrams) { if (v < 2) ngrams.delete(k); }
        return ngrams;
    }

    _categorizeKeywords(keywords) {
        const techWords = new Set(['algorithm', 'data', 'software', 'code', 'api', 'network', 'system', 'computer', 'program', 'model', 'learning', 'neural', 'ai', 'machine', 'database', 'server', 'cloud', 'function', 'class', 'module']);
        const scienceWords = new Set(['quantum', 'physics', 'biology', 'chemistry', 'evolution', 'dna', 'atom', 'energy', 'space', 'universe', 'gene', 'cell', 'particle', 'experiment', 'theory', 'hypothesis']);
        const businessWords = new Set(['market', 'revenue', 'growth', 'strategy', 'customer', 'product', 'service', 'brand', 'sales', 'profit', 'investment', 'startup', 'enterprise', 'management', 'finance']);

        const cats = { technical: 0, science: 0, business: 0, general: 0 };
        for (const kw of keywords) {
            const w = kw.keyword.toLowerCase();
            if (techWords.has(w)) cats.technical++;
            else if (scienceWords.has(w)) cats.science++;
            else if (businessWords.has(w)) cats.business++;
            else cats.general++;
        }
        return cats;
    }

    getMethods() {
        return [
            { id: 'tfidf', name: 'TF-IDF', description: 'Term Frequency-Inverse Document Frequency with n-gram support' },
            { id: 'textrank', name: 'TextRank', description: 'Graph-based ranking inspired by PageRank algorithm' },
            { id: 'frequency', name: 'Frequency', description: 'Simple word frequency counting with stop word removal' }
        ];
    }
}

module.exports = KeywordExtractor;
