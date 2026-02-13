// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Text Paraphraser Engine
// Rule-based paraphrasing with synonym replacement, structure transformation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SYNONYMS = {
    'good': ['great', 'excellent', 'fine', 'wonderful', 'superb', 'outstanding', 'splendid'],
    'bad': ['poor', 'terrible', 'awful', 'dreadful', 'unpleasant', 'inferior', 'subpar'],
    'big': ['large', 'huge', 'enormous', 'massive', 'vast', 'immense', 'substantial'],
    'small': ['tiny', 'little', 'miniature', 'compact', 'modest', 'petite', 'minute'],
    'fast': ['quick', 'rapid', 'swift', 'speedy', 'brisk', 'hasty', 'prompt'],
    'slow': ['gradual', 'leisurely', 'unhurried', 'sluggish', 'deliberate', 'measured'],
    'important': ['significant', 'crucial', 'vital', 'essential', 'critical', 'key', 'paramount'],
    'help': ['assist', 'aid', 'support', 'facilitate', 'contribute to', 'enable'],
    'make': ['create', 'produce', 'generate', 'construct', 'develop', 'build', 'craft'],
    'use': ['utilize', 'employ', 'apply', 'leverage', 'harness', 'implement'],
    'show': ['demonstrate', 'illustrate', 'display', 'reveal', 'indicate', 'exhibit'],
    'think': ['believe', 'consider', 'regard', 'perceive', 'reckon', 'suppose'],
    'get': ['obtain', 'acquire', 'receive', 'gain', 'secure', 'attain'],
    'give': ['provide', 'offer', 'supply', 'deliver', 'present', 'grant'],
    'say': ['state', 'declare', 'mention', 'express', 'assert', 'remark'],
    'go': ['proceed', 'advance', 'travel', 'move', 'head', 'venture'],
    'come': ['arrive', 'approach', 'reach', 'appear', 'emerge'],
    'take': ['seize', 'grab', 'capture', 'accept', 'adopt'],
    'look': ['observe', 'examine', 'inspect', 'gaze', 'glance', 'view'],
    'find': ['discover', 'locate', 'identify', 'detect', 'uncover'],
    'know': ['understand', 'comprehend', 'recognize', 'realize', 'grasp'],
    'want': ['desire', 'wish', 'crave', 'seek', 'aspire to'],
    'need': ['require', 'demand', 'necessitate', 'call for'],
    'try': ['attempt', 'endeavor', 'strive', 'aim to', 'seek to'],
    'start': ['begin', 'commence', 'initiate', 'launch', 'embark on'],
    'stop': ['cease', 'halt', 'discontinue', 'terminate', 'end'],
    'work': ['function', 'operate', 'perform', 'labor', 'toil'],
    'run': ['execute', 'operate', 'manage', 'conduct'],
    'change': ['alter', 'modify', 'transform', 'adjust', 'revise'],
    'move': ['relocate', 'shift', 'transfer', 'transport', 'migrate'],
    'keep': ['maintain', 'retain', 'preserve', 'sustain', 'hold'],
    'put': ['place', 'position', 'set', 'deposit', 'situate'],
    'end': ['conclude', 'finish', 'terminate', 'complete', 'wrap up'],
    'also': ['additionally', 'moreover', 'furthermore', 'besides', 'as well'],
    'very': ['extremely', 'highly', 'incredibly', 'remarkably', 'exceptionally'],
    'really': ['truly', 'genuinely', 'indeed', 'certainly', 'actually'],
    'often': ['frequently', 'regularly', 'commonly', 'routinely', 'repeatedly'],
    'always': ['consistently', 'perpetually', 'invariably', 'continuously'],
    'never': ['at no time', 'not ever', 'under no circumstances'],
    'many': ['numerous', 'several', 'various', 'multiple', 'countless'],
    'few': ['a handful of', 'several', 'a small number of', 'limited'],
    'new': ['novel', 'fresh', 'recent', 'modern', 'innovative', 'cutting-edge'],
    'old': ['ancient', 'aged', 'longstanding', 'established', 'vintage'],
    'hard': ['difficult', 'challenging', 'demanding', 'arduous', 'tough'],
    'easy': ['simple', 'straightforward', 'effortless', 'uncomplicated'],
    'happy': ['joyful', 'cheerful', 'delighted', 'pleased', 'content'],
    'sad': ['unhappy', 'sorrowful', 'melancholy', 'gloomy', 'downcast'],
    'beautiful': ['stunning', 'gorgeous', 'magnificent', 'exquisite', 'elegant'],
    'however': ['nevertheless', 'nonetheless', 'yet', 'still', 'on the other hand'],
    'because': ['since', 'as', 'due to the fact that', 'given that', 'owing to'],
    'but': ['however', 'yet', 'nevertheless', 'although', 'though'],
    'about': ['regarding', 'concerning', 'relating to', 'with respect to'],
};

