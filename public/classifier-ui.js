// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Text Classifier UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.ClassifierUI = (function () {
    let classifyBtn, trainBtn, datasetSelect, input, results, trainingInfo;

    function init() {
        classifyBtn = document.getElementById('classifyBtn');
        trainBtn = document.getElementById('trainClassifierBtn');
        datasetSelect = document.getElementById('classifierDataset');
        input = document.getElementById('classifierInput');
        results = document.getElementById('classifierResults');
        trainingInfo = document.getElementById('trainingInfo');

        classifyBtn.addEventListener('click', classify);
        trainBtn.addEventListener('click', trainModel);
    }

    async function trainModel() {
        trainBtn.disabled = true;
        trainBtn.textContent = 'Training...';
        try {
            const res = await fetch('/api/classify/train', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataset: datasetSelect.value })
            });
            const data = await res.json();
            trainingInfo.innerHTML = `<p>✅ Model trained with ${data.totalDocuments} documents across ${data.categories.length} categories: ${data.categories.join(', ')}</p>`;
            trainingInfo.style.borderColor = 'rgba(16,185,129,0.3)';
            trainingInfo.style.background = 'rgba(16,185,129,0.08)';
            trainingInfo.style.color = 'var(--accent-green)';
        } catch (err) {
            trainingInfo.innerHTML = '<p>❌ Error training model</p>';
        }
        trainBtn.disabled = false;
        trainBtn.textContent = 'Train Model';
    }

    async function classify() {
        const text = input.value.trim();
        if (!text) return;
        classifyBtn.disabled = true;
        classifyBtn.textContent = 'Classifying...';
        try {
            const res = await fetch('/api/classify/predict', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();
            if (data.error) { results.innerHTML = `<div class="empty-state"><span>⚠️</span><p>${data.error}</p></div>`; }
            else { renderResults(data); }
        } catch (err) {
            results.innerHTML = '<div class="empty-state"><span>❌</span><p>Error classifying text</p></div>';
        }
        classifyBtn.disabled = false;
        classifyBtn.textContent = 'Classify 🏷️';
    }

    function renderResults(data) {
        let html = `
            <div style="text-align:center;padding:16px">
                <div style="font-size:48px;margin-bottom:8px">${data.prediction === 'spam' ? '🚫' : data.prediction === 'positive' ? '⭐' : '🏷️'}</div>
                <div style="font-size:20px;font-weight:800;text-transform:uppercase;letter-spacing:1px;background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${data.prediction}</div>
                <div style="font-size:13px;color:var(--text-muted);margin-top:4px">Confidence: ${Math.round(data.confidence * 100)}%</div>
            </div>
            <div class="sentiment-section-title">Category Scores</div>
            <div class="confidence-bars">`;

        for (const [cat, prob] of Object.entries(data.probabilities)) {
            const pct = Math.round(prob * 100);
            const isPrimary = cat === data.prediction;
            html += `
                <div class="confidence-item">
                    <span class="confidence-category">${cat}</span>
                    <div class="confidence-track">
                        <div class="confidence-fill ${isPrimary ? 'primary' : 'secondary'}" style="width:${pct}%">${pct}%</div>
                    </div>
                </div>`;
        }
        html += '</div>';

        if (data.topFeatures && data.topFeatures.length > 0) {
            html += '<div class="sentiment-section-title">Key Features</div><div class="feature-words">';
            for (const f of data.topFeatures) {
                const cls = f.influence > 0 ? 'positive' : 'negative';
                html += `<span class="feature-word ${cls}">${f.word} (${f.influence > 0 ? '+' : ''}${f.influence.toFixed(2)})</span>`;
            }
            html += '</div>';
        }

        html += `<div style="margin-top:16px;font-size:12px;color:var(--text-muted)">${data.processingTimeMs}ms processing</div>`;
        results.innerHTML = html;
    }

    return { init };
})();
