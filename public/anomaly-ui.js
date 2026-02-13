// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Anomaly Detector UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.AnomalyUI = {
    init() {
        const section = document.getElementById('anomaly-section');
        if (!section) return;
        section.innerHTML = `
            <div class="tool-header"><h2>📊 Anomaly Detector</h2><p>Detect statistical anomalies using Z-Score, IQR, or Isolation Forest</p></div>
            <div class="tool-content">
                <div class="anomaly-controls">
                    <select id="anomaly-method" class="nf-select"><option value="zscore">Z-Score</option><option value="iqr">IQR</option><option value="isolation">Isolation Forest</option></select>
                    <input type="number" id="anomaly-threshold" class="nf-input" value="2.5" step="0.5" min="1" max="5" title="Threshold" />
                    <button class="nf-btn nf-btn-secondary" id="anomaly-gen">🎲 Generate Sample Data</button>
                    <button class="nf-btn nf-btn-primary" id="anomaly-btn">📊 Detect Anomalies</button>
                </div>
                <textarea id="anomaly-input" class="nf-textarea" rows="4" placeholder="Enter comma-separated numbers, e.g.: 10, 12, 11, 13, 50, 12, 10, 11, 14, 100"></textarea>
                <div id="anomaly-output" class="nf-output"></div>
                <canvas id="anomaly-chart" width="700" height="200" style="display:none;background:rgba(0,0,0,0.2);border-radius:8px;margin-top:8px"></canvas>
            </div>`;
        document.getElementById('anomaly-btn').addEventListener('click', () => this.detect());
        document.getElementById('anomaly-gen').addEventListener('click', () => this.generateSample());
    },
    generateSample() {
        const normal = Array.from({ length: 50 }, () => Math.round(50 + (Math.random() - 0.5) * 20));
        // Inject anomalies
        normal[10] = 150; normal[25] = -30; normal[40] = 200;
        document.getElementById('anomaly-input').value = normal.join(', ');
    },
    async detect() {
        const raw = document.getElementById('anomaly-input').value;
        if (!raw) return;
        const data = raw.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
        const method = document.getElementById('anomaly-method').value;
        const threshold = parseFloat(document.getElementById('anomaly-threshold').value);
        try {
            const res = await fetch('/api/anomaly', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data, method, threshold }) });
            const result = await res.json();
            if (result.error) { document.getElementById('anomaly-output').textContent = result.error; return; }
            const anomalyIndices = new Set(result.anomalies.map(a => a.index));
            let html = `<div class="anomaly-stats"><span>Method: ${result.method}</span> • <span>Anomalies: <strong>${result.anomalyCount}</strong> / ${result.dataSize}</span> • <span>Rate: ${(result.anomalyRate * 100).toFixed(1)}%</span> • <span>${result.processingTimeMs}ms</span></div>`;
            if (result.anomalies.length) {
                html += '<div class="anomaly-list">' + result.anomalies.map(a => `<div class="anomaly-item severity-${a.severity}"><span>Index ${a.index}</span> <span>Value: ${JSON.stringify(a.values)}</span> <span class="severity">${a.severity}</span></div>`).join('') + '</div>';
            }
            document.getElementById('anomaly-output').innerHTML = html;
            this.drawChart(data, anomalyIndices);
        } catch (err) { document.getElementById('anomaly-output').textContent = 'Error: ' + err.message; }
    },
    drawChart(data, anomalyIndices) {
        const canvas = document.getElementById('anomaly-chart');
        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        const min = Math.min(...data), max = Math.max(...data);
        const range = max - min || 1;
        const stepX = w / data.length;
        // Draw line
        ctx.beginPath(); ctx.strokeStyle = 'rgba(100,180,255,0.8)'; ctx.lineWidth = 2;
        data.forEach((v, i) => { const x = i * stepX + stepX / 2; const y = h - ((v - min) / range) * (h - 20) - 10; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
        ctx.stroke();
        // Draw points
        data.forEach((v, i) => {
            const x = i * stepX + stepX / 2; const y = h - ((v - min) / range) * (h - 20) - 10;
            ctx.beginPath(); ctx.arc(x, y, anomalyIndices.has(i) ? 6 : 3, 0, Math.PI * 2);
            ctx.fillStyle = anomalyIndices.has(i) ? '#ff5252' : 'rgba(100,180,255,0.8)';
            ctx.fill();
        });
    }
};
