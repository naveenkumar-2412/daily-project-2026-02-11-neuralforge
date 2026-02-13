// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Named Entity Recognition Engine
// Extracts people, organizations, locations, dates, and more from text
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ENTITY_PATTERNS = {
    PERSON: {
        firstNames: new Set(['james', 'john', 'robert', 'michael', 'david', 'william', 'richard', 'joseph', 'thomas', 'christopher', 'charles', 'daniel', 'matthew', 'anthony', 'mark', 'donald', 'steven', 'paul', 'andrew', 'joshua', 'kenneth', 'kevin', 'brian', 'george', 'timothy', 'ronald', 'edward', 'jason', 'jeffrey', 'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'jonathan', 'stephen', 'larry', 'justin', 'scott', 'brandon', 'benjamin', 'samuel', 'raymond', 'gregory', 'frank', 'alexander', 'patrick', 'jack', 'dennis', 'jerry', 'tyler', 'aaron', 'jose', 'adam', 'nathan', 'henry', 'peter', 'zachary', 'douglas', 'harold', 'mary', 'patricia', 'jennifer', 'linda', 'barbara', 'elizabeth', 'susan', 'jessica', 'sarah', 'karen', 'lisa', 'nancy', 'betty', 'margaret', 'sandra', 'ashley', 'dorothy', 'kimberly', 'emily', 'donna', 'michelle', 'carol', 'amanda', 'melissa', 'deborah', 'stephanie', 'rebecca', 'sharon', 'laura', 'cynthia', 'kathleen', 'amy', 'angela', 'shirley', 'anna', 'brenda', 'pamela', 'emma', 'nicole', 'helen', 'samantha', 'katherine', 'christine', 'debra', 'rachel', 'carolyn', 'janet', 'catherine', 'maria', 'heather', 'diane', 'ruth', 'julie', 'olivia', 'joyce', 'virginia', 'victoria', 'kelly', 'lauren', 'christina', 'joan']),
        lastNames: new Set(['smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis', 'rodriguez', 'martinez', 'hernandez', 'lopez', 'gonzalez', 'wilson', 'anderson', 'thomas', 'taylor', 'moore', 'jackson', 'martin', 'lee', 'perez', 'thompson', 'white', 'harris', 'sanchez', 'clark', 'ramirez', 'lewis', 'robinson', 'walker', 'young', 'allen', 'king', 'wright', 'scott', 'torres', 'nguyen', 'hill', 'flores', 'green', 'adams', 'nelson', 'baker', 'hall', 'rivera', 'campbell', 'mitchell', 'carter', 'roberts', 'gomez', 'phillips', 'evans', 'turner', 'diaz', 'parker', 'cruz', 'edwards', 'collins', 'reyes', 'stewart', 'morris', 'morales', 'murphy', 'cook', 'rogers', 'gutierrez', 'ortiz', 'morgan', 'cooper', 'peterson', 'bailey', 'reed', 'kelly', 'howard', 'ramos', 'kim', 'cox', 'ward', 'richardson', 'watson', 'brooks', 'chavez', 'wood', 'james', 'bennett', 'gray', 'mendoza', 'ruiz', 'hughes', 'price', 'alvarez', 'castillo', 'sanders', 'patel', 'myers', 'long', 'ross', 'foster', 'jimenez', 'powell', 'jenkins', 'perry', 'russell', 'sullivan']),
        titles: ['mr', 'mrs', 'ms', 'dr', 'prof', 'president', 'ceo', 'cto', 'sir', 'lady', 'lord'],
    },
    ORG: {
        names: new Set(['google', 'microsoft', 'apple', 'amazon', 'meta', 'facebook', 'openai', 'deepmind', 'tesla', 'spacex', 'netflix', 'nvidia', 'intel', 'amd', 'ibm', 'oracle', 'salesforce', 'adobe', 'uber', 'airbnb', 'twitter', 'linkedin', 'spotify', 'slack', 'zoom', 'github', 'gitlab', 'docker', 'mongodb', 'stripe', 'shopify', 'samsung', 'sony', 'toyota', 'boeing', 'nasa', 'esa', 'who', 'un', 'uefa', 'fifa', 'mit', 'stanford', 'harvard', 'oxford', 'cambridge', 'yale', 'princeton', 'caltech', 'cern', 'ieee', 'acm', 'aws', 'azure', 'gcp', 'anthropic', 'huggingface', 'databricks', 'snowflake', 'palantir', 'coinbase', 'robinhood', 'reddit']),
        suffixes: ['inc', 'corp', 'corporation', 'llc', 'ltd', 'limited', 'company', 'co', 'group', 'labs', 'technologies', 'systems', 'solutions', 'partners', 'associates', 'industries', 'enterprises', 'foundation', 'institute', 'university', 'college'],
    },
    LOCATION: {
        cities: new Set(['new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville', 'fort worth', 'columbus', 'indianapolis', 'charlotte', 'san francisco', 'seattle', 'denver', 'washington', 'nashville', 'oklahoma city', 'el paso', 'boston', 'portland', 'las vegas', 'memphis', 'louisville', 'baltimore', 'milwaukee', 'albuquerque', 'tucson', 'fresno', 'sacramento', 'mesa', 'kansas city', 'atlanta', 'omaha', 'colorado springs', 'raleigh', 'london', 'paris', 'tokyo', 'berlin', 'madrid', 'rome', 'amsterdam', 'dubai', 'singapore', 'hong kong', 'sydney', 'melbourne', 'toronto', 'vancouver', 'mumbai', 'delhi', 'beijing', 'shanghai', 'seoul', 'bangkok', 'jakarta', 'cairo', 'lagos', 'nairobi', 'cape town', 'rio de janeiro', 'sao paulo', 'buenos aires', 'lima', 'bogota', 'mexico city', 'istanbul', 'moscow', 'warsaw', 'prague', 'vienna', 'zurich', 'geneva', 'stockholm', 'oslo', 'copenhagen', 'helsinki', 'dublin', 'lisbon', 'barcelona', 'munich', 'hamburg', 'milan', 'lyon', 'marseille', 'osaka', 'yokohama', 'kyoto', 'taipei', 'manila', 'hanoi', 'kuala lumpur', 'karachi', 'dhaka', 'kolkata', 'chennai', 'bangalore', 'hyderabad']),
        countries: new Set(['united states', 'canada', 'united kingdom', 'france', 'germany', 'japan', 'china', 'india', 'brazil', 'australia', 'mexico', 'south korea', 'russia', 'italy', 'spain', 'netherlands', 'switzerland', 'sweden', 'norway', 'denmark', 'finland', 'ireland', 'austria', 'belgium', 'portugal', 'poland', 'czech republic', 'hungary', 'greece', 'turkey', 'egypt', 'south africa', 'nigeria', 'kenya', 'argentina', 'colombia', 'chile', 'peru', 'israel', 'saudi arabia', 'uae', 'qatar', 'singapore', 'malaysia', 'thailand', 'vietnam', 'indonesia', 'philippines', 'taiwan', 'new zealand']),
        landmarks: new Set(['eiffel tower', 'statue of liberty', 'great wall', 'taj mahal', 'colosseum', 'big ben', 'golden gate bridge', 'sydney opera house', 'machu picchu', 'petra', 'stonehenge', 'mount everest', 'grand canyon', 'niagara falls', 'mount fuji', 'amazon river', 'sahara desert', 'great barrier reef', 'yellowstone', 'kilimanjaro']),
    },
    DATE: {
        months: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
        patterns: [
            /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/g,
            /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/gi,
            /\b\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/gi,
            /\b\d{4}\b/g,
        ]
    },
    EMAIL: { pattern: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g },
    URL: { pattern: /\bhttps?:\/\/[^\s<>"{}|\\^`\[\]]+/g },
    PHONE: { pattern: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g },
    MONEY: { pattern: /\$[\d,]+(?:\.\d{2})?(?:\s*(?:million|billion|trillion|thousand|hundred|k|m|b))?\b/gi },
    PERCENT: { pattern: /\b\d+(?:\.\d+)?%/g },
};

class NEREngine {
    constructor() {
        this.entityPatterns = ENTITY_PATTERNS;
    }

    extract(text) {
        const startTime = Date.now();
        const entities = [];
        const words = text.split(/\s+/);

        // Extract regex-based entities (EMAIL, URL, PHONE, MONEY, PERCENT)
        for (const type of ['EMAIL', 'URL', 'PHONE', 'MONEY', 'PERCENT']) {
            const pattern = this.entityPatterns[type].pattern;
            let match;
            const regex = new RegExp(pattern.source, pattern.flags);
            while ((match = regex.exec(text)) !== null) {
                entities.push({
                    text: match[0], label: type,
                    start: match.index, end: match.index + match[0].length,
                    confidence: 0.95
                });
            }
        }

        // Extract DATE patterns
        for (const pattern of this.entityPatterns.DATE.patterns) {
            let match;
            const regex = new RegExp(pattern.source, pattern.flags);
            while ((match = regex.exec(text)) !== null) {
                if (match[0].length >= 4) {
                    entities.push({
                        text: match[0], label: 'DATE',
                        start: match.index, end: match.index + match[0].length,
                        confidence: 0.8
                    });
                }
            }
        }

        // Extract PERSON, ORG, LOCATION using dictionary + heuristics
        this._extractNamedEntities(text, words, entities);

        // Remove duplicates and overlaps
        const filtered = this._resolveOverlaps(entities);

        // Build summary
        const summary = {};
        for (const e of filtered) {
            if (!summary[e.label]) summary[e.label] = [];
            if (!summary[e.label].includes(e.text)) summary[e.label].push(e.text);
        }

        return {
            text,
            entities: filtered,
            summary,
            entityCount: filtered.length,
            labels: [...new Set(filtered.map(e => e.label))],
            processingTimeMs: Date.now() - startTime
        };
    }

    _extractNamedEntities(text, words, entities) {
        const lowerText = text.toLowerCase();

        // Check for organizations
        for (const org of this.entityPatterns.ORG.names) {
            const idx = lowerText.indexOf(org);
            if (idx !== -1) {
                let end = idx + org.length;
                const after = text.substring(end).trim().split(/\s+/)[0]?.toLowerCase();
                if (this.entityPatterns.ORG.suffixes.includes(after)) {
                    end = text.indexOf(after, end) + after.length;
                }
                entities.push({
                    text: text.substring(idx, end), label: 'ORG',
                    start: idx, end, confidence: 0.9
                });
            }
        }

        // Check for locations (multi-word first)
        for (const loc of this.entityPatterns.LOCATION.cities) {
            const idx = lowerText.indexOf(loc);
            if (idx !== -1) {
                entities.push({
                    text: text.substring(idx, idx + loc.length), label: 'LOCATION',
                    start: idx, end: idx + loc.length, confidence: 0.85
                });
            }
        }
        for (const loc of this.entityPatterns.LOCATION.countries) {
            const idx = lowerText.indexOf(loc);
            if (idx !== -1) {
                entities.push({
                    text: text.substring(idx, idx + loc.length), label: 'LOCATION',
                    start: idx, end: idx + loc.length, confidence: 0.9
                });
            }
        }

        // Check for persons using capitalized word heuristic + name dictionaries
        const capitalized = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g) || [];
        for (const phrase of capitalized) {
            const parts = phrase.split(/\s+/);
            const first = parts[0].toLowerCase();
            const last = parts[parts.length - 1].toLowerCase();
            if (this.entityPatterns.PERSON.firstNames.has(first) || this.entityPatterns.PERSON.lastNames.has(last)) {
                const idx = text.indexOf(phrase);
                entities.push({
                    text: phrase, label: 'PERSON',
                    start: idx, end: idx + phrase.length, confidence: 0.85
                });
            }
        }

        // Check for titled persons (Dr. Smith, Mr. Jones)
        const titlePattern = /\b(Mr|Mrs|Ms|Dr|Prof|President|CEO)\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
        let match;
        while ((match = titlePattern.exec(text)) !== null) {
            entities.push({
                text: match[0], label: 'PERSON',
                start: match.index, end: match.index + match[0].length,
                confidence: 0.92
            });
        }
    }

    _resolveOverlaps(entities) {
        // Sort by start position, then by length (longer first)
        entities.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

        const result = [];
        let lastEnd = -1;
        for (const e of entities) {
            if (e.start >= lastEnd) {
                result.push(e);
                lastEnd = e.end;
            }
        }
        return result;
    }

    getEntityTypes() {
        return ['PERSON', 'ORG', 'LOCATION', 'DATE', 'EMAIL', 'URL', 'PHONE', 'MONEY', 'PERCENT'];
    }
}

module.exports = NEREngine;
