// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Main Application Controller
// Handles navigation, dashboard, and initializes all UI modules
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(function () {
    'use strict';

    // ─── Navigation ──────────────────────────────────────────────────────────
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    function navigate(pageId) {
        pages.forEach(p => p.classList.remove('active'));
        navItems.forEach(n => n.classList.remove('active'));

        const page = document.getElementById('page-' + pageId);
        const nav = document.querySelector(`.nav-item[data-page="${pageId}"]`);

        if (page) page.classList.add('active');
        if (nav) nav.classList.add('active');

        // Trigger resize for canvases
        window.dispatchEvent(new Event('resize'));
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => navigate(item.dataset.page));
    });

    // Engine card clicks – navigate to the corresponding tool
    document.getElementById('engineGrid').addEventListener('click', (e) => {
        const card = e.target.closest('.engine-card');
        if (!card) return;
        const pageMap = {
            chat: 'chat', sentiment: 'sentiment', summarizer: 'summarizer',
            codeAnalyzer: 'code', neural: 'neural', generator: 'generator', classifier: 'classifier',
            translator: 'translator', qa: 'qa', ner: 'ner', recommender: 'recommender',
            anomaly: 'anomaly', spellcheck: 'spellcheck', keywords: 'keywords', paraphrase: 'paraphraser'
        };
        const pageId = pageMap[card.dataset.engine];
        if (pageId) navigate(pageId);
    });

    // ─── Dashboard ───────────────────────────────────────────────────────────
    async function loadDashboard() {
        try {
            const res = await fetch('/api/dashboard');
            const data = await res.json();

            // Update stats
            document.getElementById('stat-chat').textContent = data.stats.chatMessages;
            document.getElementById('stat-sentiment').textContent = data.stats.sentimentAnalyses;
            document.getElementById('stat-generated').textContent = data.stats.generatedTexts;
            document.getElementById('stat-classified').textContent = data.stats.classifications;

            // Render engine cards
            const grid = document.getElementById('engineGrid');
            grid.innerHTML = '';
            for (const engine of data.engines) {
                const card = document.createElement('div');
                card.className = 'engine-card';
                card.dataset.engine = engine.id;
                card.innerHTML = `
                    <div class="engine-card-header">
                        <span class="engine-card-icon">${engine.icon}</span>
                        <span class="engine-card-title">${engine.name}</span>
                    </div>
                    <div class="engine-card-desc">${engine.description}</div>
                    <span class="engine-card-badge">Active</span>
                `;
                grid.appendChild(card);
            }
        } catch (err) {
            console.error('Dashboard load error:', err);
        }
    }

    // ─── Server Health Check ─────────────────────────────────────────────────
    const statusDot = document.querySelector('#serverStatus .status-dot');
    const statusText = document.querySelector('#serverStatus span:last-child');

    async function checkHealth() {
        try {
            const res = await fetch('/api/health');
            if (res.ok) {
                statusDot.classList.add('online');
                statusText.textContent = 'Server Online';
            }
        } catch {
            statusDot.classList.remove('online');
            statusText.textContent = 'Server Offline';
        }
    }

    setInterval(checkHealth, 30000);

    // ─── Initialize All Modules ──────────────────────────────────────────────
    function initApp() {
        loadDashboard();
        checkHealth();

        // Initialize UI modules
        if (window.ChatUI) window.ChatUI.init();
        if (window.SentimentUI) window.SentimentUI.init();
        if (window.SummarizerUI) window.SummarizerUI.init();
        if (window.CodeAnalyzerUI) window.CodeAnalyzerUI.init();
        if (window.NeuralPlaygroundUI) window.NeuralPlaygroundUI.init();
        if (window.GeneratorUI) window.GeneratorUI.init();
        if (window.ClassifierUI) window.ClassifierUI.init();

        // New engine UI modules
        if (window.TranslatorUI) window.TranslatorUI.init();
        if (window.QAUI) window.QAUI.init();
        if (window.NERUI) window.NERUI.init();
        if (window.RecommenderUI) window.RecommenderUI.init();
        if (window.AnomalyUI) window.AnomalyUI.init();
        if (window.SpellCheckUI) window.SpellCheckUI.init();
        if (window.KeywordsUI) window.KeywordsUI.init();
        if (window.ParaphraserUI) window.ParaphraserUI.init();

        console.log('🧠 NeuralForge AI Studio initialized — 15 engines');
    }

    // Start when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();
