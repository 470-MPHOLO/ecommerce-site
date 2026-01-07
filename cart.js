// Shopping Cart Functionality
let cart = JSON.parse(localStorage.getItem('shopEasyCart')) || [];

// Initialize cart
function initCart() {
    console.log('🛒 Initializing cart...');
    updateCartCount();
    loadCartItems();
    
    // Add to cart buttons event listeners
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-to-cart')) {
            const button = e.target.closest('.add-to-cart');
            if (!button.disabled) {
                const productId = parseInt(button.getAttribute('data-id'));
                addToCart(productId);
            }
        }
    });
    
    // ✅ FIXED: Event delegation for checkout button
    document.addEventListener('click', function(e) {
        // Check if checkout button was clicked (anywhere in the document)
        if (e.target.id === 'checkout-btn' || e.target.closest('#checkout-btn')) {
            e.preventDefault();
            showCheckoutForm();
        }
    });
    
    // Cart icon click
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            const cartSidebar = document.getElementById('cart-sidebar');
            if (cartSidebar) {
                cartSidebar.style.right = '0';
                // Refresh cart when opening
                loadCartItems();
            }
        });
    }
    
    // Close sidebar
    const closeSidebar = document.querySelector('.close-sidebar');
    if (closeSidebar) {
        closeSidebar.addEventListener('click', function() {
            const cartSidebar = document.getElementById('cart-sidebar');
            if (cartSidebar) {
                cartSidebar.style.right = '-400px';
            }
        });
    }
    
    console.log('✅ Cart initialized');
}

// Add item to cart
function addToCart(productId) {
    const product = getProductById(productId);
    
    if (!product) {
        alert('Product not found!');
        return;
    }
    
    // Check stock
    const stock = product.stock || 0;
    const cartItem = cart.find(item => item.id === productId);
    const currentQuantity = cartItem ? cartItem.quantity : 0;
    
    if (currentQuantity >= stock) {
        alert('Cannot add more items. Stock limit reached!');
        return;
    }
    
    // Add or update item in cart
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // Save to localStorage
    saveCart();
    
    // Update UI
    updateCartCount();
    loadCartItems();
    
    // Show notification
    showNotification(`${product.name} added to cart!`, 'success');
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    loadCartItems();
    showNotification('Item removed from cart', 'info');
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    // Check stock
    const product = getProductById(productId);
    const stock = product ? (product.stock || 0) : 0;
    
    if (newQuantity > stock) {
        alert(`Only ${stock} items available in stock!`);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartCount();
        loadCartItems();
    }
}

// Save cart to localStorage
function saveCart() {
    try {
        localStorage.setItem('shopEasyCart', JSON.stringify(cart));
    } catch (e) {
        console.error('Error saving cart:', e);
    }
}

// Update cart count in header
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Load cart items in sidebar
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsContainer || !cartTotalElement) {
        console.log('⚠️ Cart elements not found');
        return;
    }
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h4>Your cart is empty</h4>
                <p>Add some products to get started</p>
            </div>
        `;
        cartTotalElement.textContent = 'R0.00';
        return;
    }
    
    let cartHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        // Get product stock
        const product = getProductById(item.id);
        const stock = product ? (product.stock || 0) : 0;
        const maxQuantity = Math.min(stock, 99);
        
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNlZWUiLz48cGF0aCBkPSJNMzUgMzVBNTAgNTAgMCAxIDAgMzUgMTE1QTUwIDUwIDAgMSAwIDM1IDM1Wk0xMTUgNUg1VjIwSDExNVY1WiIgZmlsbD0iI2NjYyIvPjwvc3ZnPg=='">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">R${item.price.toFixed(2)} each</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="${maxQuantity}" 
                               data-id="${item.id}">
                        <button class="quantity-btn increase" data-id="${item.id}" ${item.quantity >= maxQuantity ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="remove-item" data-id="${item.id}" title="Remove">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="cart-item-total">R${itemTotal.toFixed(2)}</div>
                </div>
            </div>
        `;
    });
    
    // Add checkout button
    cartHTML += `
        <div class="cart-checkout-section">
            <div class="cart-total-row">
                <span>Total:</span>
                <span id="cart-total-final">R${total.toFixed(2)}</span>
            </div>
            <button id="checkout-btn" class="checkout-btn">
                <i class="fab fa-whatsapp"></i> Checkout via WhatsApp
            </button>
        </div>
    `;
    
    cartItemsContainer.innerHTML = cartHTML;
    cartTotalElement.textContent = `R${total.toFixed(2)}`;
    
    // Add event listeners for quantity buttons
    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const item = cart.find(item => item.id === productId);
            if (item) {
                updateQuantity(productId, item.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.increase').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const item = cart.find(item => item.id === productId);
            if (item) {
                updateQuantity(productId, item.quantity + 1);
            }
        });
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const newQuantity = parseInt(this.value) || 1;
            updateQuantity(productId, newQuantity);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
    
    console.log('✅ Cart items loaded');
}

