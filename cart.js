// Shopping Cart
let cart = JSON.parse(localStorage.getItem('shopEasyCart')) || [];

function initCart() {
    updateCartCount();
    loadCartItems();
    
    // Add to cart listeners
    document.addEventListener('click', function(e) {
        const addBtn = e.target.closest('.add-to-cart');
        if (addBtn && !addBtn.disabled) {
            const productId = parseInt(addBtn.getAttribute('data-id'));
            addToCart(productId);
        }
    });
    
    // Checkout button
    document.getElementById('checkout-btn')?.addEventListener('click', proceedToCheckout);
}

function addToCart(productId) {
    const product = getProductById(productId);
    if (!product) return;
    
    // Check stock
    const stock = product.stock || 0;
    const cartItem = cart.find(item => item.id === productId);
    const currentQty = cartItem ? cartItem.quantity : 0;
    
    if (currentQty >= stock) {
        alert('Stock limit reached!');
        return;
    }
    
    // Add/update
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
    showNotification(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    loadCartItems();
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const product = getProductById(productId);
    const stock = product ? (product.stock || 0) : 0;
    
    if (newQuantity > stock) {
        alert(`Only ${stock} available!`);
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

function saveCart() {
    localStorage.setItem('shopEasyCart', JSON.stringify(cart));
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = total;
        cartCount.style.display = total > 0 ? 'flex' : 'none';
    }
}

function loadCartItems() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!container || !totalEl) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h4>Cart is empty</h4>
            </div>
        `;
        totalEl.textContent = 'R0.00';
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const product = getProductById(item.id);
        const maxQty = product ? Math.min(product.stock || 0, 99) : 99;
        
        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div>${item.name}</div>
                    <div>R${item.price.toFixed(2)} each</div>
                    <div class="quantity-controls">
                        <button class="decrease" data-id="${item.id}">-</button>
                        <input type="number" value="${item.quantity}" min="1" max="${maxQty}" data-id="${item.id}">
                        <button class="increase" data-id="${item.id}">+</button>
                        <button class="remove" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </div>
                    <div>R${itemTotal.toFixed(2)}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    totalEl.textContent = `R${total.toFixed(2)}`;
    
    // Add event listeners
    document.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const item = cart.find(item => item.id === id);
            if (item) updateQuantity(id, item.quantity - 1);
        });
    });
    
    document.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const item = cart.find(item => item.id === id);
            if (item) updateQuantity(id, item.quantity + 1);
        });
    });
    
    document.querySelectorAll('.remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            removeFromCart(id);
        });
    });
}
