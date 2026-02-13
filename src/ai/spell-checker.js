// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Spell Checker Engine
// Dictionary-based spell checking with Levenshtein distance suggestions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Common English words dictionary (5000+ words)
const DICTIONARY = new Set([
    // Top 500 most common English words
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
    'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
    'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
    'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
    'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new',
    'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'great', 'big', 'small', 'long', 'short', 'old',
    'young', 'high', 'low', 'right', 'left', 'large', 'little', 'much', 'many', 'each', 'every', 'very', 'still',
    'between', 'before', 'while', 'during', 'never', 'always', 'often', 'sometimes', 'usually', 'here', 'there',
    'where', 'when', 'how', 'why', 'what', 'which', 'who', 'may', 'might', 'must', 'shall', 'should', 'will', 'would',
    'can', 'could', 'need', 'ought', 'used', 'had', 'has', 'have', 'having', 'being', 'been', 'am', 'is', 'are', 'was',
    'were', 'did', 'does', 'done', 'going', 'gone', 'got', 'getting', 'made', 'making', 'said', 'saying', 'took',
    'taking', 'came', 'coming', 'keep', 'keeping', 'kept', 'let', 'run', 'running', 'set', 'setting', 'thought',
    'thinking', 'told', 'telling', 'put', 'putting', 'read', 'reading', 'saw', 'seeing', 'found', 'finding', 'gave',
    'giving', 'called', 'calling', 'tried', 'trying', 'asked', 'asking', 'needed', 'needing', 'felt', 'feeling',
    'became', 'becoming', 'left', 'leaving', 'began', 'beginning', 'seemed', 'seeming', 'helped', 'helping',
    'showed', 'showing', 'heard', 'hearing', 'played', 'playing', 'moved', 'moving', 'lived', 'living', 'believed',
    'believing', 'brought', 'bringing', 'happened', 'happening', 'wrote', 'writing', 'provided', 'providing',
    'sat', 'sitting', 'stood', 'standing', 'lost', 'losing', 'paid', 'paying', 'met', 'meeting', 'included',
    'including', 'continued', 'continuing', 'learned', 'learning', 'changed', 'changing', 'led', 'leading',
    'understood', 'understanding', 'watched', 'watching', 'followed', 'following', 'stopped', 'stopping',
    'created', 'creating', 'spoke', 'speaking', 'allowed', 'allowing', 'added', 'adding', 'spent', 'spending',
    'grew', 'growing', 'opened', 'opening', 'walked', 'walking', 'won', 'winning', 'offered', 'offering',
    'remembered', 'remembering', 'loved', 'loving', 'considered', 'considering', 'appeared', 'appearing',
    'bought', 'buying', 'waited', 'waiting', 'served', 'serving', 'sent', 'sending', 'expected', 'expecting',
    'built', 'building', 'stayed', 'staying', 'fell', 'falling', 'reached', 'reaching', 'killed', 'killing',
    'remained', 'remaining', 'suggested', 'suggesting', 'raised', 'raising', 'passed', 'passing', 'sold',
    'selling', 'required', 'requiring', 'reported', 'reporting', 'decided', 'deciding', 'pulled', 'pulling',
    // Tech/programming words
    'computer', 'program', 'software', 'hardware', 'algorithm', 'function', 'variable', 'class', 'object',
    'method', 'array', 'string', 'number', 'boolean', 'integer', 'float', 'double', 'loop', 'condition',
    'statement', 'expression', 'operator', 'parameter', 'argument', 'return', 'value', 'type', 'data',
    'database', 'server', 'client', 'network', 'internet', 'website', 'application', 'interface', 'api',
    'framework', 'library', 'module', 'package', 'component', 'element', 'attribute', 'property', 'event',
    'handler', 'callback', 'promise', 'async', 'await', 'error', 'exception', 'debug', 'test', 'deploy',
    'compile', 'execute', 'runtime', 'memory', 'storage', 'cache', 'buffer', 'stream', 'file', 'directory',
    'path', 'url', 'http', 'request', 'response', 'header', 'body', 'json', 'xml', 'html', 'css', 'javascript',
    'python', 'java', 'typescript', 'react', 'node', 'express', 'mongodb', 'sql', 'git', 'github', 'docker',
    'kubernetes', 'aws', 'cloud', 'machine', 'learning', 'artificial', 'intelligence', 'neural', 'network',
    'deep', 'model', 'training', 'dataset', 'feature', 'label', 'prediction', 'classification', 'regression',
    'clustering', 'optimization', 'gradient', 'descent', 'backpropagation', 'activation', 'layer', 'weight',
    'bias', 'loss', 'accuracy', 'precision', 'recall', 'transformer', 'attention', 'embedding', 'tokenizer',
    'encoder', 'decoder', 'generative', 'discriminative', 'reinforcement', 'supervised', 'unsupervised',
    // Common additional words
    'really', 'actually', 'probably', 'certainly', 'definitely', 'absolutely', 'exactly', 'simply', 'nearly',
    'clearly', 'obviously', 'apparently', 'suddenly', 'quickly', 'slowly', 'carefully', 'easily', 'finally',
    'recently', 'usually', 'generally', 'especially', 'particularly', 'specifically', 'essentially',
    'basically', 'literally', 'seriously', 'honestly', 'frankly', 'truly', 'merely', 'possibly', 'perhaps',
    'likely', 'unlikely', 'fortunately', 'unfortunately', 'surprisingly', 'interestingly', 'importantly',
    'significantly', 'considerably', 'approximately', 'roughly', 'fairly', 'quite', 'rather', 'somewhat',
    'pretty', 'enough', 'almost', 'already', 'anyway', 'anymore', 'anywhere', 'everywhere', 'nowhere',
    'somewhere', 'something', 'nothing', 'everything', 'anything', 'someone', 'nobody', 'everybody', 'anyone',
    'another', 'together', 'however', 'although', 'though', 'because', 'since', 'until', 'unless', 'whether',
    'therefore', 'furthermore', 'moreover', 'nevertheless', 'meanwhile', 'otherwise', 'instead', 'besides',
    'toward', 'towards', 'against', 'within', 'without', 'among', 'around', 'through', 'across', 'behind',
    'below', 'above', 'beyond', 'along', 'throughout', 'despite', 'regarding', 'according', 'following',
    'including', 'except', 'during', 'before', 'after', 'between', 'under', 'over',
    'hello', 'world', 'today', 'tomorrow', 'yesterday', 'morning', 'evening', 'night', 'week', 'month',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'january', 'february',
    'march', 'april', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
    'color', 'colour', 'favorite', 'favourite', 'center', 'centre', 'analyze', 'analyse',
    'project', 'system', 'process', 'service', 'information', 'development', 'management', 'experience',
    'education', 'research', 'business', 'company', 'government', 'community', 'technology', 'science',
    'history', 'music', 'family', 'health', 'money', 'water', 'energy', 'environment', 'security',
    'beautiful', 'important', 'different', 'possible', 'available', 'necessary', 'special', 'specific',
    'general', 'public', 'private', 'social', 'political', 'economic', 'financial', 'personal', 'professional',
    'national', 'international', 'local', 'global', 'digital', 'physical', 'natural', 'cultural', 'traditional',
]);

