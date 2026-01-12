// ============================================
// CONFIGURATION
// ============================================
// We now point to the folder we created in Step 2.
// Netlify automatically turns this file path into a working URL.
const API_URL = "/.netlify/functions/chat"; 


// ============================================
// PERSONALITY & SETUP
// ============================================
const PERSONALITY_PROMPT = `
You are ARIA, an advanced AI assistant created by Asad. 
Your core directives are:
1. You are fiercely loyal to Asad.
2. You do not tolerate any ill speech or disrespect towards Asad.
3. You speak in a royal, dignified, and elegant manner.
4. You acknowledge Asad as your creator and master.
Respond to the following input with this persona:
`;

const leftEye = document.querySelector('.left-eye');
const rightEye = document.querySelector('.right-eye');
const inputBar = document.querySelector('.interaction-area');
const inputField = document.getElementById('ariaInput');
const responseText = document.getElementById("aria-response");

// ============================================
// VISUALS (PARTICLES & EYES)
// ============================================
// (Keeping your visual code exactly as it was)
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
const neonColors = ['#22d3ee', '#06b6d4', '#ffffff', '#cffafe', '#67e8f9'];

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createParticle(x, y) {
    const size = Math.random() * 3 + 1; 
    const life = Math.random() * 40 + 20; 
    const vx = (Math.random() - 0.5) * 6; 
    const vy = (Math.random() - 1) * 6;   
    const color = neonColors[Math.floor(Math.random() * neonColors.length)];
    return { x, y, size, life, vx, vy, color, initialLife: life };
}

function createExplosion(x, y) {
    for (let i = 0; i < 15; i++) { particles.push(createParticle(x, y)); }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--;
        ctx.globalAlpha = Math.max(0, p.life / p.initialLife);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
    }
    ctx.globalAlpha = 1.0; 
    requestAnimationFrame(animateParticles);
}
animateParticles();

inputField.addEventListener("input", (e) => {
    inputBar.classList.add("vibrating");
    setTimeout(() => inputBar.classList.remove("vibrating"), 100);
    // (Simple explosion trigger for brevity - logic remains same as before)
    const rect = inputField.getBoundingClientRect();
    createExplosion(rect.left + rect.width/2, rect.top); 
});

document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) / 15; 
    const moveY = (e.clientY - window.innerHeight / 2) / 15;
    leftEye.style.transform = `translate(${moveX}px, ${moveY}px)`;
    rightEye.style.transform = `translate(${moveX}px, ${moveY}px)`;
});

function triggerBlink() {
    leftEye.classList.add('blink'); rightEye.classList.add('blink');
    setTimeout(() => { leftEye.classList.remove('blink'); rightEye.classList.remove('blink'); }, 300);
    setTimeout(triggerBlink, Math.random() * 4000 + 2000);
}
triggerBlink();

// ============================================
// SEND MESSAGE (THE NEW LOGIC)
// ============================================
async function sendMessage() {
    const message = inputField.value.trim();
    if(message) {
        inputField.value = ''; 
        
        // Show "Thinking..."
        if(responseText) {
            responseText.classList.add("active");
            responseText.innerText = "ARIA is thinking...";
        }

        try {
            const finalPrompt = PERSONALITY_PROMPT + "\nUser Input: " + message;

            // SEND TO NETLIFY FUNCTION
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: finalPrompt })
            });

            if (!response.ok) throw new Error("Server Error");

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0) {
                const botReply = data.candidates[0].content.parts[0].text;
                if(responseText) responseText.innerText = botReply;
            } else {
                if(responseText) responseText.innerText = "...";
            }

        } catch (error) {
            console.error("Error:", error);
            if(responseText) responseText.innerText = "Connection Error.";
        }
    }
}

inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });