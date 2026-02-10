const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db;
const DB_PATH = path.join(__dirname, '..', 'netpulse.db');

// Auto-save interval (every 10 seconds)
let saveInterval;

function saveToFile() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('[DB] Error saving:', err.message);
  }
}

async function init() {
  const SQL = await initSqlJs();

  // Load existing database or create new
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('[DB] Loaded existing database');
  } else {
    db = new SQL.Database();
    console.log('[DB] Created new database');
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      method TEXT DEFAULT 'GET',
      expected_status INTEGER DEFAULT 200,
      timeout_ms INTEGER DEFAULT 10000,
      headers TEXT DEFAULT '{}',
      expect_body_contains TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_id INTEGER NOT NULL,
      status_code INTEGER,
      response_time_ms REAL,
      is_up INTEGER NOT NULL DEFAULT 0,
      error TEXT,
      ssl_days_remaining INTEGER,
      checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_checks_target_time
      ON checks(target_id, checked_at DESC)
  `);

  // Auto-save periodically
  saveInterval = setInterval(saveToFile, 10000);

  // Save on exit
  process.on('exit', saveToFile);
  process.on('SIGINT', () => { saveToFile(); process.exit(0); });

  return db;
}

/**
 * Helper to run a SELECT query and return results as array of objects
 */
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

/**
 * Helper to run a SELECT query and return first result as object
 */
function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

function upsertTarget(target) {
  const existing = queryOne('SELECT id FROM targets WHERE url = ?', [target.url]);

  if (existing) {
    db.run(
      `UPDATE targets SET name = ?, method = ?, expected_status = ?,
        timeout_ms = ?, headers = ?, expect_body_contains = ?
      WHERE id = ?`,
      [
        target.name,
        target.method || 'GET',
        target.expectedStatus || 200,
        target.timeoutMs || 10000,
        JSON.stringify(target.headers || {}),
        target.expectBodyContains || null,
        existing.id
      ]
    );
    return existing.id;
  }

  db.run(
    `INSERT INTO targets (name, url, method, expected_status, timeout_ms, headers, expect_body_contains)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      target.name,
      target.url,
      target.method || 'GET',
      target.expectedStatus || 200,
      target.timeoutMs || 10000,
      JSON.stringify(target.headers || {}),
      target.expectBodyContains || null
    ]
  );

  return queryOne('SELECT last_insert_rowid() as id').id;
}

function insertCheck(check) {
  db.run(
    `INSERT INTO checks (target_id, status_code, response_time_ms, is_up, error, ssl_days_remaining)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      check.targetId,
      check.statusCode || null,
      check.responseTimeMs || null,
      check.isUp ? 1 : 0,
      check.error || null,
      check.sslDaysRemaining ?? null
    ]
  );
  // Save after each check
  saveToFile();
}

function getTargets() {
  const targets = queryAll('SELECT * FROM targets ORDER BY id');

  return targets.map(t => {
    const lastCheck = queryOne(
      'SELECT * FROM checks WHERE target_id = ? ORDER BY checked_at DESC LIMIT 1',
      [t.id]
    );

    const uptimeRow = queryOne(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_up = 1 THEN 1 ELSE 0 END) as up_count
      FROM checks
      WHERE target_id = ? AND checked_at > datetime('now', '-24 hours')`,
      [t.id]
    );

    const uptime24h = uptimeRow && uptimeRow.total > 0
      ? ((uptimeRow.up_count / uptimeRow.total) * 100).toFixed(2)
      : null;

    return {
      ...t,
      headers: JSON.parse(t.headers || '{}'),
      lastCheck: lastCheck || null,
      uptime24h: uptime24h ? parseFloat(uptime24h) : null
    };
  });
}

function getTargetHistory(targetId, hours = 24) {
  return queryAll(
    `SELECT * FROM checks
     WHERE target_id = ? AND checked_at > datetime('now', '-${hours} hours')
     ORDER BY checked_at ASC`,
    [targetId]
  );
}

function getSummary() {
  const targets = getTargets();
  const totalTargets = targets.length;
  const upTargets = targets.filter(t => t.lastCheck && t.lastCheck.is_up).length;
  const downTargets = targets.filter(t => t.lastCheck && !t.lastCheck.is_up).length;
  const pendingTargets = targets.filter(t => !t.lastCheck).length;

  const avgResponseTime = targets.reduce((sum, t) => {
    return sum + (t.lastCheck?.response_time_ms || 0);
  }, 0) / (upTargets || 1);

  return {
    totalTargets,
    upTargets,
    downTargets,
    pendingTargets,
    avgResponseTimeMs: Math.round(avgResponseTime * 100) / 100,
    overallUptime: totalTargets > 0
      ? ((upTargets / totalTargets) * 100).toFixed(1)
      : '0.0'
  };
}

function cleanupOldData(retentionDays = 30) {
  db.run(`DELETE FROM checks WHERE checked_at < datetime('now', '-${retentionDays} days')`);
  saveToFile();
}

function getDb() {
  return db;
}

module.exports = {
  init,
  upsertTarget,
  insertCheck,
  getTargets,
  getTargetHistory,
  getSummary,
  cleanupOldData,
  getDb
};
