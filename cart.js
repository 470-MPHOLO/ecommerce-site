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
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
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
    
    cartItemsContainer.innerHTML = cartHTML;
    cartTotalElement.textContent = `R${total.toFixed(2)}`;
    
    // Add event listeners
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

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order summary
    let orderSummary = "🛍️ SHOPEASY ORDER SUMMARY\n\n";
    orderSummary += "Order Details:\n";
    orderSummary += "────────────────\n";
    
    cart.forEach((item, index) => {
        orderSummary += `${index + 1}. ${item.name}\n`;
        orderSummary += `   Quantity: ${item.quantity} × R${item.price.toFixed(2)} = R${(item.price * item.quantity).toFixed(2)}\n\n`;
    });
    
    orderSummary += "────────────────\n";
    orderSummary += `TOTAL: R${total.toFixed(2)}\n\n`;
    orderSummary += "📞 Contact Information Required:\n";
    orderSummary += "────────────────\n";
    orderSummary += "• Full Name:\n";
    orderSummary += "• Phone Number:\n";
    orderSummary += "• Delivery Address:\n";
    orderSummary += "• Preferred Delivery Date/Time:\n\n";
    orderSummary += "Please send this information to complete your order.";
    
    // Show order summary
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'order-summary-modal';
    summaryContainer.innerHTML = `
        <div class="order-summary-content">
            <h3><i class="fas fa-receipt"></i> Order Summary</h3>
            <div class="order-details">
                <pre>${orderSummary}</pre>
            </div>
            <div class="order-actions">
                <button class="btn-secondary" id="copy-order">Copy Order</button>
                <button class="btn-primary" id="send-order">Send via WhatsApp</button>
                <button class="btn-secondary" id="print-order">Print Order</button>
                <button class="btn-secondary" id="close-summary">Close</button>
            </div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .order-summary-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .order-summary-content {
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .order-summary-content h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .order-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 25px;
            border: 1px solid #eaeaea;
        }
        
        .order-details pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.5;
            color: #333;
            margin: 0;
        }
        
        .order-actions {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        
        .order-actions button {
            padding: 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(summaryContainer);
    
    // Add event listeners
    document.getElementById('copy-order').addEventListener('click', function() {
        navigator.clipboard.writeText(orderSummary).then(() => {
            showNotification('Order copied to clipboard!', 'success');
        });
    });
    
    document.getElementById('send-order').addEventListener('click', function() {
        const whatsappMessage = encodeURIComponent(orderSummary);
        window.open(`https://wa.me/27123456789?text=${whatsappMessage}`, '_blank');
    });
    
    document.getElementById('print-order').addEventListener('click', function() {
        const printContent = `
            <html>
                <head>
                    <title>ShopEasy Order</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #2c3e50; }
                        pre { white-space: pre-wrap; font-family: monospace; }
                    </style>
                </head>
                <body>
                    <h1>ShopEasy Order Summary</h1>
                    <pre>${orderSummary}</pre>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    });
    
    document.getElementById('close-summary').addEventListener('click', function() {
        document.body.removeChild(summaryContainer);
    });
    
    // Close when clicking outside
    summaryContainer.addEventListener('click', function(e) {
        if (e.target === summaryContainer) {
            document.body.removeChild(summaryContainer);
        }
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#cart-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'cart-notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid #3498db;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .notification-content i {
                font-size: 1.2rem;
                color: #3498db;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #7f8c8d;
                margin-left: 15px;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.remove();
    });
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}
