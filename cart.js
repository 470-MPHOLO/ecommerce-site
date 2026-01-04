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
            proceedToCheckout();
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
    
    // Show notification (using alert for now)
    alert(`${product.name} added to cart!`);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    loadCartItems();
    alert('Item removed from cart');
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
    alert("Proceed to checkout?\n\nCopy this order summary:\n\n" + orderSummary);
    
    // Option to copy to clipboard
    if (navigator.clipboard) {
        const copy = confirm("Copy order summary to clipboard?");
        if (copy) {
            navigator.clipboard.writeText(orderSummary)
                .then(() => alert("Order copied to clipboard!"))
                .catch(() => alert("Could not copy to clipboard"));
        }
    }
    
    // WhatsApp option
    const whatsapp = confirm("Send order via WhatsApp?");
    if (whatsapp) {
        const whatsappMessage = encodeURIComponent(orderSummary);
        window.open(`https://wa.me/27123456789?text=${whatsappMessage}`, '_blank');
    }
}
