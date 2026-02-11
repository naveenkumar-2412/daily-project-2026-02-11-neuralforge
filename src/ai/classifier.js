// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Naive Bayes Text Classifier
// Train/predict with multi-category support and feature importance
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEMO_DATASETS = {
    spam: {
        name: 'Spam Detector',
        description: 'Classify emails as spam or not spam',
        training: [
            { text: 'Win a free iPhone now click here to claim your prize', category: 'spam' },
            { text: 'Congratulations you have been selected for a cash prize of one million dollars', category: 'spam' },
            { text: 'Buy cheap medications online without prescription', category: 'spam' },
            { text: 'Limited time offer get rich quick with this simple trick', category: 'spam' },
            { text: 'You have won a luxury vacation claim now before it expires', category: 'spam' },
            { text: 'Free gift card giveaway click the link below to enter', category: 'spam' },
            { text: 'Make money from home earn thousands per week guaranteed', category: 'spam' },
            { text: 'Urgent your account has been compromised verify your identity immediately', category: 'spam' },
            { text: 'Act now this incredible deal expires at midnight tonight', category: 'spam' },
            { text: 'Nigerian prince needs your help transferring funds will share millions', category: 'spam' },
            { text: 'Hey are we still meeting for lunch tomorrow at noon', category: 'not_spam' },
            { text: 'The project deadline has been extended to next Friday', category: 'not_spam' },
            { text: 'Can you review the pull request I submitted this morning', category: 'not_spam' },
            { text: 'Thanks for sending the report it looks comprehensive', category: 'not_spam' },
            { text: 'Our team meeting has been rescheduled to three pm', category: 'not_spam' },
            { text: 'Please find attached the quarterly financial results', category: 'not_spam' },
            { text: 'I wanted to follow up on our conversation about the new feature', category: 'not_spam' },
            { text: 'The server maintenance will take place this weekend', category: 'not_spam' },
            { text: 'Happy birthday hope you have a wonderful celebration', category: 'not_spam' },
            { text: 'Reminder to submit your timesheet before end of day', category: 'not_spam' }
        ]
    },
    topic: {
        name: 'Topic Classifier',
        description: 'Classify text into topic categories',
        training: [
            { text: 'The stock market reached record highs driven by tech sector gains', category: 'business' },
            { text: 'Quarterly earnings exceeded analyst expectations by fifteen percent', category: 'business' },
            { text: 'The merger between the two companies was approved by regulators', category: 'business' },
            { text: 'Unemployment rates dropped to the lowest level in a decade', category: 'business' },
            { text: 'Venture capital funding reached new heights in the startup ecosystem', category: 'business' },
            { text: 'The team scored a buzzer beater to win the championship game', category: 'sports' },
            { text: 'The Olympic athletes broke three world records in track and field', category: 'sports' },
            { text: 'The football season opener drew millions of viewers nationwide', category: 'sports' },
            { text: 'Tennis rankings were updated after the grand slam tournament', category: 'sports' },
            { text: 'The basketball draft picks surprised many analysts and fans', category: 'sports' },
            { text: 'Scientists discovered a new species of deep sea creature', category: 'science' },
            { text: 'The Mars rover collected samples that show signs of ancient water', category: 'science' },
            { text: 'A new vaccine was developed using mRNA technology', category: 'science' },
            { text: 'Researchers published findings on quantum entanglement applications', category: 'science' },
            { text: 'Climate data shows accelerating ice sheet melting in Antarctica', category: 'science' },
            { text: 'The new programming language features improved memory safety', category: 'technology' },
            { text: 'Cloud computing adoption accelerated across enterprise organizations', category: 'technology' },
            { text: 'The latest smartphone features an advanced AI processor chip', category: 'technology' },
            { text: 'Open source contributors released a major framework update', category: 'technology' },
            { text: 'Cybersecurity researchers discovered a critical vulnerability', category: 'technology' }
        ]
    },
    sentiment_demo: {
        name: 'Review Sentiment',
        description: 'Classify product reviews as positive or negative',
        training: [
            { text: 'This product is amazing I love everything about it', category: 'positive' },
            { text: 'Best purchase I have ever made highly recommend to everyone', category: 'positive' },
            { text: 'Excellent quality and fast shipping very satisfied customer', category: 'positive' },
            { text: 'Works perfectly exactly as described would buy again', category: 'positive' },
            { text: 'Great value for money exceeded my expectations', category: 'positive' },
            { text: 'Terrible quality broke after one day of use', category: 'negative' },
            { text: 'Worst product ever do not waste your money on this', category: 'negative' },
            { text: 'Very disappointed with the product does not work as advertised', category: 'negative' },
            { text: 'Poor customer service and defective product', category: 'negative' },
            { text: 'Complete waste of money returning immediately for refund', category: 'negative' }
        ]
    }
};

