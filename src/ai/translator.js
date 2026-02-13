// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Multi-Language Translator Engine
// Dictionary-based translation with phrase matching and language detection
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DICTIONARIES = {
    en_es: {
        words: {
            'hello': 'hola', 'goodbye': 'adiós', 'please': 'por favor', 'thank you': 'gracias',
            'yes': 'sí', 'no': 'no', 'good': 'bueno', 'bad': 'malo', 'big': 'grande', 'small': 'pequeño',
            'the': 'el', 'a': 'un', 'is': 'es', 'are': 'son', 'was': 'fue', 'were': 'fueron',
            'i': 'yo', 'you': 'tú', 'he': 'él', 'she': 'ella', 'we': 'nosotros', 'they': 'ellos',
            'and': 'y', 'or': 'o', 'but': 'pero', 'not': 'no', 'with': 'con', 'without': 'sin',
            'water': 'agua', 'food': 'comida', 'house': 'casa', 'car': 'coche', 'book': 'libro',
            'time': 'tiempo', 'day': 'día', 'night': 'noche', 'morning': 'mañana', 'year': 'año',
            'man': 'hombre', 'woman': 'mujer', 'child': 'niño', 'friend': 'amigo', 'family': 'familia',
            'love': 'amor', 'life': 'vida', 'world': 'mundo', 'work': 'trabajo', 'school': 'escuela',
            'city': 'ciudad', 'country': 'país', 'name': 'nombre', 'number': 'número', 'hand': 'mano',
            'eye': 'ojo', 'head': 'cabeza', 'heart': 'corazón', 'face': 'cara', 'body': 'cuerpo',
            'new': 'nuevo', 'old': 'viejo', 'great': 'gran', 'long': 'largo', 'high': 'alto',
            'want': 'querer', 'know': 'saber', 'think': 'pensar', 'come': 'venir', 'go': 'ir',
            'make': 'hacer', 'find': 'encontrar', 'give': 'dar', 'tell': 'decir', 'see': 'ver',
            'eat': 'comer', 'drink': 'beber', 'sleep': 'dormir', 'run': 'correr', 'walk': 'caminar',
            'read': 'leer', 'write': 'escribir', 'speak': 'hablar', 'listen': 'escuchar', 'learn': 'aprender',
            'open': 'abrir', 'close': 'cerrar', 'buy': 'comprar', 'sell': 'vender', 'pay': 'pagar',
            'beautiful': 'hermoso', 'happy': 'feliz', 'sad': 'triste', 'young': 'joven', 'fast': 'rápido',
            'today': 'hoy', 'tomorrow': 'mañana', 'yesterday': 'ayer', 'here': 'aquí', 'there': 'allí',
            'what': 'qué', 'where': 'dónde', 'when': 'cuándo', 'how': 'cómo', 'why': 'por qué',
            'one': 'uno', 'two': 'dos', 'three': 'tres', 'four': 'cuatro', 'five': 'cinco',
            'six': 'seis', 'seven': 'siete', 'eight': 'ocho', 'nine': 'nueve', 'ten': 'diez',
            'hundred': 'cien', 'thousand': 'mil', 'million': 'millón',
            'computer': 'computadora', 'program': 'programa', 'data': 'datos', 'network': 'red',
            'system': 'sistema', 'information': 'información', 'technology': 'tecnología',
            'science': 'ciencia', 'art': 'arte', 'music': 'música', 'project': 'proyecto',
        },
        phrases: {
            'how are you': 'cómo estás', 'good morning': 'buenos días', 'good night': 'buenas noches',
            'i love you': 'te quiero', 'thank you very much': 'muchas gracias', 'you are welcome': 'de nada',
            'nice to meet you': 'mucho gusto', 'see you later': 'hasta luego', 'excuse me': 'disculpe',
            'i am sorry': 'lo siento', 'of course': 'por supuesto', 'what time is it': 'qué hora es',
        }
    },
    en_fr: {
        words: {
            'hello': 'bonjour', 'goodbye': 'au revoir', 'please': "s'il vous plaît", 'thank you': 'merci',
            'yes': 'oui', 'no': 'non', 'good': 'bon', 'bad': 'mauvais', 'big': 'grand', 'small': 'petit',
            'the': 'le', 'a': 'un', 'is': 'est', 'are': 'sont', 'was': 'était', 'were': 'étaient',
            'i': 'je', 'you': 'vous', 'he': 'il', 'she': 'elle', 'we': 'nous', 'they': 'ils',
            'and': 'et', 'or': 'ou', 'but': 'mais', 'not': 'ne pas', 'with': 'avec', 'without': 'sans',
            'water': 'eau', 'food': 'nourriture', 'house': 'maison', 'car': 'voiture', 'book': 'livre',
            'time': 'temps', 'day': 'jour', 'night': 'nuit', 'morning': 'matin', 'year': 'année',
            'man': 'homme', 'woman': 'femme', 'child': 'enfant', 'friend': 'ami', 'family': 'famille',
            'love': 'amour', 'life': 'vie', 'world': 'monde', 'work': 'travail', 'school': 'école',
            'city': 'ville', 'country': 'pays', 'name': 'nom', 'number': 'numéro', 'hand': 'main',
            'new': 'nouveau', 'old': 'vieux', 'great': 'grand', 'long': 'long', 'high': 'haut',
            'want': 'vouloir', 'know': 'savoir', 'think': 'penser', 'come': 'venir', 'go': 'aller',
            'make': 'faire', 'find': 'trouver', 'give': 'donner', 'tell': 'dire', 'see': 'voir',
            'eat': 'manger', 'drink': 'boire', 'sleep': 'dormir', 'run': 'courir', 'walk': 'marcher',
            'read': 'lire', 'write': 'écrire', 'speak': 'parler', 'listen': 'écouter', 'learn': 'apprendre',
            'beautiful': 'beau', 'happy': 'heureux', 'sad': 'triste', 'young': 'jeune', 'fast': 'rapide',
            'today': "aujourd'hui", 'tomorrow': 'demain', 'yesterday': 'hier', 'here': 'ici', 'there': 'là',
            'computer': 'ordinateur', 'program': 'programme', 'data': 'données', 'network': 'réseau',
        },
        phrases: {
            'how are you': 'comment allez-vous', 'good morning': 'bonjour', 'good night': 'bonne nuit',
            'i love you': 'je t\'aime', 'thank you very much': 'merci beaucoup', 'you are welcome': 'de rien',
            'nice to meet you': 'enchanté', 'see you later': 'à plus tard', 'excuse me': 'excusez-moi',
        }
    },
    en_de: {
        words: {
            'hello': 'hallo', 'goodbye': 'auf wiedersehen', 'please': 'bitte', 'thank you': 'danke',
            'yes': 'ja', 'no': 'nein', 'good': 'gut', 'bad': 'schlecht', 'big': 'groß', 'small': 'klein',
            'the': 'der', 'a': 'ein', 'is': 'ist', 'are': 'sind', 'was': 'war', 'were': 'waren',
            'i': 'ich', 'you': 'du', 'he': 'er', 'she': 'sie', 'we': 'wir', 'they': 'sie',
            'and': 'und', 'or': 'oder', 'but': 'aber', 'not': 'nicht', 'with': 'mit', 'without': 'ohne',
            'water': 'wasser', 'food': 'essen', 'house': 'haus', 'car': 'auto', 'book': 'buch',
            'time': 'zeit', 'day': 'tag', 'night': 'nacht', 'morning': 'morgen', 'year': 'jahr',
            'man': 'mann', 'woman': 'frau', 'child': 'kind', 'friend': 'freund', 'family': 'familie',
            'love': 'liebe', 'life': 'leben', 'world': 'welt', 'work': 'arbeit', 'school': 'schule',
            'new': 'neu', 'old': 'alt', 'great': 'groß', 'long': 'lang', 'high': 'hoch',
            'want': 'wollen', 'know': 'wissen', 'think': 'denken', 'come': 'kommen', 'go': 'gehen',
            'make': 'machen', 'find': 'finden', 'give': 'geben', 'tell': 'erzählen', 'see': 'sehen',
            'eat': 'essen', 'drink': 'trinken', 'sleep': 'schlafen', 'run': 'laufen', 'walk': 'gehen',
            'beautiful': 'schön', 'happy': 'glücklich', 'sad': 'traurig', 'young': 'jung', 'fast': 'schnell',
            'computer': 'computer', 'program': 'programm', 'data': 'daten', 'network': 'netzwerk',
        },
        phrases: {
            'how are you': 'wie geht es ihnen', 'good morning': 'guten morgen', 'good night': 'gute nacht',
            'i love you': 'ich liebe dich', 'thank you very much': 'vielen dank', 'excuse me': 'entschuldigung',
        }
    },
    en_ja: {
        words: {
            'hello': 'こんにちは', 'goodbye': 'さようなら', 'please': 'お願いします', 'thank you': 'ありがとう',
            'yes': 'はい', 'no': 'いいえ', 'good': '良い', 'bad': '悪い', 'big': '大きい', 'small': '小さい',
            'water': '水', 'food': '食べ物', 'house': '家', 'car': '車', 'book': '本',
            'time': '時間', 'day': '日', 'night': '夜', 'morning': '朝', 'year': '年',
            'man': '男', 'woman': '女', 'child': '子供', 'friend': '友達', 'family': '家族',
            'love': '愛', 'life': '人生', 'world': '世界', 'work': '仕事', 'school': '学校',
            'computer': 'コンピュータ', 'program': 'プログラム', 'data': 'データ', 'network': 'ネットワーク',
            'beautiful': '美しい', 'happy': '幸せ', 'sad': '悲しい', 'eat': '食べる', 'drink': '飲む',
        },
        phrases: {
            'how are you': 'お元気ですか', 'good morning': 'おはようございます', 'good night': 'おやすみなさい',
            'i love you': '愛してる', 'thank you very much': 'どうもありがとうございます', 'excuse me': 'すみません',
        }
    },
    en_hi: {
        words: {
            'hello': 'नमस्ते', 'goodbye': 'अलविदा', 'please': 'कृपया', 'thank you': 'धन्यवाद',
            'yes': 'हाँ', 'no': 'नहीं', 'good': 'अच्छा', 'bad': 'बुरा', 'big': 'बड़ा', 'small': 'छोटा',
            'water': 'पानी', 'food': 'खाना', 'house': 'घर', 'car': 'गाड़ी', 'book': 'किताब',
            'time': 'समय', 'day': 'दिन', 'night': 'रात', 'morning': 'सुबह', 'year': 'साल',
            'man': 'आदमी', 'woman': 'औरत', 'child': 'बच्चा', 'friend': 'दोस्त', 'family': 'परिवार',
            'love': 'प्यार', 'life': 'जीवन', 'world': 'दुनिया', 'work': 'काम', 'school': 'स्कूल',
            'computer': 'कंप्यूटर', 'program': 'कार्यक्रम', 'data': 'डेटा', 'network': 'नेटवर्क',
            'happy': 'खुश', 'sad': 'दुखी', 'eat': 'खाना', 'drink': 'पीना', 'sleep': 'सोना',
            'name': 'नाम', 'number': 'नंबर', 'new': 'नया', 'old': 'पुराना', 'beautiful': 'सुंदर',
        },
        phrases: {
            'how are you': 'आप कैसे हैं', 'good morning': 'सुप्रभात', 'good night': 'शुभ रात्रि',
            'i love you': 'मैं तुमसे प्यार करता हूँ', 'thank you very much': 'बहुत बहुत धन्यवाद',
        }
    }
};

