// Products data
let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];

function saveProducts() {
    try {
        localStorage.setItem('shopEasyProducts', JSON.stringify(products));
        return true;
    } catch (e) {
        console.error('Save error:', e);
        return false;
    }
}

function loadProducts() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;
    
    productGrid.innerHTML = '';
    
    if (products.length === 0) {
        productGrid.innerHTML = `
            <div class="empty-products">
                <i class="fas fa-box-open"></i>
                <h3>No Products Yet</h3>
                <p>Check back soon!</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-category', product.category);
        productCard.setAttribute('data-id', product.id);
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz48cmVjdCB4PSI1MCIgeT0iMzAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMTQwIiByeD0iMTAiIGZpbGw9IiNlMGUwZTAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9IiNjY2MiLz48cmVjdCB4PSIyMDAiIHk9IjgwIiB3aWR0aD0iNTAiIGhlaWdodD0iNDAiIHJ4PSI1IiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iMTUwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSI+UHJvZHVjdCBJbWFnZTwvdGV4dD48L3N2Zz4='">
                ${(product.stock || 0) <= 0 ? '<div class="out-of-stock">Out of Stock</div>' : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">R${product.price.toFixed(2)}</div>
                <div class="product-stock">${product.stock || 0} in stock</div>
                <button class="add-to-cart" data-id="${product.id}" ${(product.stock || 0) <= 0 ? 'disabled' : ''}>
                    ${(product.stock || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;
        
        productGrid.appendChild(productCard);
    });
    
    // Add cart listeners
    setTimeout(() => {
        document.querySelectorAll('.add-to-cart:not([disabled])').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                if (typeof addToCart === 'function') {
                    addToCart(productId);
                }
            });
        });
    }, 100);
}

function getProductById(id) {
    return products.find(product => product.id === id);
}

function addProduct(product) {
    try {
        // Load fresh
        let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
        
        // Generate ID
        let newId = 1;
        if (products.length > 0) {
            const maxId = Math.max(...products.map(p => p.id));
            newId = maxId + 1;
        }
        
        product.id = newId;
        product.dateAdded = new Date().toISOString();
        
        // Add and save
        products.push(product);
        localStorage.setItem('shopEasyProducts', JSON.stringify(products));
        
        return newId;
    } catch (e) {
        console.error('Add error:', e);
        return null;
    }
}

function updateProduct(id, updatedProduct) {
    try {
        let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
        const index = products.findIndex(p => p.id === id);
        
        if (index === -1) return false;
        
        // Keep original date
        updatedProduct.dateAdded = products[index].dateAdded;
        updatedProduct.id = id;
        
        // Update
        products[index] = updatedProduct;
        localStorage.setItem('shopEasyProducts', JSON.stringify(products));
        
        return true;
    } catch (error) {
        console.error('Update error:', error);
        return false;
    }
}
