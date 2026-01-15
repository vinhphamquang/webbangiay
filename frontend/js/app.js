// State Management
let products = [];
let categories = [];
let cart = [];
let currentEditId = null;
let currentUser = null;
let bannerInterval = null;
let currentBannerIndex = 0;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCategories();
    loadProducts();
    loadCart();
    setupEventListeners();
    setupNavigation();
});

// Check authentication
async function checkAuth() {
    const token = localStorage.getItem('userToken');
    const authNav = document.getElementById('authNav');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (token) {
        try {
            const response = await fetch('http://localhost:3001/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                currentUser = data;
                
                const name = data.customer?.name || data.user.email.split('@')[0];
                
                // Nếu là admin, hiển thị thêm nút Quản trị
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
                
                // Load notification count
                loadNotificationCount();
            } else {
                localStorage.removeItem('userToken');
                localStorage.removeItem('isAdmin');
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }
}

// Load notification count
async function loadNotificationCount() {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    
    try {
        const response = await fetch('http://localhost:3001/api/customer/unread-replies-count', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const badge = document.getElementById('notification-badge');
            
            if (data.count > 0) {
                badge.textContent = data.count;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Load notification count error:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('search-input').addEventListener('input', filterProducts);
    document.getElementById('category-filter').addEventListener('change', filterProducts);
    document.getElementById('sort-filter').addEventListener('change', filterProducts);
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('error-modal').classList.remove('show');
            document.getElementById('success-modal').classList.remove('show');
        });
    });
}

// Navigation
function setupNavigation() {
    document.querySelectorAll('nav a').forEach(link => {
        const href = link.getAttribute('href');
        
        // Bỏ qua các link external (đăng nhập, liên hệ, admin)
        if (link.classList.contains('btn-login') || 
            link.classList.contains('btn-admin') ||
            href.includes('.html')) {
            return; // Cho phép link này hoạt động bình thường
        }
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = href.substring(1);
            showSection(target);
        });
    });
}

function showSection(section) {
    // Kiểm tra đăng nhập khi vào giỏ hàng
    if (section === 'cart') {
        const token = localStorage.getItem('userToken');
        if (!token) {
            if (confirm('Bạn cần đăng nhập để xem giỏ hàng. Đăng nhập ngay?')) {
                window.location.href = 'login.html?redirect=index.html#cart';
            }
            return;
        }
    }
    
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    
    if (section === 'home') {
        document.querySelector('.hero').style.display = 'block';
        document.querySelector('.filter-section').style.display = 'block';
        document.getElementById('products').style.display = 'block';
    } else if (section === 'products') {
        document.querySelector('.filter-section').style.display = 'block';
        document.getElementById('products').style.display = 'block';
    } else {
        document.getElementById(section).style.display = 'block';
    }
    
    if (section === 'cart') {
        renderCart();
    } else if (section === 'admin') {
        loadAdminProducts();
    }
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch('http://localhost:3001/api/categories');
        if (!response.ok) throw new Error('Failed to load categories');
        
        categories = await response.json();
        renderCategoryFilter();
        initDynamicBanner(); // Khởi tạo banner sau khi load categories
    } catch (error) {
        console.error('Load categories error:', error);
        // Fallback to default categories if API fails
        categories = [
            { id: 1, name: 'Giày chạy bộ' },
            { id: 2, name: 'Giày bóng đá' },
            { id: 3, name: 'Giày lifestyle' },
            { id: 4, name: 'Giày bóng rổ' }
        ];
        renderCategoryFilter();
        initDynamicBanner();
    }
}

