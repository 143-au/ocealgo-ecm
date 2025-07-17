// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM elements
const cartCountElements = document.querySelectorAll('#cart-count');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    initializeCartPage();
    initializeContactForm();
    initializeMobileMenu();
    initializeScrollAnimations();
});

// Scroll-based animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.slide-up, .fade-in').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // Add staggered animation delays for grid items
    document.querySelectorAll('.products-grid .product-card, .highlights-grid .highlight-item, .values-grid .value-item').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

// Mobile menu functionality
function initializeMobileMenu() {
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// Update cart count in navigation
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = totalItems;
        }
    });
}

// Add to cart functionality
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: parseFloat(price),
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showAddToCartMessage(name);
}

// Show add to cart message
function showAddToCartMessage(productName) {
    // Create a temporary message element
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background-color: var(--success-color);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        z-index: 10000;
        font-family: var(--font-family);
        font-weight: 600;
        font-size: var(--font-size-sm);
        transform: translateX(100%);
        transition: all var(--transition-normal);
        backdrop-filter: blur(10px);
        border: 1px solid var(--seafoam);
    `;
    message.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span>✓</span>
            <span>${productName} added to cart!</span>
        </div>
    `;
    document.body.appendChild(message);
    
    // Animate in
    setTimeout(() => {
        message.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        message.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 4000);
}

// Remove from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    initializeCartPage();
}

// Update quantity
function updateQuantity(id, newQuantity) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity = Math.max(1, newQuantity);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        initializeCartPage();
    }
}

// Initialize cart page
function initializeCartPage() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.style.display = 'none';
        cartSummary.style.display = 'none';
        cartEmpty.style.display = 'block';
        return;
    }
    
    cartEmpty.style.display = 'none';
    cartItemsContainer.style.display = 'block';
    cartSummary.style.display = 'block';
    
    // Render cart items
    cartItemsContainer.innerHTML = `
        <div class="cart-items">
            ${cart.map(item => `
                <div class="cart-item">
                    <img src="${getProductImage(item.id)}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h3>${item.name}</h3>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                               onchange="updateQuantity('${item.id}', this.value)">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')">Remove</button>
                </div>
            `).join('')}
        </div>
    `;
    
    // Update cart summary
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${subtotal.toFixed(2)}`;
}

// Get product image based on ID
function getProductImage(id) {
    const images = {
        'wet-wipes': 'https://images.pexels.com/photos/6823564/pexels-photo-6823564.jpeg?auto=compress&cs=tinysrgb&w=400',
        'baby-wipes': 'https://images.pexels.com/photos/6787202/pexels-photo-6787202.jpeg?auto=compress&cs=tinysrgb&w=400'
    };
    return images[id] || 'https://images.pexels.com/photos/6823564/pexels-photo-6823564.jpeg?auto=compress&cs=tinysrgb&w=400';
}

// Initialize contact form
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');
            
            // Show success message
            showContactMessage('Thank you for your message! We\'ll get back to you soon.');
            
            // Reset form
            contactForm.reset();
        });
    }
}

// Show contact form message
function showContactMessage(messageText) {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background-color: var(--success-color);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        z-index: 10000;
        font-family: var(--font-family);
        font-weight: 600;
        font-size: var(--font-size-sm);
        transform: translateX(100%);
        transition: all var(--transition-normal);
        max-width: 300px;
        backdrop-filter: blur(10px);
        border: 1px solid var(--seafoam);
    `;
    message.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span>✓</span>
            <span>${messageText}</span>
        </div>
    `;
    document.body.appendChild(message);
    
    // Animate in
    setTimeout(() => {
        message.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        message.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 5000);
}

// Add event listeners for "Add to Cart" buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart')) {
        const id = e.target.dataset.id;
        const name = e.target.dataset.name;
        const price = e.target.dataset.price;
        
        addToCart(id, name, price);
    }
});

// Smooth scrolling for anchor links
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

// Enhanced scroll effects
let ticking = false;

function updateScrollEffects() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    // Parallax effect for hero background
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
    
    ticking = false;
}

function requestScrollUpdate() {
    if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
    }
}

window.addEventListener('scroll', requestScrollUpdate);

// Handle window resize for mobile menu
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Enhanced button interactions
document.addEventListener('click', function(e) {
    // Ripple effect for buttons
    if (e.target.classList.contains('btn-primary') || e.target.classList.contains('btn-secondary')) {
        const button = e.target;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});

// Add ripple animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Add to window for global access
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;