// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Text Generator UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.GeneratorUI = (function () {
    let generateBtn, styleGrid, tempSlider, tempValue, wordsSlider, wordsValue;
    let generatedText, genStats;
    let currentStyle = 'tech';

    function init() {
        generateBtn = document.getElementById('generateBtn');
        styleGrid = document.getElementById('styleGrid');
        tempSlider = document.getElementById('tempSlider');
        tempValue = document.getElementById('tempValue');
        wordsSlider = document.getElementById('wordsSlider');
        wordsValue = document.getElementById('wordsValue');
        generatedText = document.getElementById('generatedText');
        genStats = document.getElementById('genStats');

        generateBtn.addEventListener('click', generate);
        tempSlider.addEventListener('input', () => { tempValue.textContent = (parseInt(tempSlider.value) / 10).toFixed(1); });
        wordsSlider.addEventListener('input', () => { wordsValue.textContent = wordsSlider.value; });

        // Style buttons
        styleGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.style-btn');
            if (!btn) return;
            styleGrid.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStyle = btn.dataset.style;
        });
    }

    async function generate() {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        try {
            const res = await fetch('/api/generate', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    style: currentStyle,
                    maxWords: parseInt(wordsSlider.value),
                    temperature: parseInt(tempSlider.value) / 10
                })
            });
            const data = await res.json();
            typewriterEffect(data.text);
            genStats.innerHTML = `
                <span>📝 ${data.wordCount} words</span>
                <span>⏱️ ${data.processingTimeMs}ms</span>
                <span>🎨 ${data.style}</span>
                <span>🔥 temp ${data.temperature}</span>
            `;
        } catch (err) {
            generatedText.innerHTML = '<div class="empty-state"><span>❌</span><p>Error generating text</p></div>';
        }
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Text ✨';
    }

    function typewriterEffect(text) {
        generatedText.innerHTML = '';
        const words = text.split(' ');
        let index = 0;
        const cursor = document.createElement('span');
        cursor.className = 'typewriter-cursor';

        function addWord() {
            if (index >= words.length) { cursor.remove(); return; }
            generatedText.textContent += (index > 0 ? ' ' : '') + words[index];
            generatedText.appendChild(cursor);
            index++;
            generatedText.parentElement.scrollTop = generatedText.parentElement.scrollHeight;
            setTimeout(addWord, 30 + Math.random() * 40);
        }
        addWord();
    }

    return { init };
})();
