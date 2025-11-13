// Main JavaScript functionality for Sanjana Enterprises

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add to cart functionality
function addToCart(productId, quantity = 1) {
    fetch('/cart/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Product added to cart!', 'success');
            updateCartCount();
        } else {
            showToast('Failed to add product to cart', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred', 'error');
    });
}

// Update cart item quantity
function updateCartQuantity(productId, quantity) {
    fetch('/cart/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload(); // Reload to update cart display
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Remove from cart
function removeFromCart(productId) {
    updateCartQuantity(productId, 0);
}

// Update cart count display
function updateCartCount() {
    fetch('/cart')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const cartItems = doc.querySelectorAll('.cart-item');
            const count = cartItems.length;
            
            const cartCountElement = document.getElementById('cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = count;
                cartCountElement.style.display = count > 0 ? 'flex' : 'none';
            }
        })
        .catch(error => {
            console.error('Error updating cart count:', error);
        });
}

// Wishlist functionality
function addToWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    
    if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        showToast('Added to wishlist!', 'success');
    } else {
        showToast('Already in wishlist!', 'info');
    }
}

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) return;
    
    // Set message
    toastMessage.textContent = message;
    
    // Set color based on type
    toast.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50';
    
    switch(type) {
        case 'success':
            toast.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            toast.classList.add('bg-red-500', 'text-white');
            break;
        case 'info':
            toast.classList.add('bg-blue-500', 'text-white');
            break;
        case 'warning':
            toast.classList.add('bg-yellow-500', 'text-white');
            break;
        default:
            toast.classList.add('bg-green-500', 'text-white');
    }
    
    // Show toast
    toast.classList.remove('translate-x-full');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 3000);
}

// Form submission handlers
function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    fetch('/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, 'success');
            form.reset();
        } else {
            showToast(data.message || 'Failed to send message', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred', 'error');
    });
}

// Login form handler
function handleLoginForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = data.redirect || '/';
            }, 1000);
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred', 'error');
    });
}

// Register form handler
function handleRegisterForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Basic validation
    if (data.password !== data.confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, 'success');
            setTimeout(() => {
                window.location.href = data.redirect || '/';
            }, 1000);
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred', 'error');
    });
}

// Checkout form handler
function handleCheckoutForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    fetch('/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            showToast(data.message || 'Checkout failed', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('An error occurred', 'error');
    });
}

// Product quantity controls
function increaseQuantity(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = parseInt(input.value) + 1;
    }
}

function decreaseQuantity(inputId) {
    const input = document.getElementById(inputId);
    if (input && parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

// Product image gallery
function changeProductImage(src) {
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
        mainImage.src = src;
    }
}

// Search functionality
function handleSearch(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const searchTerm = event.target.value.trim();
        if (searchTerm) {
            window.location.href = `/products?search=${encodeURIComponent(searchTerm)}`;
        }
    }
}

// Filter products
function filterProducts() {
    const category = document.getElementById('category-filter')?.value;
    const sort = document.getElementById('sort-filter')?.value;
    const search = document.getElementById('search-input')?.value;
    
    let url = '/products?';
    const params = [];
    
    if (category && category !== 'All Categories') {
        params.push(`category=${encodeURIComponent(category)}`);
    }
    
    if (sort) {
        params.push(`sort=${encodeURIComponent(sort)}`);
    }
    
    if (search) {
        params.push(`search=${encodeURIComponent(search)}`);
    }
    
    window.location.href = url + params.join('&');
}

// Lazy loading for images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading on page load
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.getElementById('scroll-to-top');
    if (scrollButton) {
        if (window.pageYOffset > 300) {
            scrollButton.style.display = 'block';
        } else {
            scrollButton.style.display = 'none';
        }
    }
});

// Newsletter subscription
function subscribeNewsletter(email) {
    if (!email || !email.includes('@')) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate newsletter subscription
    showToast('Thank you for subscribing to our newsletter!', 'success');
    document.getElementById('newsletter-email').value = '';
}

// Product comparison
let compareList = JSON.parse(localStorage.getItem('compareList')) || [];

function addToCompare(productId) {
    if (compareList.length >= 3) {
        showToast('You can compare maximum 3 products', 'warning');
        return;
    }
    
    if (!compareList.includes(productId)) {
        compareList.push(productId);
        localStorage.setItem('compareList', JSON.stringify(compareList));
        showToast('Added to comparison list', 'success');
        updateCompareCount();
    } else {
        showToast('Product already in comparison list', 'info');
    }
}

function updateCompareCount() {
    const compareCount = document.getElementById('compare-count');
    if (compareCount) {
        compareCount.textContent = compareList.length;
        compareCount.style.display = compareList.length > 0 ? 'inline' : 'none';
    }
}

// Initialize compare count on page load
document.addEventListener('DOMContentLoaded', updateCompareCount);
