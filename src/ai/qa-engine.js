// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Question-Answering Engine
// Knowledge-base powered Q&A with context retrieval and confidence scoring
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const KNOWLEDGE = {
    'artificial intelligence': {
        facts: [
            { q: 'What is artificial intelligence?', a: 'Artificial Intelligence (AI) is the simulation of human intelligence processes by computer systems. These processes include learning, reasoning, self-correction, and perception. AI can be categorized into narrow AI (designed for specific tasks) and general AI (hypothetical systems with human-like reasoning across all domains).' },
            { q: 'Who invented AI?', a: 'The field of AI was formally founded at the Dartmouth Conference in 1956, organized by John McCarthy, Marvin Minsky, Nathaniel Rochester, and Claude Shannon. However, Alan Turing\'s 1950 paper "Computing Machinery and Intelligence" laid important groundwork with the Turing Test concept.' },
            { q: 'What are the types of AI?', a: 'AI is categorized into: (1) Narrow/Weak AI — designed for a specific task (virtual assistants, image recognition), (2) General/Strong AI — hypothetical AI with human-level reasoning, (3) Super AI — hypothetical AI surpassing human intelligence. Currently, all existing AI is narrow AI.' },
            { q: 'How does machine learning work?', a: 'Machine learning works by training algorithms on data to find patterns and make predictions. The process involves: collecting training data, selecting a model architecture, training the model by adjusting its parameters to minimize prediction errors, validating on held-out data, and deploying for inference on new data.' },
            { q: 'What is deep learning?', a: 'Deep learning is a subset of machine learning that uses neural networks with multiple layers (hence "deep"). Each layer learns increasingly abstract representations of data. It has achieved breakthrough results in image recognition, natural language processing, speech recognition, and game playing.' },
            { q: 'What is a neural network?', a: 'A neural network is a computational model inspired by biological neurons. It consists of layers of interconnected nodes (neurons) that process information. Input data flows through hidden layers where weighted connections and activation functions transform the data, producing outputs used for prediction or classification.' },
            { q: 'What is natural language processing?', a: 'Natural Language Processing (NLP) is a branch of AI focused on enabling computers to understand, interpret, and generate human language. Key tasks include sentiment analysis, machine translation, text summarization, named entity recognition, and question answering.' },
            { q: 'What are transformers in AI?', a: 'Transformers are a neural network architecture introduced in 2017 ("Attention Is All You Need"). They use self-attention mechanisms to process entire sequences in parallel, unlike RNNs which process sequentially. Transformers power modern LLMs like GPT, BERT, and Gemini.' },
        ]
    },
    'programming': {
        facts: [
            { q: 'What is programming?', a: 'Programming is the process of creating instructions (code) that tell a computer what to do. It involves defining algorithms, data structures, and logic in a programming language. Programs can range from simple scripts to complex systems like operating systems and AI models.' },
            { q: 'What is JavaScript?', a: 'JavaScript is a high-level, dynamic programming language primarily used for web development. Created by Brendan Eich in 1995, it runs in browsers and on servers (Node.js). It supports functional, object-oriented, and event-driven paradigms and has the largest package ecosystem (npm) of any language.' },
            { q: 'What is Python?', a: 'Python is a high-level, interpreted programming language created by Guido van Rossum in 1991. Known for its readable syntax and versatility, it dominates data science, AI/ML, scientific computing, and automation. Its philosophy emphasizes code readability and simplicity.' },
            { q: 'What is an API?', a: 'An API (Application Programming Interface) is a set of rules and protocols that allows different software applications to communicate. REST APIs use HTTP methods (GET, POST, PUT, DELETE) to perform operations on resources. APIs enable modular software architecture and third-party integrations.' },
            { q: 'What is Git?', a: 'Git is a distributed version control system created by Linus Torvalds in 2005. It tracks changes in source code, enables collaboration through branching and merging, and provides a complete history of all changes. GitHub, GitLab, and Bitbucket are popular Git hosting platforms.' },
            { q: 'What is a database?', a: 'A database is an organized collection of structured data stored electronically. Relational databases (MySQL, PostgreSQL) use tables with SQL queries. NoSQL databases (MongoDB, Redis) use flexible schemas. Databases provide CRUD operations (Create, Read, Update, Delete) and ensure data integrity through ACID properties.' },
        ]
    },
    'science': {
        facts: [
            { q: 'What is the speed of light?', a: 'The speed of light in a vacuum is approximately 299,792,458 meters per second (about 186,282 miles per second). It is denoted by the constant "c" and is the fastest speed at which information or matter can travel in the universe, according to Einstein\'s theory of special relativity.' },
            { q: 'What is DNA?', a: 'DNA (Deoxyribonucleic Acid) is a molecule that carries the genetic instructions for the development, functioning, growth, and reproduction of all known living organisms. It has a double helix structure discovered by Watson and Crick in 1953. The human genome contains about 3 billion base pairs.' },
            { q: 'What is quantum mechanics?', a: 'Quantum mechanics is the branch of physics that describes the behavior of matter and energy at the atomic and subatomic level. Key principles include wave-particle duality, the uncertainty principle (Heisenberg), superposition, and quantum entanglement. It is fundamental to understanding atoms, molecules, and subatomic particles.' },
            { q: 'What is a black hole?', a: 'A black hole is a region of spacetime where gravity is so strong that nothing — not even light — can escape once it crosses the event horizon. They form when massive stars collapse at the end of their life. Supermassive black holes (millions to billions of solar masses) exist at the centers of most galaxies.' },
            { q: 'What is evolution?', a: 'Evolution is the process of change in all forms of life over generations through natural selection, genetic drift, mutation, and gene flow. Charles Darwin proposed natural selection in 1859: organisms with favorable traits survive and reproduce more successfully, passing those traits to offspring.' },
        ]
    },
    'mathematics': {
        facts: [
            { q: 'What is calculus?', a: 'Calculus is a branch of mathematics that studies continuous change. It has two major branches: differential calculus (rates of change, slopes of curves) and integral calculus (accumulation, areas under curves). Developed independently by Newton and Leibniz in the 17th century, it is fundamental to physics, engineering, and economics.' },
            { q: 'What is the Pythagorean theorem?', a: 'The Pythagorean theorem states that in a right triangle, the square of the hypotenuse (c) equals the sum of the squares of the other two sides (a and b): a² + b² = c². This fundamental theorem has applications in geometry, trigonometry, physics, and computer graphics.' },
            { q: 'What is pi?', a: 'Pi (π) is a mathematical constant representing the ratio of a circle\'s circumference to its diameter. It is approximately 3.14159265358979... and is an irrational number (its decimal representation never ends and never repeats). Pi appears throughout mathematics, physics, and engineering.' },
        ]
    },
    'technology': {
        facts: [
            { q: 'What is cloud computing?', a: 'Cloud computing delivers computing services (servers, storage, databases, networking, software) over the internet ("the cloud"). Major providers include AWS, Azure, and Google Cloud. Benefits include scalability, cost-efficiency, and global availability. Models include IaaS, PaaS, and SaaS.' },
            { q: 'What is blockchain?', a: 'A blockchain is a distributed, immutable digital ledger that records transactions across a network of computers. Each block contains a cryptographic hash of the previous block, creating a chain. Originally developed for Bitcoin, blockchain technology now has applications in supply chain, healthcare, voting, and DeFi.' },
            { q: 'What is cybersecurity?', a: 'Cybersecurity is the practice of protecting systems, networks, and data from digital attacks. Key areas include network security, application security, information security, encryption, access control, and incident response. Common threats include malware, phishing, ransomware, and SQL injection.' },
        ]
    }
};

