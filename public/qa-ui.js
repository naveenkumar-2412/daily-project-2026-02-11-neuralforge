// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Q&A Engine UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.QAUI = {
    init() {
        const section = document.getElementById('qa-section');
        if (!section) return;
        section.innerHTML = `
            <div class="tool-header"><h2>❓ Q&A Engine</h2><p>Ask questions about AI, programming, science, math, and technology</p></div>
            <div class="tool-content">
                <div class="qa-input-row">
                    <input type="text" id="qa-input" class="nf-input" placeholder="Ask any question..." />
                    <button class="nf-btn nf-btn-primary" id="qa-btn">Ask</button>
                </div>
                <div id="qa-output" class="nf-output qa-output"></div>
                <div id="qa-related" class="qa-related"></div>
                <div id="qa-topics" class="qa-topics"></div>
            </div>`;
        document.getElementById('qa-btn').addEventListener('click', () => this.ask());
        document.getElementById('qa-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') this.ask(); });
        this.loadTopics();
    },
    async ask() {
        const question = document.getElementById('qa-input').value;
        if (!question) return;
        try {
            const res = await fetch('/api/qa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) });
            const data = await res.json();
            document.getElementById('qa-output').innerHTML = `
                <div class="qa-answer"><strong>Answer:</strong> ${data.answer}</div>
                <div class="qa-meta"><span>Topic: ${data.topic || 'general'}</span> • <span>Confidence: ${(data.confidence * 100).toFixed(0)}%</span> • <span>${data.processingTimeMs}ms</span></div>`;
            if (data.relatedQuestions?.length) {
                document.getElementById('qa-related').innerHTML = '<strong>Related:</strong> ' + data.relatedQuestions.map(q => `<button class="nf-btn-sm" onclick="document.getElementById('qa-input').value='${q.replace(/'/g, "\\'")}';QAUI.ask()">${q}</button>`).join('');
            }
        } catch (err) { document.getElementById('qa-output').textContent = 'Error: ' + err.message; }
    },
    async loadTopics() {
        try {
            const res = await fetch('/api/qa/topics');
            const data = await res.json();
            document.getElementById('qa-topics').innerHTML = '<div class="topic-chips">' + data.map(t => `<span class="topic-chip">${t.topic} (${t.questionCount})</span>`).join('') + '</div>';
        } catch (e) { }
    }
};
