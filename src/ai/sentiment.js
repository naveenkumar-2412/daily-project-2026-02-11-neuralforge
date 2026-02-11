// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Sentiment Analysis Engine
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const POSITIVE_WORDS = new Map([
    ['love', 3], ['excellent', 3], ['amazing', 3], ['wonderful', 3], ['fantastic', 3],
    ['outstanding', 3], ['brilliant', 3], ['superb', 3], ['magnificent', 3], ['perfect', 3],
    ['good', 2], ['great', 2], ['nice', 2], ['happy', 2], ['pleased', 2],
    ['glad', 2], ['enjoy', 2], ['beautiful', 2], ['awesome', 2], ['impressive', 2],
    ['delightful', 2], ['splendid', 2], ['terrific', 2], ['fabulous', 2], ['marvelous', 2],
    ['ok', 1], ['fine', 1], ['decent', 1], ['satisfactory', 1], ['adequate', 1],
    ['like', 1], ['appreciate', 2], ['admire', 2], ['adore', 3], ['cherish', 3],
    ['grateful', 2], ['thankful', 2], ['blessed', 2], ['fortunate', 2], ['lucky', 1],
    ['excited', 2], ['thrilled', 3], ['ecstatic', 3], ['elated', 3], ['overjoyed', 3],
    ['peaceful', 2], ['calm', 1], ['serene', 2], ['tranquil', 2], ['relaxed', 1],
    ['confident', 2], ['strong', 1], ['brave', 2], ['courageous', 2], ['bold', 1],
    ['innovative', 2], ['creative', 2], ['inspired', 2], ['motivated', 2], ['determined', 2],
    ['succeed', 2], ['success', 2], ['achieve', 2], ['accomplish', 2], ['triumph', 3],
    ['win', 2], ['victory', 2], ['champion', 2], ['best', 2], ['top', 1],
    ['improve', 1], ['progress', 1], ['advance', 1], ['grow', 1], ['thrive', 2],
    ['helpful', 2], ['kind', 2], ['generous', 2], ['compassionate', 2], ['caring', 2],
    ['warm', 1], ['friendly', 2], ['welcoming', 2], ['supportive', 2], ['encouraging', 2],
    ['fun', 2], ['joyful', 2], ['playful', 1], ['cheerful', 2], ['lively', 2],
    ['bright', 1], ['radiant', 2], ['glowing', 2], ['shining', 2], ['sparkling', 2],
    ['fresh', 1], ['clean', 1], ['pure', 2], ['genuine', 2], ['authentic', 2],
    ['recommend', 2], ['praise', 2], ['honor', 2], ['respect', 2], ['trust', 2],
    ['hope', 1], ['optimistic', 2], ['positive', 2], ['upbeat', 2], ['enthusiastic', 2]
]);

const NEGATIVE_WORDS = new Map([
    ['hate', -3], ['terrible', -3], ['horrible', -3], ['awful', -3], ['disgusting', -3],
    ['dreadful', -3], ['atrocious', -3], ['abysmal', -3], ['horrendous', -3], ['appalling', -3],
    ['bad', -2], ['poor', -2], ['sad', -2], ['angry', -2], ['annoyed', -2],
    ['upset', -2], ['disappointed', -2], ['frustrated', -2], ['irritated', -2], ['displeased', -2],
    ['ugly', -2], ['boring', -2], ['dull', -2], ['mediocre', -1], ['average', -1],
    ['fail', -2], ['failure', -2], ['disaster', -3], ['catastrophe', -3], ['crisis', -2],
    ['worst', -3], ['worse', -2], ['problem', -1], ['issue', -1], ['trouble', -2],
    ['broken', -2], ['damaged', -2], ['ruined', -3], ['destroyed', -3], ['wrecked', -3],
    ['fear', -2], ['afraid', -2], ['scared', -2], ['terrified', -3], ['horrified', -3],
    ['anxious', -2], ['worried', -2], ['nervous', -1], ['tense', -1], ['stressed', -2],
    ['lonely', -2], ['isolated', -2], ['abandoned', -3], ['rejected', -2], ['excluded', -2],
    ['pain', -2], ['hurt', -2], ['suffer', -3], ['agony', -3], ['torment', -3],
    ['weak', -1], ['helpless', -2], ['powerless', -2], ['vulnerable', -1], ['fragile', -1],
    ['stupid', -2], ['idiotic', -3], ['foolish', -2], ['ignorant', -2], ['dumb', -2],
    ['evil', -3], ['wicked', -3], ['cruel', -3], ['malicious', -3], ['vicious', -3],
    ['lie', -2], ['cheat', -2], ['steal', -2], ['betray', -3], ['deceive', -2],
    ['waste', -2], ['useless', -2], ['pointless', -2], ['meaningless', -2], ['worthless', -3],
    ['nasty', -2], ['gross', -2], ['repulsive', -3], ['revolting', -3],
    ['regret', -2], ['sorry', -1], ['apologize', -1], ['mistake', -1], ['error', -1],
    ['complain', -1], ['criticize', -2], ['blame', -2], ['accuse', -2], ['condemn', -3],
    ['slow', -1], ['difficult', -1], ['hard', -1], ['complex', -1], ['confusing', -1],
    ['never', -1], ['nothing', -1], ['nobody', -1], ['nowhere', -1], ['neither', -1]
]);

