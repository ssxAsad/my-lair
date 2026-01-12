// File: netlify/functions/chat.js
export default async (req, context) => {
    // Only allow POST requests (sending messages)
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        // 1. Get the message from your frontend
        const body = await req.json();
        const userMessage = body.message;

        // 2. Get the API Key securely from Netlify
        // Note: We use the name you set in Step 1
        const apiKey = process.env.GEMINIAPI; 

        if (!apiKey) {
            return new Response(JSON.stringify({ error: "API Key missing." }), { status: 500 });
        }

        // 3. Talk to Google Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: userMessage }]
                }]
            })
        });

        const data = await response.json();

        // 4. Send Google's answer back to your site
        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Backend Error:", error);
        return new Response(JSON.stringify({ error: "Failed to communicate with AI." }), { status: 500 });
    }
};