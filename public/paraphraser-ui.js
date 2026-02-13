// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Paraphraser UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.ParaphraserUI = {
    init() {
        const section = document.getElementById('paraphraser-section');
        if (!section) return;
        section.innerHTML = `
            <div class="tool-header"><h2>🔄 Text Paraphraser</h2><p>Rewrite text with synonym replacement at three intensity levels</p></div>
            <div class="tool-grid">
                <div class="tool-input-area">
                    <textarea id="para-input" class="nf-textarea" rows="5" placeholder="Enter text to paraphrase...">The important project will make a big change. We need to find a good solution quickly and help many people.</textarea>
                    <div class="para-controls">
                        <select id="para-intensity" class="nf-select"><option value="low">🟢 Light (20%)</option><option value="medium" selected>🟡 Moderate (40%)</option><option value="high">🔴 Heavy (70%)</option></select>
                        <button class="nf-btn nf-btn-primary" id="para-btn">🔄 Paraphrase</button>
                    </div>
                </div>
                <div class="tool-output-area">
                    <div id="para-output" class="nf-output">Paraphrased text will appear here...</div>
                    <div id="para-meta" class="nf-meta"></div>
                    <div id="para-replacements" class="para-replacements"></div>
                </div>
            </div>`;
        document.getElementById('para-btn').addEventListener('click', () => this.paraphrase());
    },
    async paraphrase() {
        const text = document.getElementById('para-input').value;
        if (!text) return;
        const intensity = document.getElementById('para-intensity').value;
        try {
            const res = await fetch('/api/paraphrase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, intensity }) });
            const data = await res.json();
            document.getElementById('para-output').innerHTML = `<div class="paraphrased-text">${data.paraphrased}</div>`;
            document.getElementById('para-meta').innerHTML = `<span>Similarity: ${(data.similarity * 100).toFixed(1)}%</span> • <span>Replacements: ${data.replacementCount}</span> • <span>${data.processingTimeMs}ms</span>`;
            if (data.replacements.length) {
                document.getElementById('para-replacements').innerHTML = '<div class="replacement-list">' + data.replacements.map(r => `<span class="replacement"><s>${r.original}</s> → <strong>${r.replacement}</strong></span>`).join(' ') + '</div>';
            }
        } catch (err) { document.getElementById('para-output').textContent = 'Error: ' + err.message; }
    }
};
