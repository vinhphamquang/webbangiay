const API_URL = 'http://localhost:3001/api';
let token = localStorage.getItem('userToken');
let cart = [];
let currentUser = null;

// Check authentication
async function checkAuth() {
    if (!token) {
        alert('Vui lòng đăng nhập để thanh toán');
        window.location.href = 'login.html?redirect=checkout.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Unauthorized');
        }

        const data = await response.json();
        currentUser = data;
        
        // Pre-fill form with user data
        if (data.customer) {
            document.getElementById('fullName').value = data.customer.name || '';
            document.getElementById('phone').value = data.customer.phone || '';
            document.getElementById('email').value = data.user.email || '';
            document.getElementById('address').value = data.customer.address || '';
        }
    } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('userToken');
        window.location.href = 'login.html?redirect=checkout.html';
    }
}

// Load cart
async function loadCart() {
    try {
        const response = await fetch(`${API_URL}/customer/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to load cart');
        }

        const data = await response.json();
        cart = data.items || [];
        
        if (cart.length === 0) {
            alert('Giỏ hàng trống');
            window.location.href = 'index.html';
            return;
        }
        
        displayCart();
    } catch (error) {
        console.error('Load cart error:', error);
        alert('Lỗi tải giỏ hàng');
        window.location.href = 'index.html';
    }
}

// Display cart
function displayCart() {
    const container = document.getElementById('orderItems');
    
    const html = cart.map(item => `
        <div class="order-item">
            <img src="${item.product.image}" alt="${item.product.name}" class="order-item-image">
            <div class="order-item-info">
                <h4>${item.product.name}</h4>
                <p>Số lượng: ${item.quantity}</p>
            </div>
            <div class="order-item-price">
                <div class="price">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product.price)}</div>
                <div class="quantity">x${item.quantity}</div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    document.getElementById('subtotal').textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal);
    document.getElementById('total').textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal);
}

// Handle checkout
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const district = document.getElementById('district').value;
    const notes = document.getElementById('notes').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    const shippingAddress = `${address}, ${district}, ${city}`;
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Đang xử lý...';
    
    try {
        const response = await fetch(`${API_URL}/customer/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                shippingAddress,
                paymentMethod,
                notes: notes || null
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Lỗi đặt hàng');
        }

        const order = await response.json();
        
        // Show success modal
        document.getElementById('orderNumber').textContent = `#${order.id}`;
        document.getElementById('successModal').classList.add('show');
        
    } catch (error) {
        console.error('Checkout error:', error);
        alert(error.message);
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Đặt hàng';
    }
});

// Navigation functions
function goToOrders() {
    window.location.href = 'profile.html';
}

function goToHome() {
    window.location.href = 'index.html';
}

// Initialize
checkAuth();
loadCart();
