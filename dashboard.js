// Function to handle Realm entrance alerts
function enterRealm(realmName) { 
    alert("Entering " + realmName.toUpperCase()); 
}

document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio-player');
    const canvas = document.getElementById('visualizer-canvas');
    const ctx = canvas.getContext('2d');

    // --- VISUALIZER SETTINGS ---
    const VISUALIZER_BAR_WIDTH = 30; // Much wider bars
    const VISUALIZER_BAR_GAP = 6;    // Slight gap
    const realmColors = [
        '#22d3ee', // Cyan (Left)
        '#a855f7', // Purple (Mid-Left)
        '#34d399', // Emerald (Mid-Right)
        '#fbbf24'  // Amber (Right)
    ];

    let audioContext, analyser, source;
    let isAudioInitialized = false;

    // --- RESIZE LOGIC ---
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- ANIMATION LOOP ---
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // STATE 1: WAITING FOR INTERACTION (Mysterious Mode)
        if (!isAudioInitialized || audio.paused) {
            ctx.save();
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            // Mysterious Glowing Text
            ctx.font = "900 28px Montserrat, sans-serif"; // Thicker, bolder font
            ctx.shadowColor = "rgba(34, 211, 238, 0.9)";   // Strong Cyan/Ethereal glow
            ctx.shadowBlur = 20;                           // High blur for "energy" look
            
            // Spaced out letters for cinematic effect
            ctx.fillText("T A P   H E R E !", canvas.width / 2, canvas.height / 2);
            
            ctx.restore();
            
            requestAnimationFrame(animate);
            return;
        }

        // STATE 2: VISUALIZER ACTIVE
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Calculate responsive bars
        const totalBarWidth = VISUALIZER_BAR_WIDTH + VISUALIZER_BAR_GAP;
        const maxBars = Math.floor(canvas.width / totalBarWidth);

        // Step logic to sample audio across the spectrum
        const usableData = Math.floor(bufferLength * 0.7);
        const step = Math.ceil(usableData / maxBars);

        for (let i = 0; i < maxBars; i++) {
            let dataIndex = i * step;
            if (dataIndex >= bufferLength) break;

            const value = dataArray[dataIndex];
            const barHeight = (value / 255) * canvas.height;
            const x = i * totalBarWidth;

            // --- COLOR LOGIC: 4 DISTINCT SECTIONS ---
            // Divide the total number of bars by 4 to find which "quarter" we are in
            // 0 = Cyan, 1 = Purple, 2 = Emerald, 3 = Amber
            const colorSection = Math.floor((i / maxBars) * 4);
            const color = realmColors[Math.min(colorSection, 3)]; // Clamp to 3 just to be safe

            ctx.strokeStyle = color;
            ctx.lineWidth = 3; // Slightly thicker stroke
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            
            // Draw hollow neon bar
            ctx.strokeRect(x, canvas.height - barHeight, VISUALIZER_BAR_WIDTH, barHeight);
        }

        requestAnimationFrame(animate);
    }

    // --- AUDIO INIT ---
    function initAudio() {
        if (isAudioInitialized && !audio.paused) return; 

        if (!audioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 512; 

            try {
                source = audioContext.createMediaElementSource(audio);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
            } catch (e) {
                console.warn("Audio source already connected:", e);
            }
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        audio.play()
            .then(() => {
                isAudioInitialized = true;
            })
            .catch(err => {
                console.error("Playback failed:", err);
            });
    }

    canvas.addEventListener('click', initAudio);
    animate();
});