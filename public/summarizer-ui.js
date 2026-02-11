// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Summarizer UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.SummarizerUI = (function () {
    let summarizeBtn, input, results, ratioSlider, ratioValue;

    function init() {
        summarizeBtn = document.getElementById('summarizeBtn');
        input = document.getElementById('summarizerInput');
        results = document.getElementById('summarizerResults');
        ratioSlider = document.getElementById('ratioSlider');
        ratioValue = document.getElementById('ratioValue');

        summarizeBtn.addEventListener('click', summarize);
        ratioSlider.addEventListener('input', () => { ratioValue.textContent = ratioSlider.value + '%'; });
    }

    async function summarize() {
        const text = input.value.trim();
        if (!text) return;
        summarizeBtn.disabled = true;
        summarizeBtn.textContent = 'Summarizing...';
        try {
            const ratio = parseInt(ratioSlider.value) / 100;
            const res = await fetch('/api/summarize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, ratio }) });
            const data = await res.json();
            if (data.error) { results.innerHTML = `<div class="empty-state"><span>⚠️</span><p>${data.error}</p></div>`; }
            else { renderResults(data); }
        } catch (err) {
            results.innerHTML = '<div class="empty-state"><span>❌</span><p>Error summarizing text</p></div>';
        }
        summarizeBtn.disabled = false;
        summarizeBtn.textContent = 'Summarize 📝';
    }

    function renderResults(data) {
        let html = `
            <div class="sentiment-section-title">Summary</div>
            <div class="summary-result">${data.summary}</div>
            <div class="summary-stats">
                <div class="summary-stat-item">
                    <div class="summary-stat-value">${data.statistics.compressionRatio}%</div>
                    <div class="summary-stat-label">Compression</div>
                </div>
                <div class="summary-stat-item">
                    <div class="summary-stat-value">${data.statistics.originalWords}</div>
                    <div class="summary-stat-label">Original Words</div>
                </div>
                <div class="summary-stat-item">
                    <div class="summary-stat-value">${data.statistics.summaryWords}</div>
                    <div class="summary-stat-label">Summary Words</div>
                </div>
            </div>`;

        if (data.keywords && data.keywords.length > 0) {
            html += '<div class="sentiment-section-title">Top Keywords</div><div class="keyword-tags">';
            for (const kw of data.keywords) {
                html += `<span class="keyword-tag">${kw.word} (${kw.score})</span>`;
            }
            html += '</div>';
        }

        html += '<div class="sentiment-section-title">Sentence Scores</div><div class="emotion-bars">';
        for (const sent of data.sentences.slice(0, 10)) {
            const pct = Math.round(Math.min(1, sent.score / Math.max(...data.sentences.map(s => s.score))) * 100);
            html += `
                <div class="emotion-bar-item">
                    <div class="emotion-bar-track" style="flex:1">
                        <div class="emotion-bar-fill" style="width:${pct}%;background:${sent.isSelected ? 'var(--gradient-primary)' : 'rgba(100,100,170,0.3)'}"></div>
                    </div>
                    <span class="emotion-bar-value" style="width:auto;font-size:11px">${sent.isSelected ? '✅' : ''}</span>
                </div>`;
        }
        html += '</div>';

        html += `<div style="margin-top:16px;font-size:12px;color:var(--text-muted)">${data.processingTimeMs}ms processing time</div>`;
        results.innerHTML = html;
    }

    return { init };
})();
