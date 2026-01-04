// --- CONFIGURATION ---
// make sure this key is active on RapidAPI
const RAPIDAPI_KEY = '502cd221d2mshbffa82a8f7e65a4p1431a7jsn230848868541'; 
const RAPIDAPI_HOST = 'spotify-downloader9.p.rapidapi.com';

async function processLink() {
    const input = document.getElementById('spotifyUrl');
    const resultArea = document.getElementById('resultArea');
    const url = input.value.trim();

    // --- FIX 1: Correct Spotify URL Validation ---
    if (!url || !url.includes('open.spotify.com')) {
        alert("Please enter a valid Spotify URL (e.g., https://open.spotify.com/track/...)");
        return;
    }

    // UI Reset
    resultArea.classList.remove('hidden');
    resultArea.innerHTML = `
        <div class="text-center py-8">
            <i class="fa-solid fa-circle-notch fa-spin text-4xl text-green-500 mb-4"></i>
            <p class="text-green-400 font-bold tracking-wider animate-pulse">CONNECTING TO API...</p>
        </div>
    `;

    try {
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST
            }
        };

        // Note: We are passing the full URL as 'songId'. 
        const apiUrl = `https://${RAPIDAPI_HOST}/downloadSong?songId=${encodeURIComponent(url)}`;
        
        console.log("Fetching:", apiUrl); // Debugging line

        const response = await fetch(apiUrl, options);
        
        // Check for 429 (Too Many Requests) or 401 (Unauthorized/Bad Key)
        if (response.status === 429) throw new Error("API Rate Limit Exceeded. Upgrade plan or wait.");
        if (response.status === 401) throw new Error("Invalid API Key.");

        const data = await response.json();
        console.log("API Response:", data); // Debugging line

        // Error Handling based on API structure
        if (!response.ok || !data.success || !data.data || !data.data.downloadLink) {
            throw new Error(data.message || "Could not retrieve download link.");
        }

        // Success: Show Card
        const songData = {
            title: data.data.title || "Spotify Track",
            artist: data.data.artist || "Unknown Artist",
            cover: data.data.coverImage || "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png",
            downloadLink: data.data.downloadLink
        };
        
        showDownloadCard(songData, resultArea);

    } catch (error) {
        console.error(error);
        showError(resultArea, "Failed: " + error.message);
    }
}

function showDownloadCard(song, container) {
    container.innerHTML = `
        <div class="glass-panel rounded-xl p-4 flex items-center gap-4 animate-fade-in-down">
            <div class="relative w-20 h-20 flex-shrink-0">
                <img src="${song.cover}" class="w-full h-full rounded-md shadow-lg object-cover z-10 relative bg-black">
                <div class="absolute top-0 right-[-10px] w-full h-full rounded-full bg-black border border-gray-800 flex items-center justify-center animate-spin-slow -z-0">
                     <div class="w-1/3 h-1/3 bg-gray-900 rounded-full border border-gray-700"></div>
                </div>
            </div>

            <div class="flex-grow min-w-0">
                <h3 class="font-bold text-white text-lg truncate">${song.title}</h3>
                <p class="text-gray-400 text-xs uppercase tracking-wider mb-2">${song.artist}</p>
                <div class="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span id="statusText" class="text-green-400">Ready to Download</span>
                </div>
            </div>

            <button id="forceDownloadBtn" class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 text-black shadow-[0_0_15px_rgba(29,185,84,0.5)] transition-all transform active:scale-95">
                <i class="fa-solid fa-download"></i>
            </button>
        </div>
    `;

    document.getElementById('forceDownloadBtn').addEventListener('click', () => {
        downloadAndVerify(song.downloadLink, `${song.artist} - ${song.title}`);
    });
}

async function downloadAndVerify(url, filename) {
    const btn = document.getElementById('forceDownloadBtn');
    const status = document.getElementById('statusText');
    const originalIcon = btn.innerHTML;
    
    // UI Loading State
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    status.innerText = "Fetching Audio File...";
    status.className = "text-yellow-400 animate-pulse";

    try {
        // Direct Download Fallback (If CORS blocks the fetch)
        // We try to fetch first to rename the file cleanly.
        const response = await fetch(url);
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            throw new Error("API returned JSON instead of Audio (Check Limits)");
        }
        
        if (!response.ok) throw new Error("Network download failed");

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${filename}.mp3`; 
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);

        // Success UI
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        status.innerText = "Download Complete!";
        status.className = "text-green-500 font-bold";
        
        setTimeout(() => { btn.innerHTML = originalIcon; }, 3000);

    } catch (e) {
        console.warn("Fetch failed, trying direct window open...", e);
        // Fallback: Just open the link if the fancy download fails
        window.open(url, '_blank');
        
        status.innerText = "Opened in New Tab";
        status.className = "text-green-500";
        btn.innerHTML = originalIcon;
    }
}

function showError(container, msg) {
    container.innerHTML = `
        <div class="text-center py-8 text-red-500">
            <i class="fa-solid fa-triangle-exclamation text-4xl mb-2"></i>
            <p>${msg}</p>
        </div>
    `;
}