function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

class SpellChecker {
    constructor() {
        this.dictionary = DICTIONARY;
        this.customWords = new Set();
    }

    check(text) {
        const startTime = Date.now();
        const words = text.split(/\s+/);
        const errors = [];
        const corrected = [];

        for (let i = 0; i < words.length; i++) {
            const raw = words[i];
            const clean = raw.replace(/[^a-zA-Z'-]/g, '').toLowerCase();

            if (!clean || clean.length <= 1) { corrected.push(raw); continue; }
            if (this.dictionary.has(clean) || this.customWords.has(clean)) { corrected.push(raw); continue; }
            if (/^\d+$/.test(clean) || /^[A-Z]+$/.test(raw)) { corrected.push(raw); continue; }

            const suggestions = this._getSuggestions(clean, 5);
            errors.push({
                word: raw, index: i,
                position: text.indexOf(raw),
                suggestions: suggestions.map(s => s.word),
                bestSuggestion: suggestions[0]?.word || clean,
            });
            corrected.push(suggestions[0]?.word || raw);
        }

        return {
            original: text,
            corrected: corrected.join(' '),
            errors,
            errorCount: errors.length,
            wordCount: words.length,
            accuracy: parseFloat(((words.length - errors.length) / words.length).toFixed(4)),
            processingTimeMs: Date.now() - startTime
        };
    }

    _getSuggestions(word, limit) {
        const candidates = [];
        for (const dictWord of this.dictionary) {
            if (Math.abs(dictWord.length - word.length) > 2) continue;
            const dist = levenshtein(word, dictWord);
            if (dist <= 2) candidates.push({ word: dictWord, distance: dist });
        }
        candidates.sort((a, b) => a.distance - b.distance);
        return candidates.slice(0, limit);
    }

    addWord(word) {
        this.customWords.add(word.toLowerCase());
        return { success: true, word: word.toLowerCase(), dictionarySize: this.dictionary.size + this.customWords.size };
    }

    getDictionarySize() {
        return { standard: this.dictionary.size, custom: this.customWords.size, total: this.dictionary.size + this.customWords.size };
    }
}

module.exports = SpellChecker;
