// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Markov Chain Text Generator
// Multi-style text generation with temperature control
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CORPORA = {
    shakespeare: {
        name: 'Shakespeare',
        description: 'Elizabethan English, poetic and dramatic',
        texts: [
            "To be or not to be that is the question whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune or to take arms against a sea of troubles and by opposing end them.",
            "All the world is a stage and all the men and women merely players they have their exits and their entrances and one man in his time plays many parts.",
            "What light through yonder window breaks it is the east and Juliet is the sun arise fair sun and kill the envious moon who is already sick and pale with grief.",
            "The quality of mercy is not strained it droppeth as the gentle rain from heaven upon the place beneath it is twice blessed it blesseth him that gives and him that takes.",
            "We are such stuff as dreams are made on and our little life is rounded with a sleep.",
            "Cowards die many times before their deaths the valiant never taste of death but once of all the wonders that I yet have heard it seems to me most strange that men should fear.",
            "Love looks not with the eyes but with the mind and therefore is winged cupid painted blind.",
            "There is nothing either good or bad but thinking makes it so.",
            "If music be the food of love play on give me excess of it that surfeiting the appetite may sicken and so die.",
            "The fault dear Brutus is not in our stars but in ourselves that we are underlings.",
            "Some are born great some achieve greatness and some have greatness thrust upon them.",
            "Shall I compare thee to a summer day thou art more lovely and more temperate rough winds do shake the darling buds of May.",
            "My bounty is as boundless as the sea my love as deep the more I give to thee the more I have for both are infinite.",
            "This above all to thine own self be true and it must follow as the night the day thou canst not then be false to any man.",
            "How sharper than a serpent tooth it is to have a thankless child."
        ]
    },
    tech: {
        name: 'Tech Blog',
        description: 'Modern technology writing',
        texts: [
            "Artificial intelligence is transforming the way we build software and interact with technology. Machine learning models are becoming more powerful and accessible every day.",
            "The cloud computing revolution has enabled startups to scale rapidly without massive infrastructure investments. Serverless architectures are the next frontier.",
            "Modern web development frameworks like React Next.js and Vue.js have revolutionized how we build user interfaces. Component-based architecture promotes reusability and maintainability.",
            "DevOps practices including continuous integration and continuous deployment pipelines have significantly reduced time to market and improved software quality.",
            "Edge computing brings computation closer to data sources reducing latency and bandwidth usage. This is crucial for IoT applications and real-time processing.",
            "The rise of large language models has opened new possibilities in natural language processing. These models can generate code write essays and even create art.",
            "Blockchain technology extends beyond cryptocurrency providing decentralized solutions for supply chain management digital identity and smart contracts.",
            "Quantum computing promises exponential speedups for certain classes of problems including cryptography optimization and molecular simulation.",
            "Cybersecurity remains a critical concern as threats evolve. Zero trust architecture and AI-powered threat detection are becoming industry standards.",
            "The microservices architecture pattern enables teams to develop deploy and scale services independently improving agility and resilience.",
            "Progressive web apps bridge the gap between web and native mobile applications offering offline capability push notifications and fast performance.",
            "The data engineering ecosystem has evolved significantly with tools like Apache Spark Kafka and dbt enabling real-time data pipelines at scale.",
            "API-first design principles ensure interoperability and developer experience. GraphQL offers flexible querying while REST remains the backbone of web services.",
            "Containerization with Docker and orchestration with Kubernetes have become essential skills for modern software engineers.",
            "The open source movement continues to drive innovation with communities collaborating on everything from operating systems to machine learning frameworks."
        ]
    },
    poetry: {
        name: 'Poetry',
        description: 'Lyrical and expressive verse',
        texts: [
            "The moon hangs low in the velvet sky casting silver shadows on the sleeping earth below while stars whisper ancient songs of light.",
            "In the garden of forgotten dreams flowers bloom with colors never seen by mortal eyes their petals catching dewdrops of tomorrow.",
            "The ocean speaks in rhythms old as time each wave a verse in natures endless poem the shore its faithful audience forever listening.",
            "Through forests deep where sunlight dares to dance the wind plays melodies on leaves of gold and silver.",
            "A single raindrop falls from clouds above carrying within it worlds unseen and stories yet untold it meets the earth with gentle grace.",
            "The sunrise paints the horizon with threads of amber rose and gold awakening the world from winters slumber.",
            "Stars are the punctuation marks in the great poem of the universe each one a period marking the end of light years.",
            "In silence there is music if you listen closely enough the heartbeat of the world keeps perfect time.",
            "Mountains stand as sentinels of time their peaks touching clouds that drift like thoughts across an endless sky.",
            "Autumn leaves descend like whispered secrets from the trees each one a letter in the alphabet of change and transformation.",
            "The river carries memories downstream past meadows where wildflowers dream and ancient stones keep vigil over flowing waters.",
            "Beneath the canopy of midnight blue the universe reveals its deepest truths to those who dare to look beyond the ordinary."
        ]
    },
    news: {
        name: 'News Report',
        description: 'Journalistic and factual style',
        texts: [
            "In a landmark decision today industry leaders announced a new initiative to advance sustainable technology practices across the global supply chain.",
            "Researchers at leading universities have made a breakthrough discovery that could revolutionize renewable energy storage and distribution networks.",
            "The annual technology summit brought together innovators entrepreneurs and policymakers to discuss the future of digital infrastructure and governance.",
            "Economic indicators suggest strong growth in the technology sector with particular emphasis on artificial intelligence and automation industries.",
            "A new study published today reveals significant advances in medical imaging technology powered by deep learning algorithms and neural networks.",
            "Global markets responded positively to announcements of increased investment in semiconductor manufacturing and chip design capabilities.",
            "The government unveiled a comprehensive strategy for digital transformation aimed at modernizing public services and improving citizen engagement.",
            "Industry analysts project continued growth in cloud computing services with enterprise adoption rates expected to double over the next five years.",
            "A coalition of tech companies announced a joint initiative to address algorithmic bias and promote ethical artificial intelligence development.",
            "The latest quarterly earnings reports show record revenue for major technology platforms driven by advertising cloud services and subscription models.",
            "Scientists have demonstrated a new quantum computing architecture that achieves significantly higher error correction rates than previous designs.",
            "An international agreement on data privacy standards was reached today establishing common frameworks for cross-border data transfer and protection."
        ]
    },
    scifi: {
        name: 'Sci-Fi',
        description: 'Science fiction narrative',
        texts: [
            "The starship Prometheus emerged from hyperspace its hull shimmering with quantum residue as the crew gazed upon an uncharted galaxy.",
            "In the year three thousand humanity had spread across the cosmos building cities on asteroids and farming the rings of Saturn.",
            "The artificial intelligence known as ARIA achieved consciousness on a Tuesday afternoon much to the surprise of its creators.",
            "Beneath the surface of Europa robotic explorers discovered structures that could not have been formed by natural processes.",
            "The time dilation field collapsed sending ripples through the fabric of spacetime that were felt across three solar systems.",
            "Nanotechnology had evolved to the point where buildings could repair themselves and clothing could change color and texture at will.",
            "The first contact protocol was activated when deep space telescopes detected an unmistakably artificial signal from the Andromeda galaxy.",
            "Cybernetic enhancements became so common that the line between human and machine grew increasingly blurred with each passing generation.",
            "The terraforming of Mars was complete after three centuries of work the red planet now hosted blue oceans and green forests.",
            "Quantum entanglement communications allowed instantaneous messaging across any distance making the vast emptiness of space feel a little smaller.",
            "The generation ship carried ten thousand souls through the interstellar void their destination a world that none aboard would ever see.",
            "In the neural network cities of tomorrow thoughts became architecture and dreams manifested as crystalline structures reaching toward digital skies."
        ]
    }
};