// Show checkout form
function showCheckoutForm() {
    console.log('🛒 Checkout button clicked');
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Remove any existing modal
    const existingModal = document.getElementById('checkout-modal');
    if (existingModal) existingModal.remove();
    
    // Create checkout form modal
    const modalHTML = `
        <div id="checkout-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 15px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 style="margin: 0; color: #2c3e50;">
                        <i class="fas fa-shopping-bag"></i> Complete Your Order
                    </h2>
                    <button onclick="closeCheckoutModal()" 
                            style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">
                        &times;
                    </button>
                </div>
                
                <form id="checkout-form">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                            <i class="fas fa-user"></i> Full Name *
                        </label>
                        <input type="text" id="customer-name" required 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;"
                               placeholder="Enter your full name">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                            <i class="fas fa-phone"></i> Phone Number *
                        </label>
                        <input type="tel" id="customer-phone" required 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;"
                               placeholder="+266 5953 4172">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                            <i class="fas fa-map-marker-alt"></i> Delivery Address *
                        </label>
                        <textarea id="customer-address" required rows="3"
                                  style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;"
                                  placeholder="Full address including street, city, etc."></textarea>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">
                            <i class="fas fa-sticky-note"></i> Delivery Notes (Optional)
                        </label>
                        <textarea id="delivery-notes" rows="2"
                                  style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;"
                                  placeholder="Any special instructions?"></textarea>
                    </div>
                    
                    <!-- Order Summary -->
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                        <h3 style="margin-top: 0; color: #2c3e50;">
                            <i class="fas fa-receipt"></i> Order Summary
                        </h3>
                        <div id="order-summary">
                            ${generateOrderSummary()}
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px;">
                        <button type="button" onclick="closeCheckoutModal()" 
                                style="flex: 1; padding: 15px; background: #6c757d; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">
                            Cancel
                        </button>
                        <button type="submit" 
                                style="flex: 1; padding: 15px; background: #25D366; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">
                            <i class="fab fa-whatsapp"></i> Send Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add form submit handler
    document.getElementById('checkout-form').addEventListener('submit', function(e) {
        e.preventDefault();
        completeOrder();
    });
}

// Generate order summary
function generateOrderSummary() {
    let total = 0;
    let summary = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        summary += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                <div>
                    <div style="font-weight: 600;">${item.name}</div>
                    <div style="font-size: 14px; color: #666;">${item.quantity} × R${item.price.toFixed(2)}</div>
                </div>
                <div style="font-weight: 600;">R${itemTotal.toFixed(2)}</div>
            </div>
        `;
    });
    
    summary += `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd;">
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700;">
                <span>Total:</span>
                <span>R${total.toFixed(2)}</span>
            </div>
        </div>
    `;
    
    return summary;
}

// Complete order
function completeOrder() {
    // Get form values
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    const notes = document.getElementById('delivery-notes').value.trim();
    
    // Validation
    if (!name || !phone || !address) {
        alert('Please fill all required fields (Name, Phone, Address)');
        return;
    }
    
    // Create WhatsApp message
    let whatsappMessage = "🛍️ *SHOPEASY ORDER* 🛍️\n\n";
    whatsappMessage += "========================\n";
    whatsappMessage += "*CUSTOMER INFORMATION*\n";
    whatsappMessage += "========================\n";
    whatsappMessage += `👤 *Name:* ${name}\n`;
    whatsappMessage += `📞 *Phone:* ${phone}\n`;
    whatsappMessage += `📍 *Address:* ${address}\n`;
    if (notes) {
        whatsappMessage += `📝 *Notes:* ${notes}\n`;
    }
    
    whatsappMessage += "\n========================\n";
    whatsappMessage += "*ORDER DETAILS*\n";
    whatsappMessage += "========================\n\n";
    
    let total = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        whatsappMessage += `*${index + 1}. ${item.name}*\n`;
        whatsappMessage += `   Quantity: ${item.quantity}\n`;
        whatsappMessage += `   Price: R${item.price.toFixed(2)} each\n`;
        whatsappMessage += `   Subtotal: R${itemTotal.toFixed(2)}\n\n`;
    });
    
    whatsappMessage += "========================\n";
    whatsappMessage += `💰 *TOTAL: R${total.toFixed(2)}*\n\n`;
    whatsappMessage += "📋 *ORDER INFO*\n";
    whatsappMessage += `Date: ${new Date().toLocaleDateString()}\n`;
    whatsappMessage += `Time: ${new Date().toLocaleTimeString()}\n`;
    whatsappMessage += `Order ID: ORD${Date.now().toString().slice(-6)}`;
    
    // Your WhatsApp number
    const whatsappNumber = "26659534172"; // Remove + for URL
    
    // Encode for WhatsApp URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // Open WhatsApp
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartCount();
    loadCartItems();
    
    // Close modal
    closeCheckoutModal();
    
    // Show success message
    showNotification('Order sent! Check WhatsApp to complete.', 'success');
}

// Close checkout modal
function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.remove();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const colors = {
        'success': '#4CAF50',
        'error': '#e74c3c',
        'info': '#3498db',
        'warning': '#f39c12'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10001;
        font-weight: 500;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle',
        'warning': 'fa-exclamation-triangle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// CSS for slide-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
