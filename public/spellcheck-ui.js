// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Spell Checker UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.SpellCheckUI = {
    init() {
        const section = document.getElementById('spellcheck-section');
        if (!section) return;
        section.innerHTML = `
            <div class="tool-header"><h2>✏️ Spell Checker</h2><p>Check spelling with Levenshtein distance-based suggestions</p></div>
            <div class="tool-content">
                <textarea id="spell-input" class="nf-textarea" rows="4" placeholder="Type or paste text to check spelling...">The quik brownn fox jumpd ovr the lazzy dogg.</textarea>
                <button class="nf-btn nf-btn-primary" id="spell-btn">✏️ Check Spelling</button>
                <div id="spell-output" class="nf-output"></div>
                <div id="spell-corrected" class="spell-corrected"></div>
            </div>`;
        document.getElementById('spell-btn').addEventListener('click', () => this.check());
    },
    async check() {
        const text = document.getElementById('spell-input').value;
        if (!text) return;
        try {
            const res = await fetch('/api/spellcheck', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
            const data = await res.json();
            let html = `<div class="spell-stats"><span>Words: ${data.wordCount}</span> • <span>Errors: <strong style="color:${data.errorCount > 0 ? '#ff5252' : '#4caf50'}">${data.errorCount}</strong></span> • <span>Accuracy: ${(data.accuracy * 100).toFixed(1)}%</span> • <span>${data.processingTimeMs}ms</span></div>`;
            if (data.errors.length) {
                html += '<div class="spell-errors">' + data.errors.map(e => `<div class="spell-error"><span class="misspelled">${e.word}</span> → <span class="suggestions">${e.suggestions.join(', ')}</span></div>`).join('') + '</div>';
            }
            document.getElementById('spell-output').innerHTML = html;
            document.getElementById('spell-corrected').innerHTML = data.errorCount > 0 ? `<div class="corrected-text"><strong>Corrected:</strong> ${data.corrected}</div>` : '<div class="corrected-text" style="color:#4caf50">✅ No spelling errors found!</div>';
        } catch (err) { document.getElementById('spell-output').textContent = 'Error: ' + err.message; }
    }
};
