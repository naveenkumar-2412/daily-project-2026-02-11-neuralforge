// ─── NetPulse Dashboard Frontend ──────────────────────────

const socket = io();
let chartInstance = null;
let selectedTargetId = null;

// ─── Clock ───────────────────────────────────────────────
function updateClock() {
    const el = document.getElementById('clock');
    if (el) {
        el.textContent = new Date().toLocaleTimeString('en-US', {
            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
}
setInterval(updateClock, 1000);
updateClock();

// ─── Socket Events ───────────────────────────────────────

socket.on('init', ({ targets, summary }) => {
    updateSummary(summary);
    renderTargets(targets);
});

socket.on('checkResult', ({ result, targets, summary }) => {
    updateSummary(summary);
    renderTargets(targets);

    // If the updated target is currently selected, refresh detail
    if (selectedTargetId === result.targetId) {
        const target = targets.find(t => t.id === result.targetId);
        if (target) showDetail(target);
    }
});

socket.on('history', ({ targetId, data }) => {
    if (targetId === selectedTargetId) {
        renderChart(data);
    }
});

// ─── Summary ─────────────────────────────────────────────

function updateSummary(summary) {
    setText('totalTargets', summary.totalTargets);
    setText('upTargets', summary.upTargets);
    setText('downTargets', summary.downTargets);
    setText('avgLatency', summary.avgResponseTimeMs + 'ms');
    setText('overallUptime', summary.overallUptime + '%');
}

// ─── Targets List ────────────────────────────────────────

function renderTargets(targets) {
    const container = document.getElementById('targetsList');
    container.innerHTML = '';

    if (targets.length === 0) {
        container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>No targets configured</p>
      </div>`;
        return;
    }

    targets.forEach(target => {
        const card = document.createElement('div');
        const isUp = target.lastCheck ? target.lastCheck.is_up : null;
        const statusClass = isUp === null ? 'is-pending' : (isUp ? 'is-up' : 'is-down');
        const dotClass = isUp === null ? 'pending' : (isUp ? 'up' : 'down');
        const activeClass = target.id === selectedTargetId ? 'active' : '';

        const latency = target.lastCheck?.response_time_ms;
        const latencyText = latency != null ? `${Math.round(latency)}ms` : '—';
        const latencyClass = latency == null ? '' :
            latency < 200 ? 'latency-fast' :
                latency < 500 ? 'latency-medium' : 'latency-slow';

        const uptimeText = target.uptime24h != null ? `${target.uptime24h}%` : '—';

        card.className = `target-card ${statusClass} ${activeClass}`;
        card.innerHTML = `
      <span class="status-dot ${dotClass}"></span>
      <div class="target-info">
        <div class="target-name">${escapeHtml(target.name)}</div>
        <div class="target-url">${escapeHtml(target.url)}</div>
      </div>
      <div class="target-stats">
        <span class="target-latency ${latencyClass}">${latencyText}</span>
        <span class="target-uptime">↑ ${uptimeText}</span>
      </div>`;

        card.addEventListener('click', () => {
            selectedTargetId = target.id;
            renderTargets(targets);
            showDetail(target);
            socket.emit('requestHistory', { targetId: target.id, hours: 24 });
        });

        container.appendChild(card);
    });
}

// ─── Detail Panel ────────────────────────────────────────

function showDetail(target) {
    const panel = document.getElementById('detailPanel');
    const isUp = target.lastCheck ? target.lastCheck.is_up : null;
    const statusText = isUp === null ? 'PENDING' : (isUp ? 'HEALTHY' : 'DOWN');
    const badgeClass = isUp === null ? '' : (isUp ? 'up' : 'down');

    const latency = target.lastCheck?.response_time_ms;
    const statusCode = target.lastCheck?.status_code;
    const sslDays = target.lastCheck?.ssl_days_remaining;
    const errorText = target.lastCheck?.error;

    panel.innerHTML = `
    <div class="detail-header">
      <span class="detail-title">${escapeHtml(target.name)}</span>
      <span class="detail-badge ${badgeClass}">${statusText}</span>
    </div>

    <div class="detail-meta">
      <div class="meta-item">
        <span class="meta-value ${getLatencyClass(latency)}">${latency != null ? Math.round(latency) + 'ms' : '—'}</span>
        <span class="meta-label">Latency</span>
      </div>
      <div class="meta-item">
        <span class="meta-value">${statusCode || '—'}</span>
        <span class="meta-label">Status</span>
      </div>
      <div class="meta-item">
        <span class="meta-value">${target.uptime24h != null ? target.uptime24h + '%' : '—'}</span>
        <span class="meta-label">Uptime 24h</span>
      </div>
      <div class="meta-item">
        <span class="meta-value" style="color: ${getSslColor(sslDays)}">${sslDays != null ? sslDays + 'd' : '—'}</span>
        <span class="meta-label">SSL Expiry</span>
      </div>
    </div>

    ${errorText ? `<div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:12px;margin-bottom:16px;font-size:13px;color:var(--red);">⚠️ ${escapeHtml(errorText)}</div>` : ''}

    <h3 style="font-size:13px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Response Time (24h)</h3>
    <div class="chart-container">
      <canvas id="responseChart"></canvas>
    </div>`;
}

// ─── Chart ───────────────────────────────────────────────

function renderChart(data) {
    const canvas = document.getElementById('responseChart');
    if (!canvas) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const labels = data.map(d => {
        const date = new Date(d.checked_at + 'Z');
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    });

    const values = data.map(d => d.response_time_ms);
    const statuses = data.map(d => d.is_up);

    const pointColors = statuses.map(s => s ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)');

    chartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Response Time (ms)',
                data: values,
                borderColor: 'rgba(99, 102, 241, 0.8)',
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                pointBackgroundColor: pointColors,
                pointBorderColor: pointColors,
                pointRadius: 3,
                pointHoverRadius: 6,
                borderWidth: 2,
                fill: true,
                tension: 0.35
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                    borderWidth: 1,
                    cornerRadius: 10,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (ctx) => {
                            const idx = ctx.dataIndex;
                            const status = statuses[idx] ? '✅ UP' : '❌ DOWN';
                            return [`${status}`, `Latency: ${Math.round(ctx.raw)}ms`];
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(99, 102, 241, 0.06)' },
                    ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 12 }
                },
                y: {
                    grid: { color: 'rgba(99, 102, 241, 0.06)' },
                    ticks: { color: '#64748b', font: { size: 10 }, callback: v => v + 'ms' },
                    beginAtZero: true
                }
            }
        }
    });
}

// ─── Helpers ─────────────────────────────────────────────

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getLatencyClass(ms) {
    if (ms == null) return '';
    if (ms < 200) return 'latency-fast';
    if (ms < 500) return 'latency-medium';
    return 'latency-slow';
}

function getSslColor(days) {
    if (days == null) return 'var(--text-muted)';
    if (days > 30) return 'var(--green)';
    if (days > 7) return 'var(--yellow)';
    return 'var(--red)';
}
