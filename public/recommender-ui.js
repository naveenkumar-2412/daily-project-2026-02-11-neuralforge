// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Recommender UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.RecommenderUI = {
    init() {
        const section = document.getElementById('recommender-section');
        if (!section) return;
        section.innerHTML = `
            <div class="tool-header"><h2>⭐ Content Recommender</h2><p>Get personalized content recommendations based on your interests</p></div>
            <div class="tool-content">
                <div class="rec-controls">
                    <input type="text" id="rec-interests" class="nf-input" placeholder="Enter interests (comma separated): ai, python, cybersecurity..." />
                    <div class="rec-filters">
                        <select id="rec-difficulty" class="nf-select"><option value="">Any Difficulty</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select>
                        <select id="rec-category" class="nf-select"><option value="">Any Category</option><option value="ai">AI</option><option value="programming">Programming</option><option value="science">Science</option><option value="technology">Technology</option><option value="math">Math</option><option value="philosophy">Philosophy</option><option value="health">Health</option></select>
                        <button class="nf-btn nf-btn-primary" id="rec-btn">⭐ Get Recommendations</button>
                    </div>
                </div>
                <div id="rec-output" class="rec-results"></div>
            </div>`;
        document.getElementById('rec-btn').addEventListener('click', () => this.recommend());
    },
    async recommend() {
        const interests = document.getElementById('rec-interests').value.split(',').map(s => s.trim()).filter(Boolean);
        const difficulty = document.getElementById('rec-difficulty').value || undefined;
        const category = document.getElementById('rec-category').value || undefined;
        try {
            const res = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ interests, difficulty, category, limit: 8 }) });
            const data = await res.json();
            const html = data.recommendations.map((r, i) => `
                <div class="rec-card">
                    <div class="rec-rank">#${i + 1}</div>
                    <div class="rec-info">
                        <h4>${r.title}</h4>
                        <div class="rec-tags">${r.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
                        <div class="rec-meta"><span class="badge">${r.category}</span> <span class="badge">${r.difficulty}</span> <span>⭐ ${r.rating}</span> <span>Score: ${r.score}</span></div>
                    </div>
                </div>`).join('');
            document.getElementById('rec-output').innerHTML = html || '<p>No recommendations found. Try different interests!</p>';
        } catch (err) { document.getElementById('rec-output').textContent = 'Error: ' + err.message; }
    }
};
