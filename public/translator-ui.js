// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Translator UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.TranslatorUI = {
    init() {
        const section = document.getElementById('translator-section');
        if (!section) return;
        section.innerHTML = `
            <div class="tool-header"><h2>🌍 Multi-Language Translator</h2><p>Translate text between 6 languages with auto-detection</p></div>
            <div class="tool-grid">
                <div class="tool-input-area">
                    <div class="lang-selectors">
                        <select id="translate-from" class="nf-select"><option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option><option value="ja">Japanese</option><option value="hi">Hindi</option></select>
                        <button class="nf-btn-icon" id="swap-langs" title="Swap">⇄</button>
                        <select id="translate-to" class="nf-select"><option value="es" selected>Spanish</option><option value="en">English</option><option value="fr">French</option><option value="de">German</option><option value="ja">Japanese</option><option value="hi">Hindi</option></select>
                    </div>
                    <textarea id="translate-input" class="nf-textarea" rows="5" placeholder="Enter text to translate..."></textarea>
                    <button class="nf-btn nf-btn-primary" id="translate-btn">🌍 Translate</button>
                </div>
                <div class="tool-output-area">
                    <div id="translate-output" class="nf-output">Translation will appear here...</div>
                    <div id="translate-meta" class="nf-meta"></div>
                </div>
            </div>`;
        document.getElementById('translate-btn').addEventListener('click', () => this.translate());
        document.getElementById('swap-langs').addEventListener('click', () => this.swapLanguages());
    },
    swapLanguages() {
        const from = document.getElementById('translate-from');
        const to = document.getElementById('translate-to');
        const temp = from.value;
        from.value = to.value;
        to.value = temp;
    },
    async translate() {
        const text = document.getElementById('translate-input').value;
        if (!text) return;
        const from = document.getElementById('translate-from').value;
        const to = document.getElementById('translate-to').value;
        try {
            const res = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, from, to }) });
            const data = await res.json();
            document.getElementById('translate-output').innerHTML = `<div class="translated-text">${data.translated || data.error}</div>`;
            document.getElementById('translate-meta').innerHTML = `<span>Coverage: ${(data.coverage * 100).toFixed(1)}%</span> • <span>Words: ${data.wordCount}</span> • <span>${data.processingTimeMs}ms</span>`;
        } catch (err) { document.getElementById('translate-output').textContent = 'Error: ' + err.message; }
    }
};
