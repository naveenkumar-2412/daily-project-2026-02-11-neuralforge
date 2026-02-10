# ⚡ NetPulse — Real-time Network & API Health Monitor

> **Self-hosted, lightweight API monitoring dashboard with real-time charts, SSL tracking, and webhook alerts — runs with a single command.**

![NetPulse](https://img.shields.io/badge/NetPulse-v1.0-6366f1?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)

---

## 🎯 Problem

Monitoring services like Datadog, PagerDuty, and UptimeRobot are powerful — but expensive and complex for small teams. Developers building side projects, startups, or self-hosted services need a **lightweight, free, and beautiful** way to monitor their APIs.

## 💡 Solution

NetPulse is a **zero-dependency, self-hosted** network health monitor that:
- Monitors HTTP/HTTPS endpoints in real-time
- Shows a beautiful dark-mode dashboard with live charts
- Tracks SSL certificate expiry
- Sends alerts via Discord, Slack, or custom webhooks
- Stores 30 days of historical data in SQLite
- Runs with a single `npm start`

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📡 **Multi-endpoint Monitoring** | Monitor unlimited HTTP/HTTPS endpoints simultaneously |
| 📊 **Real-time Dashboard** | Live-updating charts and status cards via WebSockets |
| 🔒 **SSL Certificate Tracking** | Days until expiry with color-coded warnings |
| 🔔 **Webhook Alerts** | Discord, Slack, and custom webhook notifications |
| 📈 **Historical Data** | 30-day retention with SQLite storage |
| ✅ **Response Validation** | Check status codes and response body content |
| 🔌 **REST API** | Programmatic access to all monitoring data |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed

### Installation

```bash
# Clone the repository
git clone https://github.com/naveenkumar-2412/daily-project-2026-02-10-netpulse.git
cd daily-project-2026-02-10-netpulse

# Install dependencies
npm install

# Start monitoring (creates config.json from example on first run)
npm start
```

Open **http://localhost:3000** in your browser 🎉

---

## ⚙️ Configuration

Edit `config.json` to customize your monitoring setup:

```json
{
  "port": 3000,
  "checkIntervalMs": 30000,
  "dataRetentionDays": 30,
  "targets": [
    {
      "name": "My API",
      "url": "https://api.example.com/health",
      "method": "GET",
      "expectedStatus": 200,
      "timeoutMs": 10000,
      "headers": {
        "Authorization": "Bearer your-token"
      },
      "expectBodyContains": "ok"
    }
  ],
  "alerts": {
    "enabled": true,
    "webhooks": [
      {
        "type": "discord",
        "url": "https://discord.com/api/webhooks/..."
      }
    ],
    "cooldownMinutes": 5
  }
}
```

### Target Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | required | Display name |
| `url` | string | required | Full URL to monitor |
| `method` | string | `GET` | HTTP method |
| `expectedStatus` | number | `200` | Expected status code |
| `timeoutMs` | number | `10000` | Request timeout in ms |
| `headers` | object | `{}` | Custom request headers |
| `expectBodyContains` | string | — | String to find in response body |

### Alert Webhook Types

- **`discord`** — Discord webhook with embedded messages
- **`slack`** — Slack incoming webhook with blocks
- **`custom`** — Generic JSON POST to any URL

---

## 📡 REST API

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Server health check |
| `GET /api/summary` | Overall monitoring summary |
| `GET /api/targets` | All targets with latest status |
| `GET /api/targets/:id/history?hours=24` | Historical checks for a target |

### Example Response — `/api/summary`

```json
{
  "totalTargets": 3,
  "upTargets": 2,
  "downTargets": 1,
  "pendingTargets": 0,
  "avgResponseTimeMs": 142.5,
  "overallUptime": "66.7"
}
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Browser (Dashboard)                │
│    ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│    │ Summary  │  │ Targets  │  │ Detail + Chart   │  │
│    │ Cards    │  │ List     │  │ (Chart.js)       │  │
│    └──────────┘  └──────────┘  └──────────────────┘  │
│              ▲         ▲              ▲               │
│              └─────────┼──────────────┘               │
│                   Socket.IO (real-time)               │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│                  Node.js Server                       │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Express │  │ Monitor  │  │ Alerter  │            │
│  │ + API   │  │ Engine   │  │ Webhooks │            │
│  └─────────┘  └──────────┘  └──────────┘            │
│       │            │              │                   │
│       ▼            ▼              │                   │
│  ┌──────────────────────┐        │                   │
│  │   SQLite Database    │        │                   │
│  │ (targets + checks)   │        │                   │
│  └──────────────────────┘        │                   │
│                                  ▼                   │
│                          Discord / Slack / Custom     │
└──────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Server:** Express.js
- **Real-time:** Socket.IO
- **Database:** SQLite (better-sqlite3)
- **Charts:** Chart.js
- **Frontend:** Vanilla HTML/CSS/JS
- **SSL Check:** Node.js TLS module

---

## 📂 Project Structure

```
netpulse/
├── package.json
├── config.example.json
├── .gitignore
├── README.md
├── src/
│   ├── index.js          # Entry point
│   ├── server.js         # Express + Socket.IO
│   ├── monitor.js        # Core monitoring engine
│   ├── database.js       # SQLite operations
│   ├── alerter.js        # Webhook alerts
│   └── ssl-checker.js    # SSL certificate checker
└── public/
    ├── index.html        # Dashboard HTML
    ├── style.css         # Dark theme styles
    └── app.js            # Frontend logic
```

---

## 🔮 Future Scope

- [ ] Multi-user authentication
- [ ] Status page generation (public status pages)
- [ ] Email alerts
- [ ] TCP/UDP port monitoring
- [ ] Incident timeline and post-mortems
- [ ] Docker support
- [ ] Prometheus/Grafana integration
- [ ] Mobile-responsive PWA

---

## 📄 License

MIT License — free for personal and commercial use.

---

Built with ⚡ by [naveenkumar-2412](https://github.com/naveenkumar-2412) — Daily AI Project #1
