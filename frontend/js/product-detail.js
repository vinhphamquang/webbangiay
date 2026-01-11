const API_URL = 'http://localhost:3001/api';
let currentProduct = null;
let selectedSize = null;
let quantity = 1;
let token = localStorage.getItem('userToken');

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    checkAuth();
    loadProduct();
    setupEventListeners();
});

// Check authentication
async function checkAuth() {
    const authNav = document.getElementById('authNav');
    
    if (token) {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                const name = data.customer?.name || data.user.email.split('@')[0];
                authNav.innerHTML = `<a href="profile.html" class="btn-login">👤 ${name}</a>`;
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }
}

// Load product
async function loadProduct() {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        
        if (!response.ok) {
            throw new Error('Product not found');
        }
        
        currentProduct = await response.json();
        displayProduct();
        loadReviews();
        loadRelatedProducts();
    } catch (error) {
        console.error('Load product error:', error);
        alert('Không tìm thấy sản phẩm');
        window.location.href = 'index.html';
    }
}

// Display product
function displayProduct() {
    document.getElementById('productName').textContent = currentProduct.name;
    document.getElementById('breadcrumb-product').textContent = currentProduct.name;
    document.getElementById('productPrice').textContent = 
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentProduct.price);
    document.getElementById('productDescription').textContent = currentProduct.description;
    
    // Stock status
    const stockStatus = document.getElementById('stockStatus');
    const stockQuantity = document.getElementById('stockQuantity');
    
    if (currentProduct.stock > 0) {
        stockStatus.textContent = 'Còn hàng';
        stockStatus.className = 'in-stock';
        stockQuantity.textContent = `(${currentProduct.stock} sản phẩm)`;
    } else {
        stockStatus.textContent = 'Hết hàng';
        stockStatus.className = 'out-of-stock';
        stockQuantity.textContent = '';
        document.getElementById('addToCartBtn').disabled = true;
        document.getElementById('buyNowBtn').disabled = true;
    }
    
    // Main image
    document.getElementById('mainImage').src = currentProduct.image;
    document.getElementById('mainImage').alt = currentProduct.name;
    
    // Update page title
    document.title = `${currentProduct.name} - Adidas Shop`;
}

// Setup event listeners
function setupEventListeners() {
    // Size selection
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSize = btn.dataset.size;
        });
    });
    
    // Quantity controls
    document.getElementById('decreaseQty').addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            document.getElementById('quantity').value = quantity;
        }
    });
    
    document.getElementById('increaseQty').addEventListener('click', () => {
        if (quantity < currentProduct.stock && quantity < 10) {
            quantity++;
            document.getElementById('quantity').value = quantity;
        }
    });
    
    // Add to cart
    document.getElementById('addToCartBtn').addEventListener('click', addToCart);
    
    // Buy now
    document.getElementById('buyNowBtn').addEventListener('click', buyNow);
    
    // Size guide
    document.getElementById('sizeGuideBtn').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('sizeGuideModal').classList.add('show');
    });
    
    // Close modals
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('show');
        });
    });
}

// Add to cart
async function addToCart() {
    // Validate size selection
    if (!selectedSize) {
        alert('Vui lòng chọn kích cỡ');
        return;
    }
    
    // Check authentication
    if (!token) {
        if (confirm('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng. Đăng nhập ngay?')) {
            window.location.href = `login.html?redirect=product-detail.html?id=${productId}`;
        }
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/customer/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: currentProduct.id,
                quantity: quantity
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Lỗi thêm vào giỏ hàng');
        }
        
        // Show success modal
        document.getElementById('successModal').classList.add('show');
        
        // Update cart count
        updateCartCount();
    } catch (error) {
        console.error('Add to cart error:', error);
        alert(error.message);
    }
}

// Buy now
async function buyNow() {
    // Validate size selection
    if (!selectedSize) {
        alert('Vui lòng chọn kích cỡ');
        return;
    }
    
    // Check authentication
    if (!token) {
        if (confirm('Bạn cần đăng nhập để mua hàng. Đăng nhập ngay?')) {
            window.location.href = `login.html?redirect=product-detail.html?id=${productId}`;
        }
        return;
    }
    
    // Add to cart first
    await addToCart();
    
    // Redirect to cart
    setTimeout(() => {
        window.location.href = 'index.html#cart';
    }, 1000);
}

// Update cart count
async function updateCartCount() {
    if (!token) {
        document.getElementById('cart-count').textContent = '0';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/customer/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const count = data.items.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('cart-count').textContent = count;
        }
    } catch (error) {
        console.error('Update cart count error:', error);
        document.getElementById('cart-count').textContent = '0';
    }
}

// Load reviews
async function loadReviews() {
    try {
        const response = await fetch(`${API_URL}/products/${productId}/reviews`);
        
        if (!response.ok) {
            throw new Error('Failed to load reviews');
        }
        
        const reviews = await response.json();
        displayReviews(reviews);
    } catch (error) {
        console.error('Load reviews error:', error);
        document.getElementById('reviewsList').innerHTML = '<p class="loading">Chưa có đánh giá nào</p>';
    }
}

// Display reviews
function displayReviews(reviews) {
    const container = document.getElementById('reviewsList');
    
    if (reviews.length === 0) {
        container.innerHTML = '<p class="loading">Chưa có đánh giá nào</p>';
        document.getElementById('reviewCount').textContent = '(0 đánh giá)';
        return;
    }
    
    // Calculate average rating
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const stars = '⭐'.repeat(Math.round(avgRating));
    document.getElementById('productRating').innerHTML = `<span>${stars}</span>`;
    document.getElementById('reviewCount').textContent = `(${reviews.length} đánh giá)`;
    
    // Display reviews
    const html = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <span class="reviewer-name">${review.customer_name}</span>
                <span class="review-rating">${'⭐'.repeat(review.rating)}</span>
            </div>
            <div class="review-comment">${review.comment || 'Không có nhận xét'}</div>
            <div class="review-date">${new Date(review.created_at).toLocaleDateString('vi-VN')}</div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Load related products
async function loadRelatedProducts() {
    try {
        const response = await fetch(`${API_URL}/products/category/${currentProduct.category}`);
        
        if (!response.ok) {
            throw new Error('Failed to load related products');
        }
        
        const products = await response.json();
        
        // Filter out current product and limit to 4
        const related = products
            .filter(p => p.id !== currentProduct.id)
            .slice(0, 4);
        
        displayRelatedProducts(related);
    } catch (error) {
        console.error('Load related products error:', error);
    }
}

// Display related products
function displayRelatedProducts(products) {
    const container = document.getElementById('relatedProducts');
    
    if (products.length === 0) {
        container.innerHTML = '<p class="loading">Không có sản phẩm liên quan</p>';
        return;
    }
    
    const html = products.map(product => `
        <div class="product-card" onclick="viewProduct(${product.id})">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-card-info">
                <h3>${product.name}</h3>
                <div class="price">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// View product
function viewProduct(id) {
    window.location.href = `product-detail.html?id=${id}`;
}

// Close success modal
function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
}

// Go to cart
function goToCart() {
    window.location.href = 'index.html#cart';
}

// Initialize cart count
updateCartCount();