class QAEngine {
    constructor() {
        this.kb = KNOWLEDGE;
        this.history = [];
    }

    answer(question) {
        const startTime = Date.now();
        const normalized = question.toLowerCase().trim().replace(/[?!.]+$/, '');

        // Find best matching answer
        let bestMatch = null;
        let bestScore = 0;
        let bestTopic = null;

        const qWords = normalized.split(/\s+/).filter(w => w.length > 2);

        for (const [topic, data] of Object.entries(this.kb)) {
            for (const fact of data.facts) {
                const factQ = fact.q.toLowerCase();
                const factA = fact.a.toLowerCase();
                let score = 0;

                // Exact question match
                if (factQ.includes(normalized) || normalized.includes(factQ.replace('?', ''))) {
                    score += 100;
                }

                // Word overlap scoring
                for (const word of qWords) {
                    if (factQ.includes(word)) score += 5;
                    if (factA.includes(word)) score += 2;
                }

                // Topic keyword match
                if (normalized.includes(topic)) score += 20;

                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = fact;
                    bestTopic = topic;
                }
            }
        }

        const confidence = Math.min(1, bestScore / 50);
        const result = {
            question,
            answer: bestMatch ? bestMatch.a : "I don't have a specific answer for that question in my knowledge base. Try asking about AI, programming, science, mathematics, or technology!",
            matched: bestMatch ? bestMatch.q : null,
            topic: bestTopic,
            confidence: parseFloat(confidence.toFixed(4)),
            sources: bestTopic ? [`NeuralForge Knowledge Base: ${bestTopic}`] : [],
            relatedQuestions: this._getRelated(bestTopic, bestMatch),
            processingTimeMs: Date.now() - startTime
        };

        this.history.push({ question, topic: bestTopic, timestamp: Date.now() });
        return result;
    }

    _getRelated(topic, current) {
        if (!topic || !this.kb[topic]) return [];
        return this.kb[topic].facts
            .filter(f => f !== current)
            .slice(0, 3)
            .map(f => f.q);
    }

    getTopics() {
        return Object.keys(this.kb).map(t => ({
            topic: t,
            questionCount: this.kb[t].facts.length
        }));
    }

    getHistory() {
        return this.history.slice(-20);
    }
}

module.exports = QAEngine;
