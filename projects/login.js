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

// --- 2. ANIMATION LOGIC ---
function toggleAuth() {
    const mainCard = document.getElementById('mainCard');
    mainCard.classList.toggle('sign-in-mode');
}

// --- 3. TEMPORARY SESSION STORAGE (The Fix) ---
// usage: sessionStorage data is DELETED when the tab closes.

function getTempUsers() {
    // We use sessionStorage now, not localStorage
    return JSON.parse(sessionStorage.getItem('temp_users_list') || '[]');
}

function mockRegister(username, email, password) {
    const users = getTempUsers();
    
    // Check duplication
    if (users.find(u => u.username === username)) {
        return { success: false, message: "Username taken (in this session)." };
    }

    // Save to TEMPORARY list
    users.push({ username, email, password });
    sessionStorage.setItem('temp_users_list', JSON.stringify(users));
    
    return { success: true, message: "Registered temporarily! You can now Sign In." };
}

function mockLogin(username, password) {
    const users = getTempUsers();
    
    // Search the temporary list
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        return { success: true, username: user.username };
    } else {
        return { success: false, message: "User not found. (Did you close the tab? Data resets on close)." };
    }
}

// --- 4. EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {

    // REGISTER
    const registerBtn = document.querySelector('.register-layer button');
    if(registerBtn) {
        registerBtn.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.register-layer input');
            const username = inputs[0].value.trim();
            const email = inputs[1].value.trim();
            const password = inputs[2].value;

            if (!username || !email || !password) {
                alert("Please fill in all fields.");
                return;
            }

            const result = mockRegister(username, email, password);
            
            alert(result.message);
            if (result.success) {
                toggleAuth(); 
                inputs.forEach(input => input.value = ''); 
            }
        });
    }

    // LOGIN
    const loginBtn = document.querySelector('.signin-layer button');
    if(loginBtn) {
        loginBtn.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.signin-layer input');
            const username = inputs[0].value.trim();
            const password = inputs[1].value;

            if (!username || !password) {
                alert("Please enter username and password.");
                return;
            }

            const result = mockLogin(username, password);

            if (result.success) {
                // Save active session to sessionStorage too
                sessionStorage.setItem('active_session_user', result.username);
                window.location.href = 'loggedin.html'; 
            } else {
                alert(result.message);
            }
        });
    }
});