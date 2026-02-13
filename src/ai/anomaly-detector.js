// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Anomaly Detection Engine
// Statistical anomaly detection using Z-score, IQR, and isolation methods
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AnomalyDetector {
    constructor() {
        this.history = [];
    }

    detect(data, options = {}) {
        const startTime = Date.now();
        const { method = 'zscore', threshold = 2.5, features = null } = options;

        if (!Array.isArray(data) || data.length < 3) {
            return { error: 'Data must be an array with at least 3 points' };
        }

        // If data contains objects, extract numeric features
        let numericData;
        let featureNames = [];
        if (typeof data[0] === 'object') {
            featureNames = features || Object.keys(data[0]).filter(k => typeof data[0][k] === 'number');
            numericData = data.map(d => featureNames.map(f => d[f] || 0));
        } else {
            numericData = data.map(d => [parseFloat(d) || 0]);
            featureNames = ['value'];
        }

        let result;
        switch (method) {
            case 'zscore': result = this._zscoreDetect(numericData, featureNames, threshold); break;
            case 'iqr': result = this._iqrDetect(numericData, featureNames, threshold); break;
            case 'isolation': result = this._isolationDetect(numericData, featureNames, threshold); break;
            default: result = this._zscoreDetect(numericData, featureNames, threshold);
        }

        const anomalyIndices = result.anomalies.map(a => a.index);
        const stats = this._computeStats(numericData, featureNames);

        this.history.push({ dataSize: data.length, method, anomalyCount: anomalyIndices.length, timestamp: Date.now() });

        return {
            method,
            threshold,
            dataSize: data.length,
            anomalies: result.anomalies,
            anomalyCount: anomalyIndices.length,
            anomalyRate: parseFloat((anomalyIndices.length / data.length).toFixed(4)),
            statistics: stats,
            featureImportance: result.featureImportance || {},
            processingTimeMs: Date.now() - startTime
        };
    }

    _zscoreDetect(data, features, threshold) {
        const n = data.length;
        const dim = features.length;
        const means = Array(dim).fill(0);
        const stds = Array(dim).fill(0);

        // Calculate means
        for (const row of data) { for (let j = 0; j < dim; j++) means[j] += row[j]; }
        for (let j = 0; j < dim; j++) means[j] /= n;

        // Calculate std devs
        for (const row of data) { for (let j = 0; j < dim; j++) stds[j] += (row[j] - means[j]) ** 2; }
        for (let j = 0; j < dim; j++) stds[j] = Math.sqrt(stds[j] / n) || 1;

        const anomalies = [];
        const featureAnomCount = Array(dim).fill(0);

        for (let i = 0; i < n; i++) {
            const zscores = {};
            let maxZ = 0;
            for (let j = 0; j < dim; j++) {
                const z = Math.abs((data[i][j] - means[j]) / stds[j]);
                zscores[features[j]] = parseFloat(z.toFixed(4));
                if (z > maxZ) maxZ = z;
                if (z > threshold) featureAnomCount[j]++;
            }
            if (maxZ > threshold) {
                anomalies.push({
                    index: i, values: Object.fromEntries(features.map((f, j) => [f, data[i][j]])),
                    zscores, maxZscore: parseFloat(maxZ.toFixed(4)), severity: maxZ > threshold * 2 ? 'high' : maxZ > threshold * 1.5 ? 'medium' : 'low'
                });
            }
        }

        const featureImportance = {};
        for (let j = 0; j < dim; j++) featureImportance[features[j]] = parseFloat((featureAnomCount[j] / Math.max(1, anomalies.length)).toFixed(4));

        return { anomalies, featureImportance };
    }

    _iqrDetect(data, features, multiplier) {
        const n = data.length;
        const dim = features.length;
        const anomalies = [];

        const sorted = features.map((_, j) => data.map(r => r[j]).sort((a, b) => a - b));
        const q1 = sorted.map(s => s[Math.floor(n * 0.25)]);
        const q3 = sorted.map(s => s[Math.floor(n * 0.75)]);
        const iqr = q1.map((v, i) => q3[i] - v);
        const lower = q1.map((v, i) => v - multiplier * iqr[i]);
        const upper = q3.map((v, i) => v + multiplier * iqr[i]);

        for (let i = 0; i < n; i++) {
            let isAnomaly = false;
            const deviations = {};
            for (let j = 0; j < dim; j++) {
                if (data[i][j] < lower[j] || data[i][j] > upper[j]) {
                    isAnomaly = true;
                    deviations[features[j]] = data[i][j] < lower[j] ? 'below' : 'above';
                }
            }
            if (isAnomaly) {
                anomalies.push({
                    index: i, values: Object.fromEntries(features.map((f, j) => [f, data[i][j]])),
                    deviations, severity: Object.keys(deviations).length > dim / 2 ? 'high' : 'low'
                });
            }
        }

        return { anomalies, bounds: { lower: Object.fromEntries(features.map((f, i) => [f, lower[i]])), upper: Object.fromEntries(features.map((f, i) => [f, upper[i]])) } };
    }

    _isolationDetect(data, features, threshold) {
        const n = data.length;
        const dim = features.length;
        const numTrees = 10;
        const sampleSize = Math.min(256, n);
        const scores = Array(n).fill(0);

        for (let t = 0; t < numTrees; t++) {
            const sample = [];
            for (let i = 0; i < sampleSize; i++) sample.push(Math.floor(Math.random() * n));
            for (let i = 0; i < n; i++) {
                scores[i] += this._isolationDepth(data[i], sample.map(s => data[s]), dim, 0, 10);
            }
        }

        const avgDepths = scores.map(s => s / numTrees);
        const avgC = 2 * (Math.log(sampleSize - 1) + 0.5772) - 2 * (sampleSize - 1) / sampleSize;
        const anomalyScores = avgDepths.map(d => Math.pow(2, -d / avgC));
        const anomalies = [];

        for (let i = 0; i < n; i++) {
            if (anomalyScores[i] > 0.5 + threshold * 0.1) {
                anomalies.push({
                    index: i, values: Object.fromEntries(features.map((f, j) => [f, data[i][j]])),
                    anomalyScore: parseFloat(anomalyScores[i].toFixed(4)),
                    severity: anomalyScores[i] > 0.8 ? 'high' : anomalyScores[i] > 0.6 ? 'medium' : 'low'
                });
            }
        }

        return { anomalies };
    }

    _isolationDepth(point, data, dim, depth, maxDepth) {
        if (depth >= maxDepth || data.length <= 1) return depth;
        const feat = Math.floor(Math.random() * dim);
        const vals = data.map(d => d[feat]);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        if (min === max) return depth;
        const split = min + Math.random() * (max - min);
        const left = data.filter(d => d[feat] < split);
        const right = data.filter(d => d[feat] >= split);
        return point[feat] < split
            ? this._isolationDepth(point, left, dim, depth + 1, maxDepth)
            : this._isolationDepth(point, right, dim, depth + 1, maxDepth);
    }

    _computeStats(data, features) {
        const n = data.length;
        const dim = features.length;
        const stats = {};
        for (let j = 0; j < dim; j++) {
            const col = data.map(r => r[j]).sort((a, b) => a - b);
            const mean = col.reduce((s, v) => s + v, 0) / n;
            const variance = col.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
            stats[features[j]] = {
                mean: parseFloat(mean.toFixed(4)), std: parseFloat(Math.sqrt(variance).toFixed(4)),
                min: col[0], max: col[n - 1],
                median: col[Math.floor(n / 2)],
                q1: col[Math.floor(n * 0.25)], q3: col[Math.floor(n * 0.75)]
            };
        }
        return stats;
    }

    getMethods() {
        return [
            { id: 'zscore', name: 'Z-Score', description: 'Flags data points more than N standard deviations from the mean' },
            { id: 'iqr', name: 'Interquartile Range', description: 'Uses Q1/Q3 quartiles to identify outliers beyond the IQR fence' },
            { id: 'isolation', name: 'Isolation Forest', description: 'Tree-based method that isolates anomalies faster than normal points' }
        ];
    }
}

module.exports = AnomalyDetector;