// Language detection patterns
const LANG_SIGNATURES = {
    en: { chars: /[a-zA-Z]/, common: ['the', 'is', 'are', 'and', 'or', 'in', 'to', 'of', 'a', 'for'] },
    es: { chars: /[áéíóúñ¿¡]/, common: ['el', 'la', 'de', 'que', 'en', 'y', 'es', 'un', 'los', 'por'] },
    fr: { chars: /[àâçéèêëîïôùûü]/, common: ['le', 'la', 'de', 'et', 'est', 'un', 'une', 'les', 'des', 'en'] },
    de: { chars: /[äöüß]/, common: ['der', 'die', 'und', 'ist', 'ein', 'das', 'den', 'von', 'nicht', 'mit'] },
    ja: { chars: /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/, common: [] },
    hi: { chars: /[\u0900-\u097F]/, common: [] },
};

class Translator {
    constructor() {
        this.supportedPairs = Object.keys(DICTIONARIES);
        this.languages = {
            en: 'English', es: 'Spanish', fr: 'French',
            de: 'German', ja: 'Japanese', hi: 'Hindi'
        };
    }

    detectLanguage(text) {
        const scores = {};
        for (const [lang, sig] of Object.entries(LANG_SIGNATURES)) {
            let score = 0;
            const charMatches = (text.match(sig.chars) || []).length;
            score += charMatches * 2;
            const words = text.toLowerCase().split(/\s+/);
            for (const common of sig.common) {
                if (words.includes(common)) score += 10;
            }
            scores[lang] = score;
        }
        const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        return {
            detected: sorted[0][0],
            language: this.languages[sorted[0][0]] || sorted[0][0],
            confidence: Math.min(1, sorted[0][1] / (text.split(/\s+/).length * 5)),
            scores: Object.fromEntries(sorted)
        };
    }

