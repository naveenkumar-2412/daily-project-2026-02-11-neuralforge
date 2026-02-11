// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Text Summarizer Engine
// TF-IDF extractive summarization with keyword extraction
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have',
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
    'might', 'shall', 'can', 'need', 'must', 'ought', 'i', 'me', 'my', 'myself',
    'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'he',
    'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
    'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom',
    'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
    'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at',
    'by', 'for', 'with', 'about', 'against', 'between', 'through', 'during', 'before',
    'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off',
    'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
    'very', 'just', 'also', 'still', 'already', 'even', 'now'
]);

class Summarizer {
    constructor() { this.history = []; }

    summarize(text, options = {}) {
        if (!text || typeof text !== 'string' || text.trim().length < 50) {
            return { error: 'Please provide text with at least 50 characters.' };
        }
        const startTime = Date.now();
        const ratio = Math.max(0.1, Math.min(0.9, options.ratio || 0.3));
        const sentences = this._splitSentences(text);
        if (sentences.length < 3) return { error: 'Text must have at least 3 sentences.', sentences: sentences.length };

        const words = this._tokenize(text);
        const tfidf = this._computeTFIDF(sentences);
        const scores = this._scoreSentences(sentences, tfidf);
        const numSentences = Math.max(1, Math.round(sentences.length * ratio));
        const rankedIndices = scores.map((s, i) => ({ score: s, index: i }))
            .sort((a, b) => b.score - a.score)
            .slice(0, numSentences)
            .sort((a, b) => a.index - b.index);
        const summary = rankedIndices.map(item => sentences[item.index]).join('. ') + '.';
        const keywords = this._extractKeywords(words, tfidf, 15);
        const result = {
            originalText: text, summary, keywords,
            sentences: sentences.map((s, i) => ({
                text: s, score: Math.round(scores[i] * 1000) / 1000,
                isSelected: rankedIndices.some(r => r.index === i)
            })),
            statistics: {
                originalLength: text.length, summaryLength: summary.length,
                compressionRatio: Math.round((1 - summary.length / text.length) * 100),
                originalSentences: sentences.length, summarySentences: numSentences,
                originalWords: words.length,
                summaryWords: summary.split(/\s+/).length
            },
            processingTimeMs: Date.now() - startTime
        };
        this.history.push({ textPreview: text.substring(0, 80), summaryPreview: summary.substring(0, 80), compressionRatio: result.statistics.compressionRatio, timestamp: Date.now() });
        return result;
    }

    _splitSentences(text) {
        return text.replace(/([.!?])\s+/g, '$1|').split('|')
            .map(s => s.trim()).filter(s => s.length > 10);
    }

    _tokenize(text) {
        return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
            .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    }

    _computeTFIDF(sentences) {
        const tokenizedSentences = sentences.map(s => this._tokenize(s));
        const allWords = new Set(tokenizedSentences.flat());
        const idf = {};
        for (const word of allWords) {
            const docCount = tokenizedSentences.filter(s => s.includes(word)).length;
            idf[word] = Math.log(sentences.length / (1 + docCount)) + 1;
        }
        const tfidf = tokenizedSentences.map(tokens => {
            const tf = {}; const len = tokens.length || 1;
            for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
            const scores = {};
            for (const [word, count] of Object.entries(tf)) {
                scores[word] = (count / len) * (idf[word] || 1);
            }
            return scores;
        });
        return { sentenceScores: tfidf, idf };
    }

    _scoreSentences(sentences, tfidf) {
        return tfidf.sentenceScores.map((scores, i) => {
            const tfidfScore = Object.values(scores).reduce((a, b) => a + b, 0);
            const positionScore = i === 0 ? 1.5 : i < sentences.length * 0.2 ? 1.2 : i > sentences.length * 0.8 ? 1.1 : 1.0;
            const lengthScore = Math.min(1.0, sentences[i].split(/\s+/).length / 20);
            return tfidfScore * positionScore * lengthScore;
        });
    }

    _extractKeywords(words, tfidf, topN) {
        const wordScores = {};
        for (const sentScores of tfidf.sentenceScores) {
            for (const [word, score] of Object.entries(sentScores)) {
                wordScores[word] = (wordScores[word] || 0) + score;
            }
        }
        return Object.entries(wordScores)
            .sort((a, b) => b[1] - a[1]).slice(0, topN)
            .map(([word, score]) => ({ word, score: Math.round(score * 100) / 100 }));
    }

    getHistory() { return this.history.slice(-50); }
}

module.exports = Summarizer;
