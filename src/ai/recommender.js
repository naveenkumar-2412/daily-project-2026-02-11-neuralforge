// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Content Recommendation Engine
// Content-based filtering with TF-IDF similarity and user preference tracking
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CONTENT_DB = [
    { id: 1, title: 'Introduction to Machine Learning', category: 'ai', tags: ['ml', 'beginner', 'algorithms'], difficulty: 'beginner', rating: 4.8 },
    { id: 2, title: 'Deep Learning with Neural Networks', category: 'ai', tags: ['deep-learning', 'neural-networks', 'advanced'], difficulty: 'advanced', rating: 4.7 },
    { id: 3, title: 'Natural Language Processing Fundamentals', category: 'ai', tags: ['nlp', 'text', 'tokenization'], difficulty: 'intermediate', rating: 4.5 },
    { id: 4, title: 'Computer Vision and Image Recognition', category: 'ai', tags: ['cv', 'images', 'cnn'], difficulty: 'intermediate', rating: 4.6 },
    { id: 5, title: 'Reinforcement Learning from Scratch', category: 'ai', tags: ['rl', 'agents', 'q-learning'], difficulty: 'advanced', rating: 4.4 },
    { id: 6, title: 'JavaScript Modern Best Practices', category: 'programming', tags: ['javascript', 'es6', 'best-practices'], difficulty: 'intermediate', rating: 4.9 },
    { id: 7, title: 'Python for Data Science', category: 'programming', tags: ['python', 'data-science', 'pandas'], difficulty: 'beginner', rating: 4.8 },
    { id: 8, title: 'React.js Complete Guide', category: 'programming', tags: ['react', 'frontend', 'hooks'], difficulty: 'intermediate', rating: 4.7 },
    { id: 9, title: 'Node.js Backend Development', category: 'programming', tags: ['nodejs', 'backend', 'express'], difficulty: 'intermediate', rating: 4.6 },
    { id: 10, title: 'Database Design Patterns', category: 'programming', tags: ['database', 'sql', 'design'], difficulty: 'intermediate', rating: 4.5 },
    { id: 11, title: 'Quantum Physics Explained', category: 'science', tags: ['quantum', 'physics', 'particles'], difficulty: 'advanced', rating: 4.3 },
    { id: 12, title: 'The Human Brain and Neurons', category: 'science', tags: ['neuroscience', 'brain', 'biology'], difficulty: 'intermediate', rating: 4.6 },
    { id: 13, title: 'Space Exploration History', category: 'science', tags: ['space', 'nasa', 'exploration'], difficulty: 'beginner', rating: 4.7 },
    { id: 14, title: 'Climate Change and Technology', category: 'science', tags: ['climate', 'environment', 'tech'], difficulty: 'beginner', rating: 4.4 },
    { id: 15, title: 'Genetics and DNA Sequencing', category: 'science', tags: ['genetics', 'dna', 'biology'], difficulty: 'intermediate', rating: 4.5 },
    { id: 16, title: 'Cybersecurity Fundamentals', category: 'technology', tags: ['security', 'hacking', 'encryption'], difficulty: 'beginner', rating: 4.8 },
    { id: 17, title: 'Cloud Architecture with AWS', category: 'technology', tags: ['cloud', 'aws', 'devops'], difficulty: 'intermediate', rating: 4.6 },
    { id: 18, title: 'Blockchain and Crypto Explained', category: 'technology', tags: ['blockchain', 'crypto', 'web3'], difficulty: 'beginner', rating: 4.3 },
    { id: 19, title: 'Introduction to Statistics', category: 'math', tags: ['statistics', 'probability', 'data'], difficulty: 'beginner', rating: 4.5 },
    { id: 20, title: 'Linear Algebra for ML', category: 'math', tags: ['linear-algebra', 'matrices', 'ml'], difficulty: 'intermediate', rating: 4.7 },
    { id: 21, title: 'Calculus Made Simple', category: 'math', tags: ['calculus', 'derivatives', 'integrals'], difficulty: 'beginner', rating: 4.4 },
    { id: 22, title: 'Ethics of Artificial Intelligence', category: 'philosophy', tags: ['ethics', 'ai', 'society'], difficulty: 'beginner', rating: 4.6 },
    { id: 23, title: 'Philosophy of Consciousness', category: 'philosophy', tags: ['consciousness', 'mind', 'philosophy'], difficulty: 'advanced', rating: 4.5 },
    { id: 24, title: 'Meditation and Mindfulness Guide', category: 'health', tags: ['meditation', 'mental-health', 'mindfulness'], difficulty: 'beginner', rating: 4.9 },
    { id: 25, title: 'Exercise Science and Fitness', category: 'health', tags: ['exercise', 'fitness', 'health'], difficulty: 'beginner', rating: 4.7 },
];

class Recommender {
    constructor() {
        this.content = CONTENT_DB;
        this.userPreferences = {};
        this.interactionHistory = [];
    }

    recommend(preferences = {}) {
        const startTime = Date.now();
        const {
            interests = [],
            difficulty = null,
            category = null,
            excludeIds = [],
            limit = 5
        } = preferences;

        let scored = this.content
            .filter(item => !excludeIds.includes(item.id))
            .map(item => {
                let score = item.rating * 10;

                // Category match
                if (category && item.category === category) score += 30;

                // Difficulty match
                if (difficulty && item.difficulty === difficulty) score += 20;

                // Interest/tag overlap
                for (const interest of interests) {
                    const il = interest.toLowerCase();
                    if (item.tags.some(t => t.includes(il) || il.includes(t))) score += 25;
                    if (item.title.toLowerCase().includes(il)) score += 15;
                    if (item.category.includes(il)) score += 10;
                }

                // Boost based on user history (collaborative-ish)
                const historyCategories = this.interactionHistory.map(h => h.category);
                if (historyCategories.includes(item.category)) score += 10;

                return { ...item, score: parseFloat(score.toFixed(2)) };
            });

        scored.sort((a, b) => b.score - a.score);
        const recommendations = scored.slice(0, limit);

        return {
            recommendations,
            totalCandidates: this.content.length,
            filters: { interests, difficulty, category },
            algorithm: 'content-based-filtering',
            processingTimeMs: Date.now() - startTime
        };
    }

    recordInteraction(itemId, type = 'view') {
        const item = this.content.find(c => c.id === itemId);
        if (item) {
            this.interactionHistory.push({
                itemId, type, category: item.category,
                timestamp: Date.now()
            });
        }
        return { success: true, historyLength: this.interactionHistory.length };
    }

    getSimilar(itemId, limit = 5) {
        const item = this.content.find(c => c.id === itemId);
        if (!item) return { error: 'Item not found' };

        const scored = this.content
            .filter(c => c.id !== itemId)
            .map(c => {
                let sim = 0;
                if (c.category === item.category) sim += 0.4;
                if (c.difficulty === item.difficulty) sim += 0.2;
                const tagOverlap = c.tags.filter(t => item.tags.includes(t)).length;
                sim += (tagOverlap / Math.max(c.tags.length, item.tags.length)) * 0.4;
                return { ...c, similarity: parseFloat(sim.toFixed(4)) };
            });

        scored.sort((a, b) => b.similarity - a.similarity);
        return { item, similar: scored.slice(0, limit) };
    }

    getCategories() {
        const cats = {};
        for (const item of this.content) {
            if (!cats[item.category]) cats[item.category] = 0;
            cats[item.category]++;
        }
        return cats;
    }
}

module.exports = Recommender;
