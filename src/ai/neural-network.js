// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Neural Network Engine
// Full feedforward NN with backpropagation, built from scratch
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Activation Functions ────────────────────────────────────────────────────
const activations = {
    sigmoid: { fn: x => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))), derivative: y => y * (1 - y) },
    tanh: { fn: x => Math.tanh(x), derivative: y => 1 - y * y },
    relu: { fn: x => Math.max(0, x), derivative: y => y > 0 ? 1 : 0 },
    leakyRelu: { fn: x => x > 0 ? x : 0.01 * x, derivative: y => y > 0 ? 1 : 0.01 },
    swish: { fn: x => { const s = 1 / (1 + Math.exp(-x)); return x * s; }, derivative: y => { /* approx */ return y + (1 - y) * 0.1; } }
};

// ─── Built-in Datasets ──────────────────────────────────────────────────────
const DATASETS = {
    xor: { name: 'XOR Gate', inputs: [[0, 0], [0, 1], [1, 0], [1, 1]], outputs: [[0], [1], [1], [0]], inputSize: 2, outputSize: 1 },
    and: { name: 'AND Gate', inputs: [[0, 0], [0, 1], [1, 0], [1, 1]], outputs: [[0], [0], [0], [1]], inputSize: 2, outputSize: 1 },
    or: { name: 'OR Gate', inputs: [[0, 0], [0, 1], [1, 0], [1, 1]], outputs: [[0], [1], [1], [1]], inputSize: 2, outputSize: 1 },
    circle: (() => {
        const inputs = [], outputs = [];
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 2 - 1, y = Math.random() * 2 - 1;
            inputs.push([x, y]);
            outputs.push([Math.sqrt(x * x + y * y) < 0.6 ? 1 : 0]);
        }
        return { name: 'Circle', inputs, outputs, inputSize: 2, outputSize: 1 };
    })(),
    spiral: (() => {
        const inputs = [], outputs = [];
        for (let c = 0; c < 2; c++) {
            for (let i = 0; i < 100; i++) {
                const r = i / 100 * 0.8, t = c * Math.PI + r * 4 * Math.PI + (Math.random() * 0.2 - 0.1);
                inputs.push([r * Math.cos(t), r * Math.sin(t)]);
                outputs.push([c]);
            }
        }
        return { name: 'Spiral', inputs, outputs, inputSize: 2, outputSize: 1 };
    })(),
    gaussian: (() => {
        const inputs = [], outputs = [];
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 2 - 1, y = Math.random() * 2 - 1;
            inputs.push([x, y]);
            outputs.push([Math.exp(-(x * x + y * y) / 0.3) > 0.5 ? 1 : 0]);
        }
        return { name: 'Gaussian', inputs, outputs, inputSize: 2, outputSize: 1 };
    })()
};

class NeuralNetwork {
    constructor(layerSizes, activationName = 'sigmoid', learningRate = 0.5) {
        this.layerSizes = layerSizes;
        this.activation = activations[activationName] || activations.sigmoid;
        this.activationName = activationName;
        this.learningRate = learningRate;
        this.weights = [];
        this.biases = [];
        this.trainingHistory = [];
        this._initWeights();
    }

    _initWeights() {
        this.weights = [];
        this.biases = [];
        for (let i = 0; i < this.layerSizes.length - 1; i++) {
            const rows = this.layerSizes[i + 1], cols = this.layerSizes[i];
            const scale = Math.sqrt(2.0 / cols); // He initialization
            const w = [];
            for (let r = 0; r < rows; r++) {
                const row = [];
                for (let c = 0; c < cols; c++) {
                    row.push((Math.random() * 2 - 1) * scale);
                }
                w.push(row);
            }
            this.weights.push(w);
            this.biases.push(new Array(rows).fill(0).map(() => (Math.random() * 0.4 - 0.2)));
        }
    }

    forward(input) {
        let current = [...input];
        const layerOutputs = [current];
        for (let l = 0; l < this.weights.length; l++) {
            const next = [];
            for (let j = 0; j < this.weights[l].length; j++) {
                let sum = this.biases[l][j];
                for (let k = 0; k < current.length; k++) {
                    sum += this.weights[l][j][k] * current[k];
                }
                next.push(this.activation.fn(sum));
            }
            current = next;
            layerOutputs.push(current);
        }
        return { output: current, layerOutputs };
    }

