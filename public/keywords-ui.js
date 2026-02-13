// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Keyword Extractor UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.KeywordsUI = {
    init() {
        const section = document.getElementById('keywords-section');
        if (!section) return;
        section.innerHTML = `
            <div class="tool-header"><h2>🔑 Keyword Extractor</h2><p>Extract key phrases using TF-IDF, TextRank, or frequency analysis</p></div>
            <div class="tool-content">
                <textarea id="kw-input" class="nf-textarea" rows="5" placeholder="Paste an article or paragraph to extract keywords...">Artificial intelligence and machine learning are transforming the technology landscape. Deep learning neural networks power modern AI systems including large language models. Natural language processing enables computers to understand human language, while computer vision allows machines to interpret visual data.</textarea>
                <div class="kw-controls">
                    <select id="kw-method" class="nf-select"><option value="tfidf">TF-IDF</option><option value="textrank">TextRank</option><option value="frequency">Frequency</option></select>
                    <input type="number" id="kw-max" class="nf-input" value="10" min="3" max="30" title="Max keywords" style="width:80px" />
                    <button class="nf-btn nf-btn-primary" id="kw-btn">🔑 Extract Keywords</button>
                </div>
                <div id="kw-output" class="kw-results"></div>
            </div>`;
        document.getElementById('kw-btn').addEventListener('click', () => this.extract());
    },
    async extract() {
        const text = document.getElementById('kw-input').value;
        if (!text) return;
        const method = document.getElementById('kw-method').value;
        const maxKeywords = parseInt(document.getElementById('kw-max').value) || 10;
        try {
            const res = await fetch('/api/keywords', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, method, maxKeywords }) });
            const data = await res.json();
            const maxScore = Math.max(...data.keywords.map(k => k.score));
            let html = `<div class="kw-meta"><span>Method: ${data.method}</span> • <span>Words: ${data.wordCount}</span> • <span>Unique: ${data.uniqueWords}</span> • <span>${data.processingTimeMs}ms</span></div>`;
            html += '<div class="kw-bars">';
            for (const kw of data.keywords) {
                const pct = (kw.score / maxScore * 100).toFixed(0);
                html += `<div class="kw-bar-row"><span class="kw-label">${kw.keyword}</span><div class="kw-bar-bg"><div class="kw-bar-fill" style="width:${pct}%"></div></div><span class="kw-score">${kw.score.toFixed(4)}</span><span class="kw-type badge">${kw.type}</span></div>`;
            }
            html += '</div>';
            document.getElementById('kw-output').innerHTML = html;
        } catch (err) { document.getElementById('kw-output').textContent = 'Error: ' + err.message; }
    }
};