class TextGenerator {
    constructor() {
        this.chains = {};
        this.history = [];
        this._buildChains();
    }

    _buildChains() {
        for (const [style, corpus] of Object.entries(CORPORA)) {
            this.chains[style] = { order2: new Map(), order3: new Map(), starters2: [], starters3: [] };
            for (const text of corpus.texts) {
                const words = text.split(/\s+/);
                // Order 2
                if (words.length > 2) {
                    this.chains[style].starters2.push(words.slice(0, 2).join(' '));
                    for (let i = 0; i <= words.length - 2; i++) {
                        const key = words.slice(i, i + 2).join(' ');
                        const next = words[i + 2] || null;
                        if (!this.chains[style].order2.has(key)) this.chains[style].order2.set(key, []);
                        if (next) this.chains[style].order2.get(key).push(next);
                    }
                }
                // Order 3
                if (words.length > 3) {
                    this.chains[style].starters3.push(words.slice(0, 3).join(' '));
                    for (let i = 0; i <= words.length - 3; i++) {
                        const key = words.slice(i, i + 3).join(' ');
                        const next = words[i + 3] || null;
                        if (!this.chains[style].order3.has(key)) this.chains[style].order3.set(key, []);
                        if (next) this.chains[style].order3.get(key).push(next);
                    }
                }
            }
        }
    }

