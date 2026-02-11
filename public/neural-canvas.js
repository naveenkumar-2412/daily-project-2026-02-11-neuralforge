// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NeuralForge AI Studio — Animated Neural Network Canvas Background
// Interactive particle system with neural connection animations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(function () {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, nodes = [], mouse = { x: -1000, y: -1000 };
    const NODE_COUNT = 80;
    const CONNECTION_DISTANCE = 180;
    const MOUSE_RADIUS = 200;
    const COLORS = ['#8b5cf6', '#06b6d4', '#ec4899', '#10b981', '#a78bfa', '#22d3ee'];

    class Node {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2.5 + 1;
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.02 + Math.random() * 0.03;
            this.baseAlpha = 0.4 + Math.random() * 0.4;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.pulsePhase += this.pulseSpeed;
            // Mouse interaction
            const dx = this.x - mouse.x, dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.02;
                this.vx += dx / dist * force;
                this.vy += dy / dist * force;
            }
            // Bounds
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
            this.x = Math.max(0, Math.min(width, this.x));
            this.y = Math.max(0, Math.min(height, this.y));
            // Friction
            this.vx *= 0.999;
            this.vy *= 0.999;
        }
        draw() {
            const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
            const alpha = this.baseAlpha * pulse;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * (1 + pulse * 0.3), 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alpha;
            ctx.fill();
            // Glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = alpha * 0.15;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function drawConnections() {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DISTANCE) {
                    const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.15;
                    // Signal pulse along connection
                    const pulse = (Math.sin((nodes[i].pulsePhase + nodes[j].pulsePhase) * 0.5) + 1) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = nodes[i].color;
                    ctx.globalAlpha = alpha * (0.5 + pulse * 0.5);
                    ctx.lineWidth = 0.5 + pulse * 0.5;
                    ctx.stroke();
                    // Signal dot
                    if (pulse > 0.7 && Math.random() > 0.95) {
                        const t = (Date.now() % 2000) / 2000;
                        const sx = nodes[i].x + (nodes[j].x - nodes[i].x) * t;
                        const sy = nodes[i].y + (nodes[j].y - nodes[i].y) * t;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                        ctx.fillStyle = '#fff';
                        ctx.globalAlpha = alpha * 2;
                        ctx.fill();
                    }
                }
            }
        }
        ctx.globalAlpha = 1;
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function init() {
        resize();
        nodes = [];
        for (let i = 0; i < NODE_COUNT; i++) nodes.push(new Node());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        drawConnections();
        for (const node of nodes) { node.update(); node.draw(); }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => { resize(); });
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseout', () => { mouse.x = -1000; mouse.y = -1000; });

    init();
    animate();

    // Expose for mode switching
    window.NeuralCanvas = {
        setMode: function (mode) {
            // Could change node behavior based on mode
        }
    };
})();
