// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Sentiment Analysis UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.SentimentUI = (function () {
    let analyzeBtn, input, results;

    function init() {
        analyzeBtn = document.getElementById('sentimentAnalyzeBtn');
        input = document.getElementById('sentimentInput');
        results = document.getElementById('sentimentResults');
        analyzeBtn.addEventListener('click', analyze);
    }

    async function analyze() {
        const text = input.value.trim();
        if (!text) return;
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyzing...';
        try {
            const res = await fetch('/api/sentiment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
            const data = await res.json();
            renderResults(data);
        } catch (err) {
            results.innerHTML = '<div class="empty-state"><span>❌</span><p>Error analyzing sentiment</p></div>';
        }
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Sentiment 🔮';
    }

    function renderResults(data) {
        const scoreClass = data.overall.normalizedScore > 0.1 ? 'positive' : data.overall.normalizedScore < -0.1 ? 'negative' : 'neutral';
        const emoji = scoreClass === 'positive' ? '😊' : scoreClass === 'negative' ? '😔' : '😐';

        let html = `
            <div class="sentiment-score-display">
                <div class="score-circle ${scoreClass}">
                    <span>${emoji}<br><small style="font-size:14px">${data.overall.normalizedScore}</small></span>
                </div>
                <div class="score-label" style="color: var(--accent-${scoreClass === 'positive' ? 'green' : scoreClass === 'negative' ? 'red' : 'orange'})">${data.overall.label.toUpperCase()}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Confidence: ${Math.round(data.overall.confidence * 100)}%</div>
            </div>

            <div class="sentiment-section-title">Emotion Breakdown</div>
            <div class="emotion-bars">`;

        const emotionColors = { joy: '#10b981', sadness: '#3b82f6', anger: '#ef4444', fear: '#8b5cf6', surprise: '#f59e0b', disgust: '#ec4899' };
        for (const [emotion, score] of Object.entries(data.emotions)) {
            const pct = Math.round(score * 100);
            html += `
                <div class="emotion-bar-item">
                    <span class="emotion-bar-label">${emotion}</span>
                    <div class="emotion-bar-track">
                        <div class="emotion-bar-fill" style="width:${pct}%;background:${emotionColors[emotion] || '#8b5cf6'}"></div>
                    </div>
                    <span class="emotion-bar-value">${pct}%</span>
                </div>`;
        }
        html += '</div>';

        html += '<div class="sentiment-section-title">Word Analysis</div><div class="word-cloud">';
        for (const w of data.wordAnalysis) {
            if (w.score !== 0) {
                html += `<span class="word-tag ${w.category}">${w.word} (${w.score > 0 ? '+' : ''}${w.score})</span>`;
            }
        }
        html += '</div>';

        html += `<div style="margin-top:16px;font-size:12px;color:var(--text-muted)">
            ${data.statistics.wordCount} words • ${data.statistics.positiveWords} positive • ${data.statistics.negativeWords} negative • ${data.processingTimeMs}ms
        </div>`;

        results.innerHTML = html;
    }

    return { init };
})();