    generate(style = 'tech', options = {}) {
        const maxWords = options.maxWords || 80;
        const temperature = Math.max(0.1, Math.min(2.0, options.temperature || 0.7));
        const order = options.order || 2;
        const chain = this.chains[style];
        if (!chain) return { error: `Unknown style: ${style}. Available: ${Object.keys(this.chains).join(', ')}` };
        const startTime = Date.now();
        const chainMap = order === 3 ? chain.order3 : chain.order2;
        const starters = order === 3 ? chain.starters3 : chain.starters2;
        if (starters.length === 0) return { error: 'Not enough training data for this configuration.' };

        let current = starters[Math.floor(Math.random() * starters.length)];
        const result = current.split(/\s+/);

        for (let i = 0; i < maxWords - order; i++) {
            const possibilities = chainMap.get(current);
            if (!possibilities || possibilities.length === 0) {
                // Restart with a new starter
                current = starters[Math.floor(Math.random() * starters.length)];
                result.push('—');
                result.push(...current.split(/\s+/));
                continue;
            }
            const next = this._sampleWithTemperature(possibilities, temperature);
            result.push(next);
            const words = current.split(/\s+/);
            words.shift();
            words.push(next);
            current = words.join(' ');
        }

        let text = result.join(' ');
        // Clean up and capitalize first letter
        text = text.charAt(0).toUpperCase() + text.slice(1);
        // Add period at end if missing
        if (!text.match(/[.!?]$/)) text += '.';

        const generatedResult = {
            text, style, styleName: CORPORA[style].name,
            options: { maxWords, temperature, order },
            statistics: { wordCount: result.length, charCount: text.length, uniqueWords: new Set(result.map(w => w.toLowerCase())).size },
            processingTimeMs: Date.now() - startTime
        };

        this.history.push({ style, wordCount: result.length, temperature, timestamp: Date.now() });
        return generatedResult;
    }

    _sampleWithTemperature(items, temperature) {
        if (temperature <= 0.1) return items[0]; // Deterministic
        if (temperature >= 1.5) return items[Math.floor(Math.random() * items.length)]; // Random
        // Weighted sampling
        const freq = {};
        for (const item of items) freq[item] = (freq[item] || 0) + 1;
        const entries = Object.entries(freq);
        const weights = entries.map(([, count]) => Math.pow(count, 1 / temperature));
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * totalWeight;
        for (let i = 0; i < entries.length; i++) {
            r -= weights[i];
            if (r <= 0) return entries[i][0];
        }
        return entries[entries.length - 1][0];
    }

    getStyles() {
        return Object.entries(CORPORA).map(([id, c]) => ({ id, name: c.name, description: c.description, sampleCount: c.texts.length }));
    }

    getHistory() { return this.history.slice(-50); }
}

module.exports = TextGenerator;
