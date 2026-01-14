// ============================================
// CONFIGURATION & STATE
// ============================================
let API_KEY = null; // Key will be fetched from server
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent";

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

// --- FIXED TYPING EFFECT ---
inputField.addEventListener("input", (e) => {
    inputBar.classList.add("vibrating");
    setTimeout(() => inputBar.classList.remove("vibrating"), 100);

    const rect = inputField.getBoundingClientRect();
    const style = window.getComputedStyle(inputField);
    const paddingLeft = parseFloat(style.paddingLeft);
    
    const t = document.createElement("span");
    t.style.font = style.font;
    t.style.visibility = "hidden";
    t.style.position = "absolute";
    t.style.whiteSpace = "pre"; 
    t.textContent = inputField.value.substring(0, inputField.selectionStart);
    
    document.body.appendChild(t);
    const textWidth = t.getBoundingClientRect().width;
    document.body.removeChild(t);

    let explosionX = rect.left + paddingLeft + textWidth;
    explosionX = Math.min(explosionX, rect.right - 20); 
    const explosionY = rect.top + (rect.height / 2);

    createExplosion(explosionX, explosionY);
});

// --- EYE TRACKING ---
document.addEventListener('mousemove', (e) => {
    // Only track if NOT currently smiling
    if (!leftEye.classList.contains('happy')) {
        const moveX = (e.clientX - window.innerWidth / 2) / 15; 
        const moveY = (e.clientY - window.innerHeight / 2) / 15;
        leftEye.style.transform = `translate(${moveX}px, ${moveY}px)`;
        rightEye.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
});

function triggerBlink() {
    // Don't blink if smiling to avoid glitches
    if (!leftEye.classList.contains('happy')) {
        leftEye.classList.add('blink'); rightEye.classList.add('blink');
        setTimeout(() => { leftEye.classList.remove('blink'); rightEye.classList.remove('blink'); }, 300);
    }
    setTimeout(triggerBlink, Math.random() * 4000 + 2000);
}
triggerBlink();

// --- HAPPY EXPRESSION FUNCTION ---
function triggerHappyEyes() {
    leftEye.classList.add('happy');
    rightEye.classList.add('happy');
    
    // Remove the happy expression after 2.5 seconds
    setTimeout(() => {
        leftEye.classList.remove('happy');
        rightEye.classList.remove('happy');
    }, 2500);
}

// ============================================
// SEND MESSAGE (SECURE & STREAMING)
// ============================================
async function sendMessage() {
    const message = inputField.value.trim();
    if(message) {
        inputField.value = ''; 
        
        if(responseText) {
            responseText.classList.add("active");
            responseText.innerText = "ARIA is thinking...";
        }

        try {
            // 1. FETCH API KEY SECURELY IF NOT LOADED
            if (!API_KEY) {
                // This calls the route we made in script.js
                const keyResponse = await fetch('/api/key');
                const keyData = await keyResponse.json();
                API_KEY = keyData.key;
                
                if (!API_KEY) throw new Error("API Key missing on server.");
            }

            // 2. CONSTRUCT URL DYNAMICALLY
            const finalUrl = `${BASE_URL}?key=${API_KEY}&alt=sse`;
            const finalPrompt = PERSONALITY_PROMPT + "\nUser Input: " + message;

            // 3. CALL GEMINI
            const response = await fetch(finalUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    contents: [{ 
                        parts: [{ text: finalPrompt }] 
                    }] 
                })
            });

            if (!response.ok) throw new Error("Gemini Server Error");

            // 4. HANDLE STREAM
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let isFirstChunk = true; 
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonStr = line.replace('data: ', '').trim();
                            if (jsonStr === '[DONE]') continue; 

                            const data = JSON.parse(jsonStr);
                            if (data.candidates && data.candidates[0].content) {
                                const newText = data.candidates[0].content.parts[0].text;
                                
                                // ON FIRST CHUNK: Clear "Thinking..." and Trigger Smile
                                if (isFirstChunk) {
                                    responseText.innerText = "";
                                    isFirstChunk = false;
                                    triggerHappyEyes(); 
                                }

                                if(responseText) responseText.innerText += newText;
                            }
                        } catch (e) {
                            // Ignore incomplete JSON chunks
                        }
                    }
                }
            }

        } catch (error) {
            console.error("Error:", error);
            if(responseText) responseText.innerText = "Connection Error: " + error.message;
        }
    }
}

inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });