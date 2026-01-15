// Product Detail Page - Complete Implementation with Variants
const API_URL = 'http://localhost:3001/api';

// Global state
let currentProduct = null;
let currentVariants = [];
let selectedVariant = null;
let quantity = 1;
let token = localStorage.getItem('userToken');

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    checkAuth();
    loadProduct();
    setupEventListeners();
});

// ==================== AUTHENTICATION ====================
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

// ==================== LOAD PRODUCT ====================
async function loadProduct() {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        
        if (!response.ok) {
            throw new Error('Product not found');
        }
        
        currentProduct = await response.json();
        displayProduct();
        
        // Load variants
        await loadVariants();
        
        // Check if all variants are out of stock
        checkProductAvailability();
        
        // Load other data
        loadReviews();
        loadRelatedProducts();
    } catch (error) {
        console.error('Load product error:', error);
        alert('Không tìm thấy sản phẩm');
        window.location.href = 'index.html';
    }
}

// ==================== DISPLAY PRODUCT ====================
function displayProduct() {
    document.getElementById('productName').textContent = currentProduct.name;
    document.getElementById('breadcrumb-product').textContent = currentProduct.name;
    document.getElementById('productPrice').textContent = 
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentProduct.price);
    document.getElementById('productDescription').textContent = currentProduct.description;
    
    // Main image
    document.getElementById('mainImage').src = currentProduct.image;
    document.getElementById('mainImage').alt = currentProduct.name;
    
    // Update page title
    document.title = `${currentProduct.name} - Adidas Shop`;
}

// ==================== VARIANTS ====================
async function loadVariants() {
    try {
        const response = await fetch(`${API_URL}/products/${productId}/variants`);
        if (!response.ok) throw new Error('Failed to load variants');
        
        currentVariants = await response.json();
        
        if (currentVariants.length > 0) {
            renderColorSelection();
            renderSizeSelection(currentVariants[0].color);
        }
    } catch (error) {
        console.error('Load variants error:', error);
        document.getElementById('colorSelection').innerHTML = '<p style="color: red;">Không thể tải thông tin màu sắc và size</p>';
    }
}

function renderColorSelection() {
    const colors = [...new Map(currentVariants.map(v => [v.color, v])).values()];
    
    if (colors.length === 0) return;
    
    const html = `
        <div class="variant-section">
            <label class="variant-label">Màu sắc:</label>
            <div class="color-options">
                ${colors.map((v, index) => `
                    <button 
                        class="color-option ${index === 0 ? 'active' : ''}" 
                        data-color="${v.color}"
                        onclick="selectColor('${v.color}')"
                        title="${v.color}">
                        <span class="color-circle" style="background: ${v.color_code};"></span>
                        <span class="color-name">${v.color}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('colorSelection').innerHTML = html;
}

function renderSizeSelection(selectedColor) {
    const colorVariants = currentVariants.filter(v => v.color === selectedColor);
    
    const html = `
        <div class="variant-section">
            <label class="variant-label">Kích cỡ:</label>
            <div class="size-options">
                ${colorVariants.map((v, index) => {
                    const isOutOfStock = v.stock === 0;
                    return `
                        <button 
                            class="size-option ${index === 0 && !isOutOfStock ? 'active' : ''} ${isOutOfStock ? 'out-of-stock' : ''}" 
                            data-variant-id="${v.id}"
                            data-size="${v.size}"
                            data-stock="${v.stock}"
                            onclick="selectSize(${v.id})"
                            ${isOutOfStock ? 'disabled' : ''}>
                            <span class="size-number">${v.size}</span>
                            ${isOutOfStock ? '<span class="out-of-stock-label">Hết</span>' : ''}
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    document.getElementById('sizeSelection').innerHTML = html;
    
    // Auto-select first available size
    const firstAvailable = colorVariants.find(v => v.stock > 0);
    if (firstAvailable) {
        selectedVariant = firstAvailable;
        updateStockDisplay();
    } else {
        selectedVariant = null;
        updateStockDisplay();
    }
}

function selectColor(color) {
    // Update active state
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.color === color) {
            btn.classList.add('active');
        }
    });
    
    // Re-render sizes for selected color
    renderSizeSelection(color);
}

function selectSize(variantId) {
    selectedVariant = currentVariants.find(v => v.id === variantId);
    
    if (!selectedVariant || selectedVariant.stock === 0) return;
    
    // Update active state
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.variantId) === variantId) {
            btn.classList.add('active');
        }
    });
    
    // Reset quantity if exceeds stock
    if (quantity > selectedVariant.stock) {
        quantity = Math.min(selectedVariant.stock, 10);
        document.getElementById('quantity').value = quantity;
    }
    
    updateStockDisplay();
}

function updateStockDisplay() {
    const stockDisplay = document.getElementById('stockDisplay');
    if (!stockDisplay) return;
    
    if (!selectedVariant) {
        stockDisplay.innerHTML = '<span style="color: #f44336; font-weight: bold;">❌ Vui lòng chọn màu và size</span>';
        return;
    }
    
    const stock = selectedVariant.stock;
    let html = '';
    
    if (stock === 0) {
        html = '<span style="color: #f44336; font-weight: bold;">❌ Hết hàng</span>';
    } else if (stock < 5) {
        html = `<span style="color: #FF9800; font-weight: bold;">⚠️ Chỉ còn ${stock} sản phẩm</span>`;
    } else {
        html = `<span style="color: #4CAF50; font-weight: bold;">✓ Còn ${stock} sản phẩm</span>`;
    }
    
    stockDisplay.innerHTML = html;
}

// Check if product is completely out of stock
function checkProductAvailability() {
    const totalStock = currentVariants.reduce((sum, v) => sum + v.stock, 0);
    
    if (totalStock === 0) {
        // Show out of stock message
        const productInfo = document.querySelector('.product-info');
        const outOfStockBanner = document.createElement('div');
        outOfStockBanner.className = 'out-of-stock-banner';
        outOfStockBanner.innerHTML = `
            <div style="background: #f44336; color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px; font-weight: bold; font-size: 18px;">
                ❌ SẢN PHẨM NÀY HIỆN ĐÃ HẾT HÀNG
            </div>
        `;
        productInfo.insertBefore(outOfStockBanner, productInfo.firstChild);
        
        // Disable buttons
        document.getElementById('addToCartBtn').disabled = true;
        document.getElementById('addToCartBtn').style.opacity = '0.5';
        document.getElementById('addToCartBtn').style.cursor = 'not-allowed';
        document.getElementById('addToCartBtn').textContent = '❌ Hết hàng';
        
        document.getElementById('buyNowBtn').disabled = true;
        document.getElementById('buyNowBtn').style.opacity = '0.5';
        document.getElementById('buyNowBtn').style.cursor = 'not-allowed';
        document.getElementById('buyNowBtn').textContent = '❌ Hết hàng';
    }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Quantity controls
    document.getElementById('decreaseQty').addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            document.getElementById('quantity').value = quantity;
        }
    });
    
    document.getElementById('increaseQty').addEventListener('click', () => {
        const maxStock = selectedVariant ? selectedVariant.stock : 10;
        if (quantity < maxStock && quantity < 10) {
            quantity++;
            document.getElementById('quantity').value = quantity;
        }
    });
    
    // Add to cart
    document.getElementById('addToCartBtn').addEventListener('click', addToCart);
    
    // Buy now
    document.getElementById('buyNowBtn').addEventListener('click', buyNow);
}

// ==================== CART ACTIONS ====================
async function addToCart() {
    if (!selectedVariant) {
        alert('Vui lòng chọn màu sắc và kích cỡ');
        return;
    }
    
    if (selectedVariant.stock === 0) {
        alert('Size này đã hết hàng. Vui lòng chọn size khác');
        return;
    }
    
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
                variantId: selectedVariant.id,
                quantity: quantity
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Lỗi thêm vào giỏ hàng');
        }
        
        alert(`✓ Đã thêm ${currentProduct.name} (${selectedVariant.color} - Size ${selectedVariant.size}) vào giỏ hàng!`);
        updateCartCount();
    } catch (error) {
        console.error('Add to cart error:', error);
        alert(error.message);
    }
}

async function buyNow() {
    if (!selectedVariant) {
        alert('Vui lòng chọn màu sắc và kích cỡ');
        return;
    }
    
    if (selectedVariant.stock === 0) {
        alert('Size này đã hết hàng. Vui lòng chọn size khác');
        return;
    }
    
    if (!token) {
        if (confirm('Bạn cần đăng nhập để mua hàng. Đăng nhập ngay?')) {
            window.location.href = `login.html?redirect=product-detail.html?id=${productId}`;
        }
        return;
    }
    
    await addToCart();
    setTimeout(() => {
        window.location.href = 'index.html#cart';
    }, 1000);
}

// ==================== CART COUNT ====================
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

// ==================== REVIEWS ====================
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

function displayReviews(reviews) {
    const container = document.getElementById('reviewsList');
    
    if (reviews.length === 0) {
        container.innerHTML = '<p class="loading">Chưa có đánh giá nào</p>';
        document.getElementById('reviewCount').textContent = '(0 đánh giá)';
        return;
    }
    
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const stars = '⭐'.repeat(Math.round(avgRating));
    document.getElementById('productRating').innerHTML = `<span>${stars}</span>`;
    document.getElementById('reviewCount').textContent = `(${reviews.length} đánh giá)`;
    
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

// ==================== RELATED PRODUCTS ====================
async function loadRelatedProducts() {
    try {
        const response = await fetch(`${API_URL}/products/category/${currentProduct.category}`);
        
        if (!response.ok) {
            throw new Error('Failed to load related products');
        }
        
        const products = await response.json();
        const related = products.filter(p => p.id !== currentProduct.id).slice(0, 4);
        
        displayRelatedProducts(related);
    } catch (error) {
        console.error('Load related products error:', error);
    }
}

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

function viewProduct(id) {
    window.location.href = `product-detail.html?id=${id}`;
}

// Initialize cart count
updateCartCount();