    train(inputs, targets, epochs = 1000, onProgress = null) {
        const history = [];
        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalLoss = 0;
            for (let i = 0; i < inputs.length; i++) {
                const { output, layerOutputs } = this.forward(inputs[i]);
                // Calculate loss
                let loss = 0;
                for (let j = 0; j < output.length; j++) {
                    loss += Math.pow(targets[i][j] - output[j], 2);
                }
                totalLoss += loss / output.length;
                // Backpropagation
                this._backpropagate(layerOutputs, targets[i]);
            }
            const avgLoss = totalLoss / inputs.length;
            const accuracy = this._calcAccuracy(inputs, targets);
            if (epoch % Math.max(1, Math.floor(epochs / 100)) === 0 || epoch === epochs - 1) {
                const record = { epoch, loss: Math.round(avgLoss * 10000) / 10000, accuracy: Math.round(accuracy * 100) / 100 };
                history.push(record);
                if (onProgress) onProgress(record);
            }
        }
        this.trainingHistory = history;
        return history;
    }

    _backpropagate(layerOutputs, target) {
        const numLayers = this.weights.length;
        const deltas = new Array(numLayers);
        // Output layer deltas
        const outputLayer = layerOutputs[numLayers];
        deltas[numLayers - 1] = [];
        for (let j = 0; j < outputLayer.length; j++) {
            const error = target[j] - outputLayer[j];
            deltas[numLayers - 1].push(error * this.activation.derivative(outputLayer[j]));
        }
        // Hidden layer deltas
        for (let l = numLayers - 2; l >= 0; l--) {
            deltas[l] = [];
            for (let j = 0; j < this.weights[l].length; j++) {
                let error = 0;
                for (let k = 0; k < this.weights[l + 1].length; k++) {
                    error += deltas[l + 1][k] * this.weights[l + 1][k][j];
                }
                deltas[l].push(error * this.activation.derivative(layerOutputs[l + 1][j]));
            }
        }
        // Update weights and biases
        for (let l = 0; l < numLayers; l++) {
            for (let j = 0; j < this.weights[l].length; j++) {
                for (let k = 0; k < this.weights[l][j].length; k++) {
                    this.weights[l][j][k] += this.learningRate * deltas[l][j] * layerOutputs[l][k];
                }
                this.biases[l][j] += this.learningRate * deltas[l][j];
            }
        }
    }

    _calcAccuracy(inputs, targets) {
        let correct = 0;
        for (let i = 0; i < inputs.length; i++) {
            const { output } = this.forward(inputs[i]);
            const predicted = output.map(o => o > 0.5 ? 1 : 0);
            const actual = targets[i].map(t => t > 0.5 ? 1 : 0);
            if (predicted.every((v, j) => v === actual[j])) correct++;
        }
        return (correct / inputs.length) * 100;
    }

    predict(input) {
        const { output, layerOutputs } = this.forward(input);
        return { output, prediction: output.map(o => o > 0.5 ? 1 : 0), confidence: output.map(o => Math.round(Math.max(o, 1 - o) * 100)), layerOutputs };
    }

    getDecisionBoundary(resolution = 40) {
        const points = [];
        for (let x = -1; x <= 1; x += 2 / resolution) {
            for (let y = -1; y <= 1; y += 2 / resolution) {
                const { output } = this.forward([x, y]);
                points.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, value: Math.round(output[0] * 1000) / 1000 });
            }
        }
        return points;
    }

    getNetworkState() {
        return {
            layerSizes: this.layerSizes,
            activation: this.activationName,
            learningRate: this.learningRate,
            weights: this.weights.map(layer => layer.map(neuron => neuron.map(w => Math.round(w * 1000) / 1000))),
            biases: this.biases.map(layer => layer.map(b => Math.round(b * 1000) / 1000)),
            totalParameters: this.weights.reduce((s, l) => s + l.reduce((s2, n) => s2 + n.length, 0), 0) + this.biases.reduce((s, l) => s + l.length, 0),
            trainingHistory: this.trainingHistory
        };
    }

    static getDatasets() { return Object.entries(DATASETS).map(([id, d]) => ({ id, name: d.name, size: d.inputs.length, inputSize: d.inputSize, outputSize: d.outputSize })); }
    static getDataset(id) { return DATASETS[id] || null; }
    static getActivations() { return Object.keys(activations); }
}

module.exports = NeuralNetwork;
