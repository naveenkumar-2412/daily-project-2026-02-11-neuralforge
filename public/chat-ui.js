// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Chat UI Module
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

window.ChatUI = (function () {
    let chatMessages, chatInput, chatSendBtn, personalitySelect, clearChatBtn;

    function init() {
        chatMessages = document.getElementById('chatMessages');
        chatInput = document.getElementById('chatInput');
        chatSendBtn = document.getElementById('chatSendBtn');
        personalitySelect = document.getElementById('personalitySelect');
        clearChatBtn = document.getElementById('clearChatBtn');

        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
        clearChatBtn.addEventListener('click', clearChat);
        personalitySelect.addEventListener('change', () => {
            fetch('/api/chat/personality', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ personality: personalitySelect.value }) });
        });
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Clear welcome
        const welcome = chatMessages.querySelector('.chat-welcome');
        if (welcome) welcome.remove();

        // Add user bubble
        addBubble(message, 'user');
        chatInput.value = '';

        // Show typing indicator
        const typing = showTyping();

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, personality: personalitySelect.value })
            });
            const data = await res.json();
            typing.remove();
            addBubble(data.message, 'assistant', data.processingTimeMs);
        } catch (err) {
            typing.remove();
            addBubble('Sorry, I encountered an error. Please try again.', 'assistant');
        }
    }

    function addBubble(text, role, timeMs) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${role}`;
        // Support markdown-like bold
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        bubble.innerHTML = html;
        if (timeMs) {
            const meta = document.createElement('div');
            meta.className = 'bubble-meta';
            meta.textContent = `${timeMs}ms`;
            bubble.appendChild(meta);
        }
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping() {
        const div = document.createElement('div');
        div.className = 'typing-indicator';
        div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return div;
    }

    function clearChat() {
        chatMessages.innerHTML = '<div class="chat-welcome"><span class="welcome-icon">🤖</span><p>Start a conversation with your AI companion!</p></div>';
        fetch('/api/chat/clear', { method: 'POST' });
    }

    return { init };
})();
