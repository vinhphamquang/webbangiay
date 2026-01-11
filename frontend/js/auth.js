const API_URL = 'http://localhost:3001/api';

// Switch between login and register forms
document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
});

// Login
document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Đăng nhập thất bại');
        }
        
        const data = await response.json();
        
        // Save token
        if (data.user.role === 'admin') {
            localStorage.setItem('adminToken', data.token);
            window.location.href = 'admin.html';
        } else {
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('customerId', data.user.customerId);
            
            // Redirect to profile or home
            const redirectTo = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
            window.location.href = redirectTo;
        }
    } catch (error) {
        showError('loginForm', error.message);
    }
});

// Register
document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('registerPhone').value;
    const address = document.getElementById('registerAddress').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone, address })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Đăng ký thất bại');
        }
        
        showSuccess('registerForm', 'Đăng ký thành công! Vui lòng đăng nhập.');
        
        // Switch to login form after 2 seconds
        setTimeout(() => {
            document.getElementById('registerForm').classList.remove('active');
            document.getElementById('loginForm').classList.add('active');
            document.getElementById('loginEmail').value = email;
        }, 2000);
    } catch (error) {
        showError('registerForm', error.message);
    }
});

function showError(formId, message) {
    const form = document.getElementById(formId);
    
    // Remove existing messages
    const existingMsg = form.querySelector('.error-message, .success-message');
    if (existingMsg) existingMsg.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    form.insertBefore(errorDiv, form.querySelector('form'));
    
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(formId, message) {
    const form = document.getElementById(formId);
    
    // Remove existing messages
    const existingMsg = form.querySelector('.error-message, .success-message');
    if (existingMsg) existingMsg.remove();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    form.insertBefore(successDiv, form.querySelector('form'));
}
