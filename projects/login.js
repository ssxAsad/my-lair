// --- 1. VISUAL: Show/Hide Password ---
function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = "password";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// --- 2. YOUR ORIGINAL ANIMATION LOGIC (Restored) ---
function toggleAuth() {
    // This targets the specific Main Card ID to trigger the CSS slide effect
    const mainCard = document.getElementById('mainCard');
    mainCard.classList.toggle('sign-in-mode');
}

// --- 3. SERVER CONNECTION ---
async function postData(endpoint, data) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: "Server connection failed." };
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // REGISTER
    const registerBtn = document.querySelector('.register-layer button');
    if(registerBtn) {
        registerBtn.addEventListener('click', async () => {
            const inputs = document.querySelectorAll('.register-layer input');
            const username = inputs[0].value.trim();
            const email = inputs[1].value.trim();
            const password = inputs[2].value;

            if (!username || !email || !password) {
                alert("Please fill in all fields.");
                return;
            }

            const result = await postData('/api/register', { username, email, password });
            
            alert(result.message);
            if (result.success) {
                toggleAuth(); // Triggers the slide animation
                inputs.forEach(input => input.value = '');
            }
        });
    }

    // LOGIN
    const loginBtn = document.querySelector('.signin-layer button');
    if(loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const inputs = document.querySelectorAll('.signin-layer input');
            const username = inputs[0].value.trim();
            const password = inputs[1].value;

            if (!username || !password) {
                alert("Please enter username and password.");
                return;
            }

            const result = await postData('/api/login', { username, password });

            if (result.success) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('username', result.username);
                
                // --- UPDATED REDIRECT ---
                window.location.href = 'loggedin.html'; 
            } else {
                alert(result.message);
            }
        });
    }
});