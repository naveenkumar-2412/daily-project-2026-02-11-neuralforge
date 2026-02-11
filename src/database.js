// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Database (SQLite via sql.js)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db = null;
const DB_PATH = path.join(__dirname, '..', 'neuralforge.db');

async function init() {
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            role TEXT NOT NULL,
            message TEXT NOT NULL,
            personality TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS analysis_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            input_preview TEXT,
            result_summary TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS training_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dataset TEXT,
            layers TEXT,
            activation TEXT,
            epochs INTEGER,
            final_loss REAL,
            final_accuracy REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    _save();
    return db;
}

function saveChatMessage(role, message, personality) {
    if (!db) return;
    db.run('INSERT INTO chat_history (role, message, personality) VALUES (?, ?, ?)', [role, message, personality || 'friendly']);
    _save();
}

function logAnalysis(type, inputPreview, resultSummary) {
    if (!db) return;
    db.run('INSERT INTO analysis_log (type, input_preview, result_summary) VALUES (?, ?, ?)', [type, inputPreview, resultSummary]);
    _save();
}

function logTrainingRun(dataset, layers, activation, epochs, finalLoss, finalAccuracy) {
    if (!db) return;
    db.run('INSERT INTO training_runs (dataset, layers, activation, epochs, final_loss, final_accuracy) VALUES (?, ?, ?, ?, ?, ?)',
        [dataset, JSON.stringify(layers), activation, epochs, finalLoss, finalAccuracy]);
    _save();
}

function getChatHistory(limit = 50) {
    if (!db) return [];
    const stmt = db.prepare('SELECT * FROM chat_history ORDER BY id DESC LIMIT ?');
    stmt.bind([limit]);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows.reverse();
}

function getAnalysisLog(type = null, limit = 50) {
    if (!db) return [];
    const query = type
        ? 'SELECT * FROM analysis_log WHERE type = ? ORDER BY id DESC LIMIT ?'
        : 'SELECT * FROM analysis_log ORDER BY id DESC LIMIT ?';
    const params = type ? [type, limit] : [limit];
    const stmt = db.prepare(query);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows.reverse();
}

function getStats() {
    if (!db) return {};
    const chatCount = db.exec('SELECT COUNT(*) as c FROM chat_history')[0]?.values[0][0] || 0;
    const analysisCount = db.exec('SELECT COUNT(*) as c FROM analysis_log')[0]?.values[0][0] || 0;
    const trainingCount = db.exec('SELECT COUNT(*) as c FROM training_runs')[0]?.values[0][0] || 0;
    return { chatMessages: chatCount, analyses: analysisCount, trainingRuns: trainingCount };
}

function _save() {
    if (!db) return;
    try {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    } catch (e) { /* ignore save errors */ }
}

module.exports = { init, saveChatMessage, logAnalysis, logTrainingRun, getChatHistory, getAnalysisLog, getStats };