const INTENSIFIERS = new Map([
    ['very', 1.5], ['extremely', 2.0], ['incredibly', 2.0], ['absolutely', 2.0],
    ['totally', 1.8], ['completely', 1.8], ['utterly', 2.0], ['thoroughly', 1.5],
    ['really', 1.5], ['truly', 1.5], ['deeply', 1.5], ['highly', 1.5],
    ['super', 1.8], ['mega', 2.0], ['ultra', 2.0], ['so', 1.3],
    ['quite', 1.3], ['rather', 1.2], ['fairly', 1.1], ['pretty', 1.3],
    ['somewhat', 0.8], ['slightly', 0.5], ['barely', 0.3], ['hardly', 0.3]
]);

const NEGATORS = new Set([
    'not', "n't", 'no', 'never', 'neither', 'nor', 'none', 'nothing',
    'nowhere', 'nobody', 'hardly', 'barely', 'scarcely', 'seldom',
    'without', 'lack', "doesn't", "don't", "didn't", "won't", "wouldn't",
    "couldn't", "shouldn't", "isn't", "aren't", "wasn't", "weren't"
]);

const EMOTION_LEXICON = {
    joy: ['happy', 'joy', 'love', 'wonderful', 'amazing', 'great', 'excellent', 'delighted', 'glad', 'cheerful', 'pleased', 'excited', 'thrilled', 'ecstatic', 'blissful', 'euphoric', 'elated', 'jubilant', 'merry', 'celebrate', 'laugh', 'smile', 'fun', 'enjoy', 'paradise', 'perfect', 'beautiful', 'brilliant', 'fantastic', 'awesome', 'superb'],
    sadness: ['sad', 'unhappy', 'depressed', 'miserable', 'gloomy', 'melancholy', 'sorrow', 'grief', 'mourning', 'heartbroken', 'lonely', 'cry', 'tears', 'weep', 'sob', 'despair', 'hopeless', 'tragic', 'loss', 'miss', 'regret', 'disappointed', 'dejected', 'downcast', 'blue', 'painful', 'hurt', 'suffering', 'anguish', 'woe'],
    anger: ['angry', 'furious', 'rage', 'mad', 'irritated', 'annoyed', 'frustrated', 'hostile', 'aggressive', 'outraged', 'livid', 'enraged', 'infuriated', 'irate', 'resentful', 'bitter', 'hate', 'despise', 'loathe', 'abhor', 'detest', 'scorn', 'fight', 'attack', 'destroy', 'explode', 'wrath'],
    fear: ['afraid', 'scared', 'terrified', 'frightened', 'anxious', 'worried', 'nervous', 'panic', 'dread', 'horror', 'phobia', 'alarmed', 'startled', 'shocked', 'uneasy', 'tense', 'paranoid', 'threat', 'danger', 'risky', 'vulnerable', 'helpless', 'trapped', 'nightmare', 'creepy', 'eerie', 'spooky', 'sinister', 'ominous'],
    surprise: ['surprised', 'amazed', 'astonished', 'stunned', 'shocked', 'unexpected', 'incredible', 'unbelievable', 'remarkable', 'extraordinary', 'wow', 'whoa', 'omg', 'sudden', 'unforeseen', 'unpredictable', 'awe', 'wonder', 'miracle', 'phenomenon', 'speechless', 'breathtaking'],
    disgust: ['disgusting', 'gross', 'revolting', 'repulsive', 'nasty', 'sickening', 'vile', 'hideous', 'foul', 'loathsome', 'nauseating', 'abhorrent', 'offensive', 'distasteful', 'unpleasant', 'yuck', 'repugnant', 'contaminated', 'corrupt', 'rotten', 'putrid', 'filthy', 'dirty', 'toxic', 'polluted', 'tainted']
};

class SentimentAnalyzer {
    constructor() { this.analysisHistory = []; }

