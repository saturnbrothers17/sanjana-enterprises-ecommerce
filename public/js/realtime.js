// Real-time Socket.IO integration for Sanjana Enterprises
// Connects to admin dashboard for live updates

// Initialize Socket.IO connection to admin dashboard
let socket = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

// Initialize connection when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSocketConnection();
});

function initializeSocketConnection() {
    try {
        // Connect to admin dashboard Socket.IO server
        socket = io('http://localhost:5001', {
            transports: ['websocket', 'polling'],
            timeout: 5000,
            reconnection: true,
            reconnectionAttempts: maxReconnectAttempts,
            reconnectionDelay: 1000
        });

        // Connection successful
        socket.on('connect', () => {
            console.log('✅ Connected to admin dashboard');
            reconnectAttempts = 0;
            showConnectionStatus('connected');
        });

        // Connection failed
        socket.on('connect_error', (error) => {
            console.log('❌ Failed to connect to admin dashboard:', error.message);
            showConnectionStatus('disconnected');
        });

        // Disconnection handling
        socket.on('disconnect', (reason) => {
            console.log('🔌 Disconnected from admin dashboard:', reason);
            showConnectionStatus('disconnected');
        });

        // Listen for product updates
        socket.on('product_added', (data) => {
            console.log('📦 New product added:', data.product);
            handleProductAdded(data.product);
        });

        socket.on('product_updated', (data) => {
            console.log('📝 Product updated:', data.product);
            handleProductUpdated(data.product);
        });

        socket.on('product_deleted', (data) => {
            console.log('🗑️ Product deleted:', data.productId);
            handleProductDeleted(data.productId);
        });

        // Listen for inventory changes
        socket.on('inventory_updated', (data) => {
            console.log('📊 Inventory updated:', data);
            handleInventoryUpdate(data);
        });

        socket.on('inventory_alert', (data) => {
            console.log('⚠️ Inventory alert:', data);
            handleInventoryAlert(data);
        });

        // Listen for order updates
        socket.on('order_status_updated', (data) => {
            console.log('📋 Order status updated:', data);
            handleOrderStatusUpdate(data);
        });

        // Listen for promotional updates
        socket.on('promotion_updated', (data) => {
            console.log('🎉 Promotion updated:', data);
            handlePromotionUpdate(data);
        });

    } catch (error) {
        console.error('Failed to initialize Socket.IO:', error);
        showConnectionStatus('error');
    }
}

// Product Management Functions
function handleProductAdded(product) {
    // Add new product to homepage if on featured products
    if (window.location.pathname === '/' || window.location.pathname === '/products') {
        addProductToDisplay(product);
        showNotification(`New product available: ${product.name}`, 'success');
    }
}

function handleProductUpdated(product) {
    // Update existing product display
    const productElements = document.querySelectorAll(`[data-product-id="${product.id}"]`);
    
    productElements.forEach(element => {
        updateProductDisplay(element, product);
    });

    if (productElements.length > 0) {
        showNotification(`Product updated: ${product.name}`, 'info');
    }
}

function handleProductDeleted(productId) {
    // Remove product from display
    const productElements = document.querySelectorAll(`[data-product-id="${productId}"]`);
    
    productElements.forEach(element => {
        element.style.transition = 'opacity 0.3s ease';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.remove();
            reorganizeProductGrid();
        }, 300);
    });

    if (productElements.length > 0) {
        showNotification('A product has been removed', 'warning');
    }
}

// Inventory Management Functions
function handleInventoryUpdate(data) {
    const { productId, stockQuantity, previousStock } = data;
    
    // Update stock display
    const stockElements = document.querySelectorAll(`[data-stock-id="${productId}"]`);
    stockElements.forEach(element => {
        element.textContent = stockQuantity > 0 ? `${stockQuantity} in stock` : 'Out of stock';
        element.className = stockQuantity > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium';
    });

    // Update add to cart buttons
    if (stockQuantity === 0) {
        disableAddToCart(productId);
    } else if (previousStock === 0 && stockQuantity > 0) {
        enableAddToCart(productId);
    }
}

