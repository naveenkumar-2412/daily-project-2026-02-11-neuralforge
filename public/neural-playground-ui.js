// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Neural Network Playground UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.NeuralPlaygroundUI = (function () {
    let trainBtn, datasetSelect, activationSelect, lrSlider, lrValue, epochSlider, epochValue;
    let boundaryCanvas, boundaryCtx, lossCanvas, lossCtx;
    let trainLoss, trainAccuracy, trainEpoch;
    let isTraining = false;

    function init() {
        trainBtn = document.getElementById('neuralTrainBtn');
        datasetSelect = document.getElementById('neuralDataset');
        activationSelect = document.getElementById('neuralActivation');
        lrSlider = document.getElementById('neuralLR');
        lrValue = document.getElementById('lrValue');
        epochSlider = document.getElementById('neuralEpochs');
        epochValue = document.getElementById('epochValue');
        boundaryCanvas = document.getElementById('boundaryCanvas');
        boundaryCtx = boundaryCanvas.getContext('2d');
        lossCanvas = document.getElementById('lossCanvas');
        lossCtx = lossCanvas.getContext('2d');
        trainLoss = document.getElementById('trainLoss');
        trainAccuracy = document.getElementById('trainAccuracy');
        trainEpoch = document.getElementById('trainEpoch');

        trainBtn.addEventListener('click', startTraining);
        lrSlider.addEventListener('input', () => { lrValue.textContent = (parseInt(lrSlider.value) / 100).toFixed(2); });
        epochSlider.addEventListener('input', () => { epochValue.textContent = epochSlider.value; });

        // Set canvas sizes
        boundaryCanvas.width = 400; boundaryCanvas.height = 400;
        lossCanvas.width = 400; lossCanvas.height = 300;
        drawEmptyBoundary();
    }

    function drawEmptyBoundary() {
        boundaryCtx.fillStyle = '#0a0a1a';
        boundaryCtx.fillRect(0, 0, 400, 400);
        boundaryCtx.fillStyle = '#6868aa';
        boundaryCtx.font = '14px Inter';
        boundaryCtx.textAlign = 'center';
        boundaryCtx.fillText('Train a network to see the decision boundary', 200, 200);
    }

    async function startTraining() {
        if (isTraining) return;
        isTraining = true;
        trainBtn.disabled = true;
        trainBtn.textContent = '⏳ Training...';

        const layerInputs = document.querySelectorAll('.layer-input');
        const hiddenLayers = Array.from(layerInputs).map(i => parseInt(i.value) || 4);
        const layers = [2, ...hiddenLayers, 1];

        const config = {
            dataset: datasetSelect.value,
            layers,
            activation: activationSelect.value,
            learningRate: parseInt(lrSlider.value) / 100,
            epochs: parseInt(epochSlider.value)
        };

        try {
            const res = await fetch('/api/neural/train', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const data = await res.json();
            if (data.error) { alert(data.error); return; }

            // Draw loss chart
            drawLossChart(data.history);

            // Draw decision boundary
            drawBoundary(data.boundary, data.dataset);

            // Update stats
            const last = data.history[data.history.length - 1];
            if (last) {
                trainLoss.textContent = last.loss.toFixed(4);
                trainAccuracy.textContent = last.accuracy.toFixed(1) + '%';
                trainEpoch.textContent = last.epoch;
            }
        } catch (err) {
            console.error('Training error:', err);
        }

        isTraining = false;
        trainBtn.disabled = false;
        trainBtn.textContent = '🚀 Train Network';
    }

    function drawLossChart(history) {
        const w = lossCanvas.width, h = lossCanvas.height;
        const ctx = lossCtx;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, w, h);

        if (history.length < 2) return;

        const pad = { top: 20, right: 20, bottom: 30, left: 50 };
        const plotW = w - pad.left - pad.right;
        const plotH = h - pad.top - pad.bottom;

        const maxLoss = Math.max(...history.map(h => h.loss));
        const maxEpoch = Math.max(...history.map(h => h.epoch));

        // Grid lines
        ctx.strokeStyle = 'rgba(100,100,170,0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + (plotH / 4) * i;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
        }

        // Loss line
        ctx.beginPath();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        for (let i = 0; i < history.length; i++) {
            const x = pad.left + (history[i].epoch / maxEpoch) * plotW;
            const y = pad.top + (1 - history[i].loss / (maxLoss || 1)) * plotH;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Accuracy line
        ctx.beginPath();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        for (let i = 0; i < history.length; i++) {
            const x = pad.left + (history[i].epoch / maxEpoch) * plotW;
            const y = pad.top + (1 - history[i].accuracy / 100) * plotH;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#6868aa';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Epoch', w / 2, h - 5);
        ctx.fillStyle = '#8b5cf6'; ctx.fillText('Loss', pad.left + 30, pad.top - 5);
        ctx.fillStyle = '#10b981'; ctx.fillText('Accuracy', pad.left + 100, pad.top - 5);
    }

    function drawBoundary(points, datasetId) {
        const w = boundaryCanvas.width, h = boundaryCanvas.height;
        const ctx = boundaryCtx;
        ctx.clearRect(0, 0, w, h);

        if (!points || points.length === 0) { drawEmptyBoundary(); return; }

        const res = Math.ceil(Math.sqrt(points.length));
        const cellW = w / res, cellH = h / res;

        for (const point of points) {
            const px = ((point.x + 1) / 2) * w;
            const py = ((1 - (point.y + 1) / 2)) * h;
            const v = point.value;

            // Color: blue for 0, orange for 1, with smooth gradient
            const r = Math.round(139 * v + 6 * (1 - v));
            const g = Math.round(92 * v + 182 * (1 - v));
            const b = Math.round(246 * v + 212 * (1 - v));
            ctx.fillStyle = `rgba(${r},${g},${b},0.6)`;
            ctx.fillRect(px - cellW / 2, py - cellH / 2, cellW + 1, cellH + 1);
        }

        // Decision boundary contour at 0.5
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        for (const point of points) {
            if (Math.abs(point.value - 0.5) < 0.1) {
                const px = ((point.x + 1) / 2) * w;
                const py = ((1 - (point.y + 1) / 2)) * h;
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    return { init };
})();