    analyze(text) {
        if (!text || typeof text !== 'string') return { error: 'Please provide valid text to analyze' };
        const startTime = Date.now();
        const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
        const words = this._tokenize(text);
        const sentimentResult = this._calcSentiment(words);
        const emotions = this._detectEmotions(words);
        const wordAnalysis = this._analyzeWords(words);
        const sentenceAnalysis = sentences.map(s => ({ text: s, sentiment: this._calcSentiment(this._tokenize(s)) }));
        const subjectivity = this._calcSubjectivity(words);
        const result = {
            text, overall: { score: sentimentResult.score, normalizedScore: sentimentResult.normalizedScore, label: sentimentResult.label, confidence: sentimentResult.confidence },
            emotions, dominantEmotion: this._getDominantEmotion(emotions),
            wordAnalysis, sentenceAnalysis, subjectivity,
            statistics: { wordCount: words.length, sentenceCount: sentences.length, positiveWords: wordAnalysis.filter(w => w.score > 0).length, negativeWords: wordAnalysis.filter(w => w.score < 0).length, neutralWords: wordAnalysis.filter(w => w.score === 0).length },
            processingTimeMs: Date.now() - startTime
        };
        this.analysisHistory.push({ text: text.substring(0, 100), score: sentimentResult.normalizedScore, label: sentimentResult.label, timestamp: Date.now() });
        return result;
    }

    _tokenize(text) { return text.toLowerCase().replace(/[^\w\s'-]/g, ' ').split(/\s+/).filter(w => w.length > 0); }

    _calcSentiment(words) {
        let totalScore = 0, wordCount = 0, maxPossible = 0;
        for (let i = 0; i < words.length; i++) {
            const word = words[i]; let score = 0;
            if (POSITIVE_WORDS.has(word)) score = POSITIVE_WORDS.get(word);
            else if (NEGATIVE_WORDS.has(word)) score = NEGATIVE_WORDS.get(word);
            if (score !== 0) {
                if (this._isNegated(words, i)) score = -score * 0.75;
                const intensifier = this._getIntensifier(words, i);
                if (intensifier !== 1) score *= intensifier;
                totalScore += score; wordCount++; maxPossible += 3;
            }
        }
        const norm = maxPossible > 0 ? Math.max(-1, Math.min(1, totalScore / maxPossible)) : 0;
        const confidence = Math.min(1, wordCount / Math.max(1, words.length / 3));
        let label;
        if (norm > 0.3) label = 'very positive'; else if (norm > 0.1) label = 'positive';
        else if (norm > -0.1) label = 'neutral'; else if (norm > -0.3) label = 'negative';
        else label = 'very negative';
        return { score: Math.round(totalScore * 100) / 100, normalizedScore: Math.round(norm * 1000) / 1000, label, confidence: Math.round(confidence * 100) / 100 };
    }

    _isNegated(words, index) {
        for (let i = Math.max(0, index - 3); i < index; i++) {
            if (NEGATORS.has(words[i]) || words[i].endsWith("n't")) return true;
        }
        return false;
    }

    _getIntensifier(words, index) {
        for (let i = Math.max(0, index - 2); i < index; i++) {
            if (INTENSIFIERS.has(words[i])) return INTENSIFIERS.get(words[i]);
        }
        return 1;
    }

    _detectEmotions(words) {
        const emotions = {};
        for (const [emotion, lexicon] of Object.entries(EMOTION_LEXICON)) {
            let count = 0;
            for (const word of words) { if (lexicon.includes(word)) count++; }
            emotions[emotion] = Math.min(1, count / Math.max(1, words.length / 5));
        }
        const maxVal = Math.max(...Object.values(emotions), 0.01);
        for (const e of Object.keys(emotions)) emotions[e] = Math.round((emotions[e] / maxVal) * 100) / 100;
        return emotions;
    }

    _getDominantEmotion(emotions) {
        let dominant = 'neutral', max = 0;
        for (const [e, s] of Object.entries(emotions)) { if (s > max) { max = s; dominant = e; } }
        return { emotion: dominant, score: max };
    }

    _analyzeWords(words) {
        return words.map((word, i) => {
            let score = 0, category = 'neutral';
            if (POSITIVE_WORDS.has(word)) { score = POSITIVE_WORDS.get(word); category = 'positive'; }
            else if (NEGATIVE_WORDS.has(word)) { score = NEGATIVE_WORDS.get(word); category = 'negative'; }
            if (score !== 0 && this._isNegated(words, i)) { score = -score * 0.75; category = score > 0 ? 'positive' : 'negative'; }
            return { word, score, category };
        });
    }

    _calcSubjectivity(words) {
        let count = 0;
        for (const word of words) {
            if (POSITIVE_WORDS.has(word) || NEGATIVE_WORDS.has(word)) count++;
            for (const lexicon of Object.values(EMOTION_LEXICON)) { if (lexicon.includes(word)) { count++; break; } }
        }
        const score = Math.min(1, count / Math.max(1, words.length / 3));
        return { score: Math.round(score * 100) / 100, label: score > 0.6 ? 'subjective' : score > 0.3 ? 'mixed' : 'objective' };
    }

    getHistory() { return this.analysisHistory.slice(-50); }
}

module.exports = SentimentAnalyzer;