class TextClassifier {
    constructor() {
        this.categories = {};
        this.vocabulary = new Set();
        this.totalDocuments = 0;
        this.trained = false;
        this.history = [];
        this.trainingData = [];
    }

    train(data) {
        if (!Array.isArray(data) || data.length === 0)
            return { error: 'Training data must be a non-empty array of {text, category} objects.' };

        const startTime = Date.now();
        this.categories = {};
        this.vocabulary = new Set();
        this.totalDocuments = 0;
        this.trainingData = data;

        for (const { text, category } of data) {
            if (!this.categories[category]) {
                this.categories[category] = { count: 0, wordCounts: {}, totalWords: 0 };
            }
            this.categories[category].count++;
            this.totalDocuments++;

            const words = this._tokenize(text);
            for (const word of words) {
                this.vocabulary.add(word);
                this.categories[category].wordCounts[word] = (this.categories[category].wordCounts[word] || 0) + 1;
                this.categories[category].totalWords++;
            }
        }

        this.trained = true;

        return {
            success: true,
            categories: Object.entries(this.categories).map(([name, data]) => ({
                name, documentCount: data.count, uniqueWords: Object.keys(data.wordCounts).length, totalWords: data.totalWords
            })),
            vocabularySize: this.vocabulary.size,
            totalDocuments: this.totalDocuments,
            processingTimeMs: Date.now() - startTime
        };
    }

    predict(text) {
        if (!this.trained) return { error: 'Classifier must be trained before prediction.' };
        if (!text || typeof text !== 'string') return { error: 'Please provide text to classify.' };

        const startTime = Date.now();
        const words = this._tokenize(text);
        const scores = {};
        const vocabSize = this.vocabulary.size;

        for (const [category, catData] of Object.entries(this.categories)) {
            // Log prior probability
            let logProb = Math.log(catData.count / this.totalDocuments);

            // Log likelihood for each word (with Laplace smoothing)
            for (const word of words) {
                const wordCount = catData.wordCounts[word] || 0;
                const prob = (wordCount + 1) / (catData.totalWords + vocabSize);
                logProb += Math.log(prob);
            }

            scores[category] = logProb;
        }

        // Convert log probabilities to probabilities
        const maxLogProb = Math.max(...Object.values(scores));
        const expScores = {};
        let totalExpScore = 0;
        for (const [cat, logProb] of Object.entries(scores)) {
            expScores[cat] = Math.exp(logProb - maxLogProb);
            totalExpScore += expScores[cat];
        }

        const probabilities = {};
        for (const [cat, expScore] of Object.entries(expScores)) {
            probabilities[cat] = Math.round((expScore / totalExpScore) * 10000) / 10000;
        }

        const predicted = Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0];
        const featureImportance = this._getFeatureImportance(words, predicted[0]);

        const result = {
            text, predictedCategory: predicted[0], confidence: predicted[1],
            probabilities, featureImportance,
            processingTimeMs: Date.now() - startTime
        };

        this.history.push({ text: text.substring(0, 80), predicted: predicted[0], confidence: predicted[1], timestamp: Date.now() });
        return result;
    }

    _tokenize(text) {
        return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 1);
    }

    _getFeatureImportance(words, category) {
        const catData = this.categories[category];
        if (!catData) return [];

        const importance = [];
        const seen = new Set();

        for (const word of words) {
            if (seen.has(word)) continue;
            seen.add(word);

            const wordCount = catData.wordCounts[word] || 0;
            const totalOtherCount = Object.entries(this.categories)
                .filter(([cat]) => cat !== category)
                .reduce((sum, [, data]) => sum + (data.wordCounts[word] || 0), 0);

            const score = Math.log((wordCount + 1) / (totalOtherCount + 1));
            importance.push({ word, score: Math.round(score * 100) / 100, frequency: wordCount, direction: score > 0 ? 'positive' : 'negative' });
        }

        return importance.sort((a, b) => Math.abs(b.score) - Math.abs(a.score)).slice(0, 15);
    }

    loadDemoDataset(datasetId) {
        const dataset = DEMO_DATASETS[datasetId];
        if (!dataset) return { error: `Unknown dataset: ${datasetId}. Available: ${Object.keys(DEMO_DATASETS).join(', ')}` };
        const trainResult = this.train(dataset.training);
        return { ...trainResult, datasetName: dataset.name, datasetDescription: dataset.description };
    }

    static getDemoDatasets() {
        return Object.entries(DEMO_DATASETS).map(([id, d]) => ({
            id, name: d.name, description: d.description, sampleCount: d.training.length,
            categories: [...new Set(d.training.map(t => t.category))]
        }));
    }

    getHistory() { return this.history.slice(-50); }
}

module.exports = TextClassifier;
