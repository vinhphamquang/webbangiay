// Product Variants Selection
// Use API_URL from global scope (set by product-detail.js)

let currentProduct = null;
let currentVariants = [];
let selectedVariant = null;

// Load variants for product
async function loadProductVariants(productId) {
    try {
        const response = await fetch(`${window.API_URL}/products/${productId}/variants`);
        if (!response.ok) throw new Error('Failed to load variants');
        
        currentVariants = await response.json();
        return currentVariants;
    } catch (error) {
        console.error('Load variants error:', error);
        return [];
    }
}

// Render color selection
function renderColorSelection(variants, containerId) {
    const colors = [...new Map(variants.map(v => [v.color, v])).values()];
    
    if (colors.length === 0) return;
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
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
    
    container.innerHTML = html;
}

// Render size selection
function renderSizeSelection(variants, selectedColor, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const colorVariants = variants.filter(v => v.color === selectedColor);
    
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
    
    container.innerHTML = html;
    
    // Auto-select first available size
    const firstAvailable = colorVariants.find(v => v.stock > 0);
    if (firstAvailable) {
        selectedVariant = firstAvailable;
        updateStockDisplay();
    }
}

// Select color
function selectColor(color) {
    // Update active state
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.color === color) {
            btn.classList.add('active');
        }
    });
    
    // Re-render sizes for selected color
    renderSizeSelection(currentVariants, color, 'sizeSelection');
}

// Select size
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
    
    updateStockDisplay();
}

// Update stock display
function updateStockDisplay() {
    const stockDisplay = document.getElementById('stockDisplay');
    if (!stockDisplay || !selectedVariant) return;
    
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

// Get selected variant
function getSelectedVariant() {
    return selectedVariant;
}

// Initialize variants for product detail page
async function initProductVariants(productId) {
    currentVariants = await loadProductVariants(productId);
    
    if (currentVariants.length > 0) {
        // Get first color
        const firstColor = currentVariants[0].color;
        
        // Render color selection
        renderColorSelection(currentVariants, 'colorSelection');
        
        // Render size selection for first color
        renderSizeSelection(currentVariants, firstColor, 'sizeSelection');
    }
}