    translate(text, from = 'en', to = 'es') {
        const startTime = Date.now();
        const pairKey = `${from}_${to}`;
        const reversePairKey = `${to}_${from}`;

        let dict = DICTIONARIES[pairKey];
        let reversed = false;
        if (!dict && DICTIONARIES[reversePairKey]) {
            dict = this._reverseDictionary(DICTIONARIES[reversePairKey]);
            reversed = true;
        }
        if (!dict) {
            return {
                error: `Translation pair ${from}->${to} not supported`,
                supported: this.supportedPairs,
                suggestion: 'Try translating through English as intermediate'
            };
        }

        let result = text.toLowerCase();
        const translations = [];

        // Phase 1: Translate phrases first (longer matches)
        const phrases = dict.phrases || {};
        for (const [src, tgt] of Object.entries(phrases)) {
            if (result.includes(src)) {
                result = result.replace(new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), tgt);
                translations.push({ original: src, translated: tgt, type: 'phrase' });
            }
        }

        // Phase 2: Translate individual words
        const words = result.split(/(\s+|[.,!?;:'"()-])/);
        const translatedWords = words.map(word => {
            const clean = word.toLowerCase().trim();
            if (dict.words[clean]) {
                translations.push({ original: clean, translated: dict.words[clean], type: 'word' });
                return dict.words[clean];
            }
            return word;
        });

        const translated = translatedWords.join('');
        const wordCount = text.split(/\s+/).length;
        const translatedCount = translations.length;

        return {
            original: text,
            translated: translated,
            from: { code: from, language: this.languages[from] },
            to: { code: to, language: this.languages[to] },
            translations: translations,
            coverage: parseFloat((translatedCount / wordCount).toFixed(4)),
            wordCount,
            translatedWordCount: translatedCount,
            detectedLanguage: this.detectLanguage(text),
            processingTimeMs: Date.now() - startTime
        };
    }

    _reverseDictionary(dict) {
        const reversed = { words: {}, phrases: {} };
        for (const [k, v] of Object.entries(dict.words)) reversed.words[v] = k;
        for (const [k, v] of Object.entries(dict.phrases || {})) reversed.phrases[v] = k;
        return reversed;
    }

    getSupportedLanguages() {
        return {
            languages: this.languages,
            pairs: this.supportedPairs.map(p => {
                const [from, to] = p.split('_');
                return { from, to, fromName: this.languages[from], toName: this.languages[to] };
            })
        };
    }
}

module.exports = Translator;
