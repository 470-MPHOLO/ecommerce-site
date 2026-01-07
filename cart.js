// Shopping Cart Functionality
let cart = JSON.parse(localStorage.getItem('shopEasyCart')) || [];

// Initialize cart
function initCart() {
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
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            showCheckoutForm();
        });
    }
    
    // Cart icon click
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            const cartSidebar = document.getElementById('cart-sidebar');
            if (cartSidebar) {
                cartSidebar.style.right = '0';
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
}

// Show checkout form
function showCheckoutForm() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
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
                border-radius: 10px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <h2 style="margin-top: 0;">📝 Checkout</h2>
                
                <!-- Contact Form -->
                <form id="contact-form">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                            Full Name *
                        </label>
                        <input type="text" id="customer-name" required 
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"
                               placeholder="Enter your full name">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                            Phone Number *
                        </label>
                        <input type="tel" id="customer-phone" required 
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"
                               placeholder="+266 123 4567">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                            Delivery Address *
                        </label>
                        <textarea id="customer-address" required rows="3"
                                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"
                                  placeholder="Full address including street, city, etc."></textarea>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                            Delivery Notes (Optional)
                        </label>
                        <textarea id="delivery-notes" rows="2"
                                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"
                                  placeholder="Any special instructions?"></textarea>
                    </div>
                    
                    <!-- Order Summary -->
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <h3 style="margin-top: 0;">📦 Order Summary</h3>
                        ${generateOrderSummary()}
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button type="button" onclick="closeCheckoutModal()" 
                                style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 5px;">
                            Cancel
                        </button>
                        <button type="submit" 
                                style="flex: 1; padding: 12px; background: #4CAF50; color: white; border: none; border-radius: 5px;">
                            Complete Order via WhatsApp
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Handle form submission
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        completeOrder();
    });
}

// Generate order summary HTML
function generateOrderSummary() {
    let total = 0;
    let summary = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        summary += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${item.name} × ${item.quantity}</span>
                <span>R${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    summary += `
        <div style="border-top: 1px solid #ddd; margin-top: 10px; padding-top: 10px; font-weight: bold;">
            <div style="display: flex; justify-content: space-between;">
                <span>Total:</span>
                <span>R${total.toFixed(2)}</span>
            </div>
        </div>
    `;
    
    return summary;
}

// Complete order via WhatsApp
function completeOrder() {
    // Get form values
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    const notes = document.getElementById('delivery-notes').value.trim();
    
    // Validation
    if (!name || !phone || !address) {
        alert('Please fill all required fields');
        return;
    }
    
    // Create WhatsApp message
    let whatsappMessage = "🛍️ *NEW ORDER - SHOPEASY*\n\n";
    whatsappMessage += "*Customer Information:*\n";
    whatsappMessage += `👤 Name: ${name}\n`;
    whatsappMessage += `📞 Phone: ${phone}\n`;
    whatsappMessage += `📍 Address: ${address}\n`;
    if (notes) {
        whatsappMessage += `📝 Notes: ${notes}\n`;
    }
    
    whatsappMessage += "\n────────────────\n\n";
    whatsappMessage += "*Order Details:*\n";
    whatsappMessage += "────────────────\n";
    
    let total = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        whatsappMessage += `\n${index + 1}. *${item.name}*\n`;
        whatsappMessage += `   Quantity: ${item.quantity} × R${item.price.toFixed(2)}\n`;
        whatsappMessage += `   Subtotal: R${itemTotal.toFixed(2)}\n`;
    });
    
    whatsappMessage += "\n────────────────\n";
    whatsappMessage += `💰 *TOTAL: R${total.toFixed(2)}*\n\n`;
    whatsappMessage += `📅 Order Date: ${new Date().toLocaleDateString('en-GB')}\n`;
    whatsappMessage += `⏰ Order Time: ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}\n`;
    whatsappMessage += `🆔 Order ID: ORD${Date.now().toString().slice(-8)}`;
    
    // Encode for WhatsApp URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // YOUR WHATSAPP NUMBER
    const whatsappNumber = "+26659534172";
    
    // Open WhatsApp
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartCount();
    loadCartItems();
    
    // Close modal
    closeCheckoutModal();
    
    // Show confirmation
    alert('✅ Order sent via WhatsApp! We will contact you shortly.');
}

// Close checkout modal
function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.remove();
    }
}

// Add item to cart (keep existing)
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
    
    saveCart();
    updateCartCount();
    loadCartItems();
    
    // Show success message
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i> ${product.name} added to cart!
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Remove item from cart (keep existing)
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    loadCartItems();
}

// Update item quantity (keep existing)
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
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

// Save cart (keep existing)
function saveCart() {
    try {
        localStorage.setItem('shopEasyCart', JSON.stringify(cart));
    } catch (e) {
        console.error('Error saving cart:', e);
    }
}

// Update cart count (keep existing)
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Load cart items (keep existing, but add checkout button)
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsContainer || !cartTotalElement) return;
    
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
    
    // Add checkout button listener
    document.getElementById('checkout-btn').addEventListener('click', showCheckoutForm);
    
    // Add event listeners for quantity buttons (keep existing)
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
}
