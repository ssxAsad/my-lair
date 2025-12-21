const leftEye = document.querySelector('.left-eye');
const rightEye = document.querySelector('.right-eye');
const inputBar = document.querySelector('.interaction-area');
const inputField = document.getElementById('ariaInput');

// ============================================
// 1. CANVAS PARTICLE SYSTEM (Ported from Sample)
// ============================================
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");
let particles = [];

// ARIA Theme Colors (Cyan, White, Bright Blue)
// Replaced the fire colors from sample with these:
const neonColors = ['#22d3ee', '#06b6d4', '#ffffff', '#cffafe', '#67e8f9'];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createParticle(x, y) {
    const size = Math.random() * 3 + 1; // Size 1-4px
    const life = Math.random() * 40 + 20; // How long it lasts
    
    // Physics: Random horizontal spread, slight upward/downward burst
    const vx = (Math.random() - 0.5) * 6; 
    const vy = (Math.random() - 1) * 6;   
    
    const color = neonColors[Math.floor(Math.random() * neonColors.length)];
    
    return { x, y, size, life, vx, vy, color, initialLife: life };
}

function createExplosion(x, y) {
    // 15 particles per keystroke for a "clean" explosion
    for (let i = 0; i < 15; i++) { 
        particles.push(createParticle(x, y));
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Move Particle
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravity (pulls them down)
        p.life--;

        // Draw Particle
        ctx.globalAlpha = Math.max(0, p.life / p.initialLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Remove Dead Particles
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    ctx.globalAlpha = 1.0; 
    requestAnimationFrame(animateParticles);
}

// Start the animation loop
animateParticles();


// ============================================
// 2. INPUT HANDLER (Vibration + Exact Cursor)
// ============================================
inputField.addEventListener("input", (e) => {
    // A. Vibration Effect (Toggles class from CSS)
    inputBar.classList.add("vibrating");
    setTimeout(() => inputBar.classList.remove("vibrating"), 100);

    // B. Calculate Exact Cursor Position (Hidden Span Method)
    const rect = inputField.getBoundingClientRect();
    const style = window.getComputedStyle(inputField);
    const paddingLeft = parseFloat(style.paddingLeft);
    
    // Create a temporary hidden span to measure text width
    const t = document.createElement("span");
    t.style.font = style.font;
    t.style.visibility = "hidden";
    t.style.position = "absolute";
    t.style.whiteSpace = "pre"; // Preserve spaces
    t.textContent = inputField.value.substring(0, inputField.selectionStart);
    
    document.body.appendChild(t);
    const textWidth = t.getBoundingClientRect().width;
    document.body.removeChild(t);

    // C. Trigger Explosion
    // Limit explosion X so it doesn't go outside the input box visually
    let explosionX = rect.left + paddingLeft + textWidth;
    explosionX = Math.min(explosionX, rect.right - 20); 
    
    const explosionY = rect.top + (rect.height / 2);

    createExplosion(explosionX, explosionY);
});


// ============================================
// 3. FACE & EYE TRACKING (Original Logic)
// ============================================
document.addEventListener('mousemove', (e) => {
    requestAnimationFrame(() => {
        const x = e.clientX;
        const y = e.clientY;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        const moveX = (x - windowWidth / 2) / 15; 
        const moveY = (y - windowHeight / 2) / 15;

        leftEye.style.transform = `translate(${moveX}px, ${moveY}px)`;
        rightEye.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
});

function triggerBlink() {
    leftEye.classList.add('blink');
    rightEye.classList.add('blink');
    setTimeout(() => {
        leftEye.classList.remove('blink');
        rightEye.classList.remove('blink');
    }, 300);

    const randomDelay = Math.random() * 4000 + 2000;
    setTimeout(triggerBlink, randomDelay);
}
triggerBlink();


// ============================================
// 4. SEND MESSAGE (Original Logic)
// ============================================
function sendMessage() {
    const message = inputField.value.trim();
    if(message) {
        console.log("User said:", message);
        inputField.value = ''; 
        
        // Happy Response (Double Blink)
        leftEye.classList.add('blink');
        rightEye.classList.add('blink');
        setTimeout(() => {
            leftEye.classList.remove('blink');
            rightEye.classList.remove('blink');
        }, 200);
        setTimeout(() => {
            leftEye.classList.add('blink');
            rightEye.classList.add('blink');
        }, 400);
        setTimeout(() => {
            leftEye.classList.remove('blink');
            rightEye.classList.remove('blink');
        }, 700);
    }
}

inputField.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});