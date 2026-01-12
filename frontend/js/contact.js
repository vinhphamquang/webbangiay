const API_URL = 'http://localhost:3001/api';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication for nav
    checkAuth();
    
    // Handle contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleSubmit);
    }
});

async function checkAuth() {
    const token = localStorage.getItem('userToken');
    const authNav = document.getElementById('authNav');
    
    if (!authNav) return;
    
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (token) {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                const name = data.customer?.name || data.user.email.split('@')[0];
                
                if (isAdmin) {
                    authNav.innerHTML = `
                        <a href="admin.html" class="btn-admin" style="background: #ff6b00; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; margin-right: 10px;">⚙️ Quản trị</a>
                        <a href="profile.html" class="btn-login">👤 ${name}</a>
                    `;
                } else {
                    authNav.innerHTML = `
                        <a href="profile.html" class="btn-login">👤 ${name}</a>
                    `;
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, subject, message })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Gửi yêu cầu thất bại');
        }
        
        const data = await response.json();
        
        // Show success message
        alert('✅ ' + data.message);
        
        // Reset form
        document.getElementById('contactForm').reset();
        
    } catch (error) {
        console.error('Contact error:', error);
        alert('❌ ' + error.message);
    }
}