function handleInventoryAlert(data) {
    const { product, alertType } = data;
    
    if (alertType === 'out_of_stock') {
        disableAddToCart(product.id);
        showNotification(`${product.name} is now out of stock`, 'warning');
    } else if (alertType === 'low_stock') {
        showNotification(`Only ${product.stock_quantity} left of ${product.name}`, 'info');
    } else if (alertType === 'back_in_stock') {
        enableAddToCart(product.id);
        showNotification(`${product.name} is back in stock!`, 'success');
    }
}

// UI Update Functions
function updateProductDisplay(element, product) {
    // Update price
    const priceElement = element.querySelector('.product-price');
    if (priceElement) {
        priceElement.textContent = `₹${product.price.toLocaleString()}`;
    }

    // Update original price if exists
    const originalPriceElement = element.querySelector('.product-original-price');
    if (originalPriceElement && product.original_price > product.price) {
        originalPriceElement.textContent = `₹${product.original_price.toLocaleString()}`;
        originalPriceElement.style.display = 'inline';
    } else if (originalPriceElement) {
        originalPriceElement.style.display = 'none';
    }

    // Update discount badge
    const discountBadge = element.querySelector('.discount-badge');
    if (product.original_price > product.price) {
        const discountPercent = Math.round((1 - product.price / product.original_price) * 100);
        if (discountBadge) {
            discountBadge.textContent = `${discountPercent}% OFF`;
            discountBadge.style.display = 'block';
        }
    } else if (discountBadge) {
        discountBadge.style.display = 'none';
    }

    // Update product name
    const nameElement = element.querySelector('.product-name');
    if (nameElement) {
        nameElement.textContent = product.name;
    }

    // Update product image
    const imageElement = element.querySelector('.product-image');
    if (imageElement && product.images && product.images.length > 0) {
        imageElement.src = product.images[0];
        imageElement.alt = product.name;
    }

    // Update stock status
    const stockElement = element.querySelector('.stock-status');
    if (stockElement) {
        if (product.stock_quantity > 0) {
            stockElement.textContent = `${product.stock_quantity} in stock`;
            stockElement.className = 'stock-status text-green-600 font-medium';
        } else {
            stockElement.textContent = 'Out of stock';
            stockElement.className = 'stock-status text-red-600 font-medium';
        }
    }
}

function addProductToDisplay(product) {
    // This would add a new product to the grid
    // Implementation depends on your specific HTML structure
    const productGrid = document.querySelector('.products-grid');
    if (productGrid) {
        const productHTML = createProductHTML(product);
        productGrid.insertAdjacentHTML('afterbegin', productHTML);
        
        // Animate the new product
        const newProduct = productGrid.firstElementChild;
        newProduct.style.opacity = '0';
        newProduct.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            newProduct.style.transition = 'all 0.3s ease';
            newProduct.style.opacity = '1';
            newProduct.style.transform = 'translateY(0)';
        }, 100);
    }
}

function disableAddToCart(productId) {
    const addToCartButtons = document.querySelectorAll(`[data-product-id="${productId}"] .add-to-cart-btn`);
    
    addToCartButtons.forEach(button => {
        button.disabled = true;
        button.textContent = 'Out of Stock';
        button.className = button.className.replace('bg-primary-600', 'bg-gray-400');
        button.className = button.className.replace('hover:bg-primary-700', 'cursor-not-allowed');
    });
}

function enableAddToCart(productId) {
    const addToCartButtons = document.querySelectorAll(`[data-product-id="${productId}"] .add-to-cart-btn`);
    
    addToCartButtons.forEach(button => {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-cart-plus mr-2"></i>Add to Cart';
        button.className = button.className.replace('bg-gray-400', 'bg-primary-600');
        button.className = button.className.replace('cursor-not-allowed', 'hover:bg-primary-700');
    });
}

