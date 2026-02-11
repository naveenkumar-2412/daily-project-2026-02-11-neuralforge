// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Code Analyzer UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.CodeAnalyzerUI = (function () {
    let analyzeBtn, codeInput, langSelect, results;

    function init() {
        analyzeBtn = document.getElementById('codeAnalyzeBtn');
        codeInput = document.getElementById('codeInput');
        langSelect = document.getElementById('codeLangSelect');
        results = document.getElementById('codeResults');
        analyzeBtn.addEventListener('click', analyze);
        // Tab support in textarea
        codeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') { e.preventDefault(); const s = codeInput.selectionStart; codeInput.value = codeInput.value.substring(0, s) + '  ' + codeInput.value.substring(codeInput.selectionEnd); codeInput.selectionStart = codeInput.selectionEnd = s + 2; }
        });
    }

    async function analyze() {
        const code = codeInput.value.trim();
        if (!code) return;
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyzing...';
        try {
            const lang = langSelect.value || undefined;
            const res = await fetch('/api/code-analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, language: lang }) });
            const data = await res.json();
            renderResults(data);
        } catch (err) {
            results.innerHTML = '<div class="empty-state"><span>❌</span><p>Error analyzing code</p></div>';
        }
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Code 🔍';
    }

    function renderResults(data) {
        const qs = data.qualityScore;
        let html = `
            <div class="code-quality-badge">
                <div class="quality-circle quality-${qs.grade}">${qs.grade}</div>
                <div style="font-size:14px;font-weight:600;color:var(--text-primary)">${qs.label} (${qs.overall}/100)</div>
                <div style="font-size:12px;color:var(--text-muted)">${data.language.toUpperCase()} detected</div>
            </div>
            <div class="code-metrics">
                <div class="code-metric"><span class="code-metric-label">Cyclomatic</span><span class="code-metric-value">${data.complexity.cyclomatic}</span></div>
                <div class="code-metric"><span class="code-metric-label">Cognitive</span><span class="code-metric-value">${data.complexity.cognitive}</span></div>
                <div class="code-metric"><span class="code-metric-label">Max Nesting</span><span class="code-metric-value">${data.complexity.maxNesting}</span></div>
                <div class="code-metric"><span class="code-metric-label">Lines</span><span class="code-metric-value">${data.metrics.totalLines}</span></div>
                <div class="code-metric"><span class="code-metric-label">Code Lines</span><span class="code-metric-value">${data.metrics.codeLines}</span></div>
                <div class="code-metric"><span class="code-metric-label">Comments</span><span class="code-metric-value">${data.metrics.commentRatio}%</span></div>
            </div>`;

        if (data.issues.length > 0) {
            html += `<div class="sentiment-section-title">Issues (${data.issues.length})</div><div class="issue-list">`;
            for (const issue of data.issues.slice(0, 20)) {
                html += `<div class="issue-item ${issue.severity}">
                    <span class="issue-line">L${issue.line}</span>
                    <span class="issue-message">${issue.message}</span>
                </div>`;
            }
            html += '</div>';
        }

        if (data.suggestions.length > 0) {
            html += '<div class="sentiment-section-title">Suggestions</div>';
            for (const sug of data.suggestions) {
                const icon = sug.priority === 'high' ? '🔴' : sug.priority === 'medium' ? '🟡' : '🟢';
                html += `<div style="padding:8px 0;font-size:13px;color:var(--text-secondary)">${icon} ${sug.message}</div>`;
            }
        }

        html += `<div style="margin-top:16px;font-size:12px;color:var(--text-muted)">${data.functions.length} functions • ${data.classes.length} classes • ${data.processingTimeMs}ms</div>`;
        results.innerHTML = html;
    }

    return { init };
})();
