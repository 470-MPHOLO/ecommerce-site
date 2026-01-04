// Products data - Google Drive URLs only
let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];

// Function to save products to localStorage
function saveProducts() {
    try {
        localStorage.setItem('shopEasyProducts', JSON.stringify(products));
        console.log('Products saved successfully:', products.length);
        return true;
    } catch (e) {
        console.error('Error saving products:', e);
        if (e.name === 'QuotaExceededError') {
            alert('Storage limit reached! Please delete some products.');
        }
        return false;
    }
}

// Function to load and display products on main page
function loadProducts() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;
    
    productGrid.innerHTML = '';
    
    if (products.length === 0) {
        productGrid.innerHTML = `
            <div class="empty-products">
                <i class="fas fa-box-open"></i>
                <h3>No Products Available</h3>
                <p>Check back soon for new products!</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-category', product.category);
        productCard.setAttribute('data-id', product.id);
        
        // Fallback image for Google Drive errors
        const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz48cmVjdCB4PSI1MCIgeT0iMzAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMTQwIiByeD0iMTAiIGZpbGw9IiNlMGUwZTAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9IiNjY2MiLz48cmVjdCB4PSIyMDAiIHk9IjgwIiB3aWR0aD0iNTAiIGhlaWdodD0iNDAiIHJ4PSI1IiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iMTUwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSI+UHJvZHVjdCBJbWFnZTwvdGV4dD48L3N2Zz4=';
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" 
                     loading="lazy"
                     onerror="this.src='${fallbackImage}'; this.onerror=null;">
                ${(product.stock || 0) <= 0 ? '<div class="out-of-stock">Out of Stock</div>' : ''}
                <div class="drive-hosted"><i class="fab fa-google-drive"></i></div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">R${product.price.toFixed(2)}</div>
                <div class="product-stock-badge">
                    <i class="fas fa-box"></i> ${product.stock || 0} in stock
                </div>
                <button class="add-to-cart" data-id="${product.id}" ${(product.stock || 0) <= 0 ? 'disabled' : ''}>
                    ${(product.stock || 0) <= 0 ? '<i class="fas fa-ban"></i> Out of Stock' : '<i class="fas fa-cart-plus"></i> Add to Cart'}
                </button>
            </div>
        `;
        
        productGrid.appendChild(productCard);
    });
    
    // Add event listeners to add-to-cart buttons
    setTimeout(() => {
        document.querySelectorAll('.add-to-cart:not([disabled])').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                addToCart(productId);
            });
        });
    }, 100);
}

// Function to get product by ID
function getProductById(id) {
    return products.find(product => product.id === id);
}


// Function to add a new product - FIXED VERSION
function addProduct(product) {
    try {
        console.log('=== ADD PRODUCT START ===');
        console.log('Product to add:', product);
        
        // Load fresh products
        let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
        
        // Generate a new ID
        let newId = 1;
        if (products.length > 0) {
            const maxId = Math.max(...products.map(p => p.id));
            newId = maxId + 1;
        }
        
        product.id = newId;
        product.dateAdded = new Date().toISOString();
        product.stock = product.stock || 1;
        
        console.log('Generated ID:', newId);
        
        // Add to array
        products.push(product);
        
        // Save to localStorage
        try {
            localStorage.setItem('shopEasyProducts', JSON.stringify(products));
            console.log('✅ Product added successfully');
            console.log('Total products now:', products.length);
            console.log('=== ADD PRODUCT END ===');
            return newId;
        } catch (saveError) {
            console.error('Save error:', saveError);
            if (saveError.name === 'QuotaExceededError') {
                alert('Storage full! Please delete some products.');
            }
            return null;
        }
        
    } catch (e) {
        console.error('Error adding product:', e);
        alert('Error adding product: ' + e.message);
        return null;
    }
}



// Function to update a product - FIXED VERSION
function updateProduct(id, updatedProduct) {
    try {
        console.log('=== UPDATE PRODUCT START ===');
        console.log('Product ID to update:', id);
        console.log('Updated product data:', updatedProduct);
        
        // Load fresh products from localStorage
        let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
        console.log('Current products in storage:', products.length);
        
        const index = products.findIndex(p => p.id === id);
        console.log('Found at index:', index);
        
        if (index === -1) {
            console.error('Product not found with ID:', id);
            return false;
        }
        
        // Preserve original dateAdded if not provided
        if (!updatedProduct.dateAdded) {
            updatedProduct.dateAdded = products[index].dateAdded;
        }
        
        // Keep original ID
        updatedProduct.id = id;
        
        console.log('Original product:', products[index]);
        console.log('Updated product:', updatedProduct);
        
        // Update the product
        products[index] = { ...products[index], ...updatedProduct };
        
        console.log('Product after update:', products[index]);
        
        // Save to localStorage
        try {
            localStorage.setItem('shopEasyProducts', JSON.stringify(products));
            console.log('✅ Products saved successfully');
            console.log('=== UPDATE PRODUCT END ===');
            return true;
        } catch (saveError) {
            console.error('Save error:', saveError);
            if (saveError.name === 'QuotaExceededError') {
                alert('Storage full! Please delete some products.');
            }
            return false;
        }
        
    } catch (error) {
        console.error('Update error:', error);
        alert('Update error: ' + error.message);
        return false;
    }
}








        

// Function to delete a product
function deleteProduct(id) {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products.splice(index, 1);
        saveProducts();
        return true;
    }
    return false;
}

// Function to get all products by category
function getProductsByCategory(category) {
    if (category === 'all') return products;
    return products.filter(product => product.category === category);
}

// Function to search products
function searchProducts(query) {
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );
}
