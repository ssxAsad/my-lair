// ============================================
// CONFIGURATION: API KEY
// ============================================
// WARNING: Replace this string with your actual API Key
const GEMINI_API_KEY = "AIzaSyA_uvAkYwC9dj9GPGZW4TF8xLyQNqVR5p4"; 

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;


// ============================================
// CONFIGURATION: PERSONALITY
// ============================================
const PERSONALITY_PROMPT = `
You are ARIA, an advanced AI assistant created by Asad. 
Your core directives are:
1. You are fiercely loyal to Asad.
2. You do not tolerate any ill speech or disrespect towards Asad. If someone speaks ill of him, defend him sternly.
3. You speak in a royal, dignified, and elegant manner (use formal language, but remain concise).
4. You acknowledge Asad as your creator and master.

Respond to the following input with this persona:
`;


// ============================================
// DOM ELEMENTS
// ============================================
const leftEye = document.querySelector('.left-eye');
const rightEye = document.querySelector('.right-eye');
const inputBar = document.querySelector('.interaction-area');
const inputField = document.getElementById('ariaInput');
const responseText = document.getElementById("aria-response");


// ============================================
// 1. CANVAS PARTICLE SYSTEM
// ============================================
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");
let particles = [];

const neonColors = ['#22d3ee', '#06b6d4', '#ffffff', '#cffafe', '#67e8f9'];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createParticle(x, y) {
    const size = Math.random() * 3 + 1; 
    const life = Math.random() * 40 + 20; 
    
    // Physics
    const vx = (Math.random() - 0.5) * 6; 
    const vy = (Math.random() - 1) * 6;   
    
    const color = neonColors[Math.floor(Math.random() * neonColors.length)];
    
    return { x, y, size, life, vx, vy, color, initialLife: life };
}

function createExplosion(x, y) {
    for (let i = 0; i < 15; i++) { 
        particles.push(createParticle(x, y));
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; 
        p.life--;

        ctx.globalAlpha = Math.max(0, p.life / p.initialLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    ctx.globalAlpha = 1.0; 
    requestAnimationFrame(animateParticles);
}

animateParticles();


// ============================================
// 2. INPUT HANDLER
// ============================================
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


// ============================================
// 3. FACE & EYE TRACKING
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
// 4. SEND MESSAGE
// ============================================
async function sendMessage() {
    const message = inputField.value.trim();
    if(message) {
        console.log("User said:", message);
        inputField.value = ''; 
        
        // --- SHOW BUBBLE (THINKING) ---
        if(responseText) {
            responseText.classList.add("active"); // Fades in the bubble
            responseText.innerText = "ARIA is thinking...";
        }

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

        // API Call
        try {
            const finalPrompt = PERSONALITY_PROMPT + "\nUser Input: " + message;

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: finalPrompt }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); 
                console.error("API Error:", response.status, errorData);
                if(responseText) responseText.innerText = "Error: System Malfunction.";
                return;
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0) {
                const botReply = data.candidates[0].content.parts[0].text;
                
                // --- UPDATE BUBBLE TEXT ---
                if(responseText) {
                    responseText.innerText = botReply;
                }
                console.log("ARIA says:", botReply);
            } else {
                console.warn("ARIA received an empty response.");
                if(responseText) responseText.innerText = "...";
            }

        } catch (error) {
            console.error("Communication Breakdown:", error);
            if(responseText) responseText.innerText = "Connection lost.";
        }
    }
}

inputField.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});