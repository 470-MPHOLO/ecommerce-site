// Products data with Google Drive support
let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [
    {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        description: "Noise cancelling over-ear headphones with 30hr battery life. Perfect for music lovers and professionals.",
        price: 1499.99,
        category: "electronics",
        stock: 10,
        image: "https://drive.google.com/uc?id=1RDUyeQ3tI6QmGCHyVt7I4y-2kHwJ8p7T", // Example Google Drive URL
        dateAdded: "2023-01-01"
    },
    {
        id: 2,
        name: "Smart Watch Series 5",
        description: "Fitness tracker with heart rate monitor, GPS, and sleep tracking. Water resistant up to 50m.",
        price: 2999.99,
        category: "electronics",
        stock: 5,
        image: "https://drive.google.com/uc?id=1sKj9l3mNpOqR8tUvWxYz2AbC3De4F5G6", // Example Google Drive URL
        dateAdded: "2023-01-02"
    }
];

// Function to save products to localStorage
function saveProducts() {
    try {
        localStorage.setItem('shopEasyProducts', JSON.stringify(products));
        console.log('Products saved successfully:', products.length);
        return true;
    } catch (e) {
        console.error('Error saving products:', e);
        if (e.name === 'QuotaExceededError') {
            alert('Storage limit reached! Please delete some products or use Google Drive for images.');
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
        
        // Handle both Base64 and Google Drive URLs
        let imageSrc = product.image || '';
        
        // Check image type
        const isBase64 = imageSrc.startsWith('data:image');
        const isGoogleDrive = imageSrc.includes('drive.google.com');
        
        // Fallback image for errors
        const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz48cmVjdCB4PSI1MCIgeT0iMzAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMTQwIiByeD0iMTAiIGZpbGw9IiNlMGUwZTAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9IiNjY2MiLz48cmVjdCB4PSIyMDAiIHk9IjgwIiB3aWR0aD0iNTAiIGhlaWdodD0iNDAiIHJ4PSI1IiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iMTUwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSI+UHJvZHVjdCBJbWFnZTwvdGV4dD48L3N2Zz4=';
        
        // Add loading attribute for better performance
        const loadingAttr = isGoogleDrive ? 'loading="lazy"' : '';
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${imageSrc}" alt="${product.name}" 
                     ${loadingAttr}
                     onerror="
                        if (this.src !== '${fallbackImage}') {
                            this.src = '${fallbackImage}';
                        }
                     ">
                ${(product.stock || 0) <= 0 ? '<div class="out-of-stock">Out of Stock</div>' : ''}
                ${isGoogleDrive ? '<div class="drive-hosted"><i class="fab fa-google-drive"></i></div>' : ''}
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

// Function to add a new product
function addProduct(product) {
    try {
        // Generate a new ID
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        product.id = newId;
        product.dateAdded = new Date().toISOString();
        product.stock = product.stock || 1;
        
        products.push(product);
        saveProducts();
        return newId;
    } catch (e) {
        console.error('Error adding product:', e);
        return null;
    }
}

// Function to update a product
function updateProduct(id, updatedProduct) {
    try {
        console.log('Attempting to update product ID:', id);
        
        const index = products.findIndex(p => p.id === id);
        
        if (index !== -1) {
            // Preserve original dateAdded if not provided
            if (!updatedProduct.dateAdded) {
                updatedProduct.dateAdded = products[index].dateAdded;
            }
            
            // Keep original ID
            updatedProduct.id = id;
            
            products[index] = { ...products[index], ...updatedProduct };
            console.log('Product updated successfully:', products[index].name);
            
            const saveResult = saveProducts();
            console.log('Save result:', saveResult);
            
            return saveResult;
        } else {
            console.error('Product not found with ID:', id);
            return false;
        }
    } catch (e) {
        console.error('Update error:', e);
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