function reorganizeProductGrid() {
    // Re-organize product grid after product removal
    const productGrid = document.querySelector('.products-grid');
    if (productGrid) {
        // Add any specific reorganization logic here
        console.log('Product grid reorganized');
    }
}

// Order Management Functions
function handleOrderStatusUpdate(data) {
    // Update order status if user is viewing their orders
    if (window.location.pathname.includes('/orders') || window.location.pathname.includes('/account')) {
        const orderElement = document.querySelector(`[data-order-id="${data.orderId}"]`);
        if (orderElement) {
            const statusElement = orderElement.querySelector('.order-status');
            if (statusElement) {
                statusElement.textContent = data.status;
                statusElement.className = `order-status badge-${data.status.toLowerCase()}`;
            }
            
            showNotification(`Order #${data.orderId} status updated to: ${data.status}`, 'info');
        }
    }
}

// Promotion Management Functions
function handlePromotionUpdate(data) {
    // Update promotional banners or offers
    if (data.type === 'banner') {
        updatePromotionalBanner(data);
    } else if (data.type === 'discount') {
        updateDiscountOffers(data);
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-black',
        info: 'bg-blue-500 text-white'
    };
    
    notification.className += ` ${colors[type]}`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="${icons[type]} mr-2"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-lg">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Connection Status Indicator
function showConnectionStatus(status) {
    let indicator = document.getElementById('connection-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'connection-indicator';
        indicator.className = 'fixed bottom-4 left-4 z-50 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300';
        document.body.appendChild(indicator);
    }
    
    switch (status) {
        case 'connected':
            indicator.className = indicator.className.replace(/bg-\w+-\d+/, 'bg-green-500');
            indicator.textContent = '🟢 Live Updates Active';
            indicator.style.opacity = '1';
            // Hide after 3 seconds
            setTimeout(() => {
                indicator.style.opacity = '0.7';
            }, 3000);
            break;
        case 'disconnected':
            indicator.className = indicator.className.replace(/bg-\w+-\d+/, 'bg-yellow-500');
            indicator.textContent = '🟡 Reconnecting...';
            indicator.style.opacity = '1';
            break;
        case 'error':
            indicator.className = indicator.className.replace(/bg-\w+-\d+/, 'bg-red-500');
            indicator.textContent = '🔴 Connection Error';
            indicator.style.opacity = '1';
            break;
    }
}

// Utility Functions
function createProductHTML(product) {
    // This should match your existing product card HTML structure
    return `
        <div class="card overflow-hidden group" data-product-id="${product.id}">
            <div class="relative overflow-hidden">
                <img src="${product.images?.[0] || '/images/placeholder.jpg'}" alt="${product.name}" 
                     class="product-image w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300">
                ${product.original_price > product.price ? `
                    <div class="discount-badge absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                        ${Math.round((1 - product.price / product.original_price) * 100)}% OFF
                    </div>
                ` : ''}
            </div>
            <div class="p-6">
                <h3 class="product-name text-lg font-semibold mb-2">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-3">${product.category}</p>
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-2">
                        <span class="product-price text-2xl font-bold text-primary-600">₹${product.price.toLocaleString()}</span>
                        ${product.original_price > product.price ? `
                            <span class="product-original-price text-sm text-gray-500 line-through">₹${product.original_price.toLocaleString()}</span>
                        ` : ''}
                    </div>
                </div>
                <div class="stock-status mb-3 text-sm ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}" data-stock-id="${product.id}">
                    ${product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                </div>
                <button onclick="addToCart(${product.id})" 
                        class="add-to-cart-btn w-full ${product.stock_quantity > 0 ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'} text-white py-2 px-4 rounded-lg transition-colors duration-300"
                        ${product.stock_quantity === 0 ? 'disabled' : ''}>
                    ${product.stock_quantity > 0 ? '<i class="fas fa-cart-plus mr-2"></i>Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    `;
}

// Export functions for global use
window.realtimeUpdates = {
    socket,
    showNotification,
    updateProductDisplay,
    disableAddToCart,
    enableAddToCart
};
