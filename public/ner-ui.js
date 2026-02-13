// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — NER UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.NERUI = {
    entityColors: { PERSON: '#4fc3f7', ORG: '#81c784', LOCATION: '#ffb74d', DATE: '#ce93d8', EMAIL: '#f06292', URL: '#4dd0e1', PHONE: '#aed581', MONEY: '#ffd54f', PERCENT: '#ff8a65' },
    init() {
        const section = document.getElementById('ner-section');
        if (!section) return;
        section.innerHTML = `
            <div class="tool-header"><h2>🏷️ Named Entity Recognition</h2><p>Extract people, organizations, locations, dates, and more from text</p></div>
            <div class="tool-content">
                <textarea id="ner-input" class="nf-textarea" rows="4" placeholder="Enter text with names, places, organizations, dates...">John Smith works at Google in San Francisco. He earned $150,000 in 2024 and his email is john@google.com.</textarea>
                <button class="nf-btn nf-btn-primary" id="ner-btn">🏷️ Extract Entities</button>
                <div id="ner-output" class="nf-output"></div>
                <div id="ner-annotated" class="ner-annotated"></div>
                <div id="ner-summary" class="ner-summary"></div>
            </div>`;
        document.getElementById('ner-btn').addEventListener('click', () => this.extract());
    },
    async extract() {
        const text = document.getElementById('ner-input').value;
        if (!text) return;
        try {
            const res = await fetch('/api/ner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
            const data = await res.json();
            // Build annotated text
            let annotated = text;
            const sorted = [...data.entities].sort((a, b) => b.start - a.start);
            for (const ent of sorted) {
                const color = this.entityColors[ent.label] || '#90a4ae';
                annotated = annotated.slice(0, ent.start) + `<mark style="background:${color}33;border-bottom:2px solid ${color};padding:2px 4px;border-radius:3px" title="${ent.label} (${(ent.confidence * 100).toFixed(0)}%)">${annotated.slice(ent.start, ent.end)}<sup style="font-size:0.7em;color:${color}">${ent.label}</sup></mark>` + annotated.slice(ent.end);
            }
            document.getElementById('ner-annotated').innerHTML = `<div class="annotated-text">${annotated}</div>`;
            // Summary
            let summaryHtml = '<div class="entity-summary">';
            for (const [label, entities] of Object.entries(data.summary || {})) {
                const color = this.entityColors[label] || '#90a4ae';
                summaryHtml += `<div class="entity-group"><span class="entity-label" style="color:${color}">${label}:</span> ${entities.join(', ')}</div>`;
            }
            summaryHtml += `</div><div class="nf-meta">${data.entityCount} entities found • ${data.processingTimeMs}ms</div>`;
            document.getElementById('ner-summary').innerHTML = summaryHtml;
        } catch (err) { document.getElementById('ner-output').textContent = 'Error: ' + err.message; }
    }
};