const STRUCTURE_TRANSFORMS = [
    // Active to passive-like
    { pattern: /^(\w+)\s+(is|are|was|were)\s+(\w+)/, replace: (m, s, v, o) => `${o} ${v} what ${s} ${v}` },
    // "X can Y" -> "It is possible to Y with X"
    { pattern: /(\w+)\s+can\s+(\w+)\s+(.+)/, replace: (m, s, v, o) => `It is possible to ${v} ${o} using ${s}` },
    // "There are X" -> "X exist"
    { pattern: /there\s+(is|are)\s+(.+)/i, replace: (m, v, rest) => `${rest} exist${v === 'is' ? 's' : ''}` },
];

class Paraphraser {
    constructor() {
        this.synonyms = SYNONYMS;
    }

    paraphrase(text, options = {}) {
        const startTime = Date.now();
        const { intensity = 'medium', preserveLength = false } = options;
        const replacementRate = intensity === 'low' ? 0.2 : intensity === 'high' ? 0.7 : 0.4;

        const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
        const paraphrased = sentences.map(sent => this._paraphraseSentence(sent.trim(), replacementRate));

        const result = paraphrased.map(p => p.text).join(' ');
        const totalReplacements = paraphrased.reduce((sum, p) => sum + p.replacements.length, 0);
        const allReplacements = paraphrased.flatMap(p => p.replacements);

        // Calculate similarity
        const origWords = text.toLowerCase().split(/\s+/);
        const newWords = result.toLowerCase().split(/\s+/);
        const commonWords = origWords.filter(w => newWords.includes(w)).length;
        const similarity = commonWords / Math.max(origWords.length, newWords.length);

        return {
            original: text,
            paraphrased: result,
            replacements: allReplacements,
            replacementCount: totalReplacements,
            intensity,
            similarity: parseFloat(similarity.toFixed(4)),
            originalWordCount: origWords.length,
            paraphrasedWordCount: newWords.length,
            sentenceCount: sentences.length,
            processingTimeMs: Date.now() - startTime
        };
    }

    _paraphraseSentence(sentence, rate) {
        const words = sentence.split(/\s+/);
        const replacements = [];
        const newWords = [];

        for (let i = 0; i < words.length; i++) {
            const raw = words[i];
            const clean = raw.replace(/[^a-zA-Z]/g, '').toLowerCase();
            const punctuation = raw.replace(/[a-zA-Z]/g, '');

            if (this.synonyms[clean] && Math.random() < rate) {
                const syns = this.synonyms[clean];
                const syn = syns[Math.floor(Math.random() * syns.length)];
                const capitalized = raw[0] === raw[0].toUpperCase() ? syn.charAt(0).toUpperCase() + syn.slice(1) : syn;
                newWords.push(capitalized + punctuation);
                replacements.push({ original: clean, replacement: syn, position: i });
            } else {
                newWords.push(raw);
            }
        }

        return { text: newWords.join(' '), replacements };
    }

    getSynonyms(word) {
        const clean = word.toLowerCase();
        return {
            word: clean,
            synonyms: this.synonyms[clean] || [],
            hasSynonyms: !!this.synonyms[clean]
        };
    }

    getIntensityLevels() {
        return [
            { id: 'low', name: 'Light', rate: '20%', description: 'Minimal changes — swaps a few words' },
            { id: 'medium', name: 'Moderate', rate: '40%', description: 'Balanced rewriting — changes several words' },
            { id: 'high', name: 'Heavy', rate: '70%', description: 'Aggressive rewriting — transforms most of the text' }
        ];
    }
}

module.exports = Paraphraser;
