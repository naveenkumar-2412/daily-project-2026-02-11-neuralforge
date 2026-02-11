# 🧠 NeuralForge — AI Studio

> **Self-hosted AI Studio with 7 built-in AI engines — all running locally, no API keys required. Features a stunning animated dashboard with glassmorphism design.**

![NeuralForge](https://img.shields.io/badge/NeuralForge-v1.0-8b5cf6?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)
![AI Engines](https://img.shields.io/badge/AI%20Engines-7-ec4899?style=for-the-badge)

---

## 🎯 What is NeuralForge?

NeuralForge is a **self-hosted AI playground** that bundles 7 fully-functional AI engines into a single web application. Every engine runs **100% locally** using algorithmic AI — no external API keys, no cloud dependencies, no data leaving your machine.

### 🤖 AI Engines

| Engine | Technology | Description |
|--------|-----------|-------------|
| 💬 **AI Chatbot** | Markov Chain + Rule-based | Conversational AI with 4 personality modes (Nova, Atlas, Muse, Byte) |
| 😊 **Sentiment Analyzer** | Multi-dimensional NLP | Emotion detection, word-level analysis, confidence scoring |
| 📝 **Text Summarizer** | TF-IDF Extractive | Smart text compression with keyword extraction |
| 🔍 **Code Analyzer** | AST-like Static Analysis | Multi-language code quality grading (A-F), complexity metrics |
| 🧠 **Neural Network** | Backpropagation from Scratch | Interactive playground with decision boundary visualization |
| ✍️ **Text Generator** | N-gram Markov Chain | 5 style presets (Shakespeare, Tech, Poetry, News, Sci-Fi) |
| 🏷️ **Text Classifier** | Naive Bayes | Train custom models for spam detection, topic classification |

---

## ✨ Frontend Features

- **🌐 Animated Neural Canvas** — Interactive particle network background with mouse-reactive nodes
- **🎨 Glassmorphism Dark Theme** — Premium design with neon gradients and backdrop blur
- **📊 Canvas Visualizations** — Decision boundary plots, loss/accuracy charts drawn in real-time
- **⚡ Typewriter Effects** — Text generator output with smooth character-by-character animation
- **💬 Real-time Chat** — WebSocket-powered chat with typing indicators
- **📱 Responsive Layout** — Works on desktop and mobile with collapsible sidebar

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/naveenkumar-2412/daily-project-2026-02-10-netpulse.git
cd daily-project-2026-02-10-netpulse

# Install dependencies
npm install

# Start the server
npm start

# Or use dev mode (auto-restart on changes)
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📁 Project Structure

```
neuralforge/
├── public/                    # Frontend (served as static files)
│   ├── index.html             # Main SPA with 8 tool pages
│   ├── style.css              # Glassmorphism design system (~900 lines)
│   ├── neural-canvas.js       # Animated particle background
│   ├── app.js                 # Navigation & dashboard controller
│   ├── chat-ui.js             # Chat interface module
│   ├── sentiment-ui.js        # Sentiment visualization
│   ├── summarizer-ui.js       # Summarizer interface
│   ├── code-analyzer-ui.js    # Code quality display
│   ├── neural-playground-ui.js # Neural network canvas visualizations
│   ├── generator-ui.js        # Text generator with typewriter
│   └── classifier-ui.js       # Classification results display
├── src/                       # Backend
│   ├── index.js               # Entry point — loads all engines
│   ├── server.js              # Express + Socket.IO server
│   ├── router.js              # REST API routes for all engines
│   ├── database.js            # SQLite persistence layer
│   └── ai/                    # AI Engine modules
│       ├── chatbot.js         # Markov + rule-based chatbot
│       ├── sentiment.js       # Multi-dimensional sentiment analyzer
│       ├── summarizer.js      # TF-IDF extractive summarizer
│       ├── code-analyzer.js   # Static code analysis engine
│       ├── neural-network.js  # Neural network with backpropagation
│       ├── text-generator.js  # N-gram Markov text generator
│       └── classifier.js      # Naive Bayes text classifier
├── config.example.json        # Configuration template
├── package.json
└── README.md
```

---

## 🔌 API Reference

All endpoints are under `/api`:

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send a message `{ message, personality }` |
| GET | `/api/chat/personalities` | List available personalities |
| POST | `/api/chat/clear` | Clear conversation context |

### Sentiment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sentiment` | Analyze text `{ text }` |

### Summarizer
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/summarize` | Summarize text `{ text, ratio }` |

### Code Analyzer
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/code-analyze` | Analyze code `{ code, language }` |

### Neural Network
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/neural/train` | Train network `{ dataset, layers, activation, epochs }` |
| GET | `/api/neural/datasets` | List available datasets |

### Text Generator
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Generate text `{ style, maxWords, temperature }` |

### Classifier
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/classify/train` | Train with dataset `{ dataset }` |
| POST | `/api/classify/predict` | Classify text `{ text }` |

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Database**: SQLite (via sql.js, zero native dependencies)
- **Frontend**: Vanilla JS, CSS3 with custom properties, Canvas API
- **AI**: All engines implemented from scratch — no ML library dependencies

---

## 📜 License

MIT © [naveenkumar-2412](https://github.com/naveenkumar-2412)