// Render category filter
function renderCategoryFilter() {
    const categoryFilter = document.getElementById('category-filter');
    categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>' +
        categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

// Load products
async function loadProducts() {
    try {
        const data = await api.getAllProducts();
        products = data;
        renderProducts(products);
    } catch (error) {
        showError('Lỗi tải sản phẩm', error.message);
    }
}

// Render products
function renderProducts(productsToRender) {
    const grid = document.getElementById('products-grid');
    
    if (productsToRender.length === 0) {
        grid.innerHTML = '<div class="loading">Không tìm thấy sản phẩm nào</div>';
        return;
    }
    
    grid.innerHTML = productsToRender.map(product => {
        const isOutOfStock = product.stock === 0;
        return `
        <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" onclick="${isOutOfStock ? '' : `viewProductDetail(${product.id})`}">
            ${isOutOfStock ? '<div class="out-of-stock-badge">HẾT HÀNG</div>' : ''}
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x250?text=Adidas'">
            <div class="product-info">
                <div class="product-category">${getCategoryNameById(product.category_id)}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${formatPrice(product.price)} VNĐ</div>
                <div class="product-stock ${isOutOfStock ? 'stock-out' : 'stock-available'}">
                    ${isOutOfStock ? '❌ Hết hàng' : `✓ Còn lại: ${product.stock} đôi`}
                </div>
                <div class="product-actions">
                    <button class="btn-view-detail" onclick="event.stopPropagation(); ${isOutOfStock ? 'alert(\'Sản phẩm này hiện đã hết hàng\')' : `viewProductDetail(${product.id})`}" ${isOutOfStock ? 'disabled' : ''}>
                        ${isOutOfStock ? 'Hết hàng' : 'Xem chi tiết'}
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// View product detail
function viewProductDetail(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// Filter products
function filterProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const categoryId = document.getElementById('category-filter').value;
    const sortBy = document.getElementById('sort-filter').value;
    
    let filtered = products.filter(product => {
        const matchSearch = product.name.toLowerCase().includes(searchTerm) || 
                          product.description.toLowerCase().includes(searchTerm);
        const matchCategory = !categoryId || product.category_id == categoryId;
        return matchSearch && matchCategory;
    });
    
    // Sort
    if (sortBy === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    renderProducts(filtered);
}

// Cart functions
async function addToCart(productId) {
    try {
        await api.addToCart(productId, 1);
        await loadCart();
        showSuccess('Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
        showError('Lỗi thêm vào giỏ hàng', error.message);
    }
}

async function loadCart() {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
        cart = [];
        updateCartCount();
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3001/api/customer/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            cart = data.items || [];
        } else {
            cart = [];
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        cart = [];
    }
    
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

async function renderCart() {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
        window.location.href = 'login.html?redirect=index.html#cart';
        return;
    }
    
    // Load cart from API
    await loadCart();
    
    const cartItems = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Giỏ hàng trống</h3>
                <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                <button class="btn-shop-now" onclick="showSection('products')">
                    Mua sắm ngay
                </button>
            </div>
        `;
        document.getElementById('total-price').textContent = '0';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h3>${item.product.name}</h3>
                <p>${formatPrice(item.product.price)} VNĐ</p>
                <div style="margin-top: 10px;">
                    <label style="font-size: 14px; color: #666; margin-right: 8px;">Size:</label>
                    <select onchange="updateSize(${item.id}, this.value)" style="padding: 5px 10px; border: 1px solid #ddd; border-radius: 4px;">
                        ${[38, 39, 40, 41, 42, 43, 44, 45].map(size => 
                            `<option value="${size}" ${item.size == size ? 'selected' : ''}>${size}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="btn-remove" onclick="removeFromCart(${item.id})">Xóa</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    document.getElementById('total-price').textContent = formatPrice(total);
}

async function updateQuantity(cartId, quantity) {
    if (quantity < 1) return;
    
    const token = localStorage.getItem('userToken');
    if (!token) return;
    
    try {
        const response = await fetch(`http://localhost:3001/api/customer/cart/${cartId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity })
        });
        
        if (!response.ok) {
            throw new Error('Lỗi cập nhật giỏ hàng');
        }
        
        await renderCart();
    } catch (error) {
        console.error('Update quantity error:', error);
        showError('Lỗi cập nhật giỏ hàng', error.message);
    }
}

async function updateSize(cartId, size) {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    
    try {
        const response = await fetch(`http://localhost:3001/api/customer/cart/${cartId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ size })
        });
        
        if (!response.ok) {
            throw new Error('Lỗi cập nhật size');
        }
        
        await renderCart();
        showSuccess('Đã cập nhật size giày');
    } catch (error) {
        console.error('Update size error:', error);
        showError('Lỗi cập nhật size', error.message);
    }
}

async function removeFromCart(cartId) {
    const token = localStorage.getItem('userToken');
    if (!token) return;
    
    try {
        const response = await fetch(`http://localhost:3001/api/customer/cart/${cartId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Lỗi xóa sản phẩm');
        }
        
        await renderCart();
        showSuccess('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
        console.error('Remove from cart error:', error);
        showError('Lỗi xóa sản phẩm', error.message);
    }
}

async function checkout() {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
        if (confirm('Bạn cần đăng nhập để thanh toán. Đăng nhập ngay?')) {
            window.location.href = 'login.html?redirect=checkout.html';
        }
        return;
    }
    
    if (cart.length === 0) {
        showError('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ hàng');
        return;
    }
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

// Admin functions
async function loadAdminProducts() {
    try {
        const data = await api.getAllProducts();
        renderAdminProducts(data);
    } catch (error) {
        showError('Lỗi tải sản phẩm', error.message);
    }
}

function renderAdminProducts(products) {
    const list = document.getElementById('admin-products-list');
    list.innerHTML = products.map(product => `
        <div class="admin-product-item">
            <div>
                <h3>${product.name}</h3>
                <p>${getCategoryNameById(product.category_id)} - ${formatPrice(product.price)} VNĐ - Còn: ${product.stock}</p>
            </div>
            <div class="admin-product-actions">
                <button class="btn-edit" onclick="editProduct(${product.id})">Sửa</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">Xóa</button>
            </div>
        </div>
    `).join('');
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('product-name').value,
        price: parseFloat(document.getElementById('product-price').value),
        category: document.getElementById('product-category').value,
        image: document.getElementById('product-image').value,
        description: document.getElementById('product-description').value,
        stock: parseInt(document.getElementById('product-stock').value)
    };
    
    try {
        if (currentEditId) {
            await api.updateProduct(currentEditId, productData);
            showSuccess('Cập nhật sản phẩm thành công');
        } else {
            await api.createProduct(productData);
            showSuccess('Thêm sản phẩm thành công');
        }
        resetForm();
        await loadProducts();
        await loadAdminProducts();
    } catch (error) {
        showError('Lỗi lưu sản phẩm', error.message);
    }
}

async function editProduct(id) {
    try {
        const product = await api.getProductById(id);
        currentEditId = id;
        
        document.getElementById('form-title').textContent = 'Cập Nhật Sản Phẩm';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-stock').value = product.stock;
        
        document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showError('Lỗi tải sản phẩm', error.message);
    }
}

async function deleteProduct(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
        await api.deleteProduct(id);
        showSuccess('Xóa sản phẩm thành công');
        await loadProducts();
        await loadAdminProducts();
    } catch (error) {
        showError('Lỗi xóa sản phẩm', error.message);
    }
}

function resetForm() {
    currentEditId = null;
    document.getElementById('form-title').textContent = 'Thêm Sản Phẩm Mới';
    document.getElementById('product-form').reset();
}

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

function getCategoryName(category) {
    const categories = {
        'running': 'Giày chạy bộ',
        'football': 'Giày bóng đá',
        'lifestyle': 'Giày lifestyle',
        'basketball': 'Giày bóng rổ'
    };
    return categories[category] || category;
}

function getCategoryNameById(categoryId) {
    const category = categories.find(cat => cat.id == categoryId);
    return category ? category.name : 'Chưa phân loại';
}

function showError(title, message) {
    document.getElementById('error-title').textContent = title;
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-modal').classList.add('show');
}

function showSuccess(message) {
    document.getElementById('success-message').textContent = message;
    document.getElementById('success-modal').classList.add('show');
    setTimeout(() => {
        document.getElementById('success-modal').classList.remove('show');
    }, 2000);
}

// ===== DYNAMIC BANNER FUNCTIONS =====

// Khởi tạo banner động
async function initDynamicBanner() {
    if (categories.length === 0) return;
    
    try {
        // Load products để đếm số lượng theo danh mục
        const response = await fetch('http://localhost:3001/api/products');
        const allProducts = await response.json();
        
        // Tạo banner slides
        const bannerContainer = document.querySelector('.banner-container');
        const bannerDots = document.querySelector('.banner-dots');
        
        bannerContainer.innerHTML = '';
        bannerDots.innerHTML = '';
        
        categories.forEach((category, index) => {
            // Đếm số sản phẩm trong danh mục
            const productCount = allProducts.filter(p => p.category_id === category.id).length;
            
            // Tạo slide
            const slide = document.createElement('div');
            slide.className = `banner-slide ${index === 0 ? 'active' : ''}`;
            slide.dataset.category = category.id;
            slide.innerHTML = `
                <div class="banner-content">
                    <div class="banner-text">
                        <span class="banner-label">DANH MỤC</span>
                        <h3 class="banner-title">${category.name}</h3>
                        <p class="banner-description">${category.description || 'Khám phá bộ sưu tập mới nhất'}</p>
                    </div>
                    <div class="banner-stats">
                        <div class="stat-item">
                            <span class="stat-number">${productCount}</span>
                            <span class="stat-label">Sản phẩm</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Click vào banner để lọc sản phẩm theo danh mục
            slide.addEventListener('click', () => {
                document.getElementById('category-filter').value = category.id;
                filterProducts();
                scrollToProducts();
            });
            
            bannerContainer.appendChild(slide);
            
            // Tạo dot
            const dot = document.createElement('div');
            dot.className = `banner-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => goToBannerSlide(index));
            bannerDots.appendChild(dot);
        });
        
        // Bắt đầu auto slide
        startBannerAutoSlide();
        
    } catch (error) {
        console.error('Init banner error:', error);
    }
}

// Chuyển đến slide cụ thể
function goToBannerSlide(index) {
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.banner-dot');
    
    if (index < 0 || index >= slides.length) return;
    
    // Remove active class
    slides.forEach(slide => {
        slide.classList.remove('active', 'prev');
    });
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add prev class to current slide
    if (slides[currentBannerIndex]) {
        slides[currentBannerIndex].classList.add('prev');
    }
    
    // Add active class to new slide
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    
    currentBannerIndex = index;
}

// Slide tiếp theo
function nextBannerSlide() {
    const slides = document.querySelectorAll('.banner-slide');
    const nextIndex = (currentBannerIndex + 1) % slides.length;
    goToBannerSlide(nextIndex);
}

// Bắt đầu auto slide
function startBannerAutoSlide() {
    // Clear existing interval
    if (bannerInterval) {
        clearInterval(bannerInterval);
    }
    
    // Start new interval - chuyển slide mỗi 4 giây
    bannerInterval = setInterval(nextBannerSlide, 4000);
}

// Dừng auto slide (khi user tương tác)
function stopBannerAutoSlide() {
    if (bannerInterval) {
        clearInterval(bannerInterval);
        bannerInterval = null;
    }
}

// Pause khi hover vào banner
document.addEventListener('DOMContentLoaded', () => {
    const bannerContainer = document.querySelector('.banner-container');
    if (bannerContainer) {
        bannerContainer.addEventListener('mouseenter', stopBannerAutoSlide);
        bannerContainer.addEventListener('mouseleave', startBannerAutoSlide);
    }
});
