// Products data - Supports both external URLs and local images
let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];

// Check if image is base64 (locally stored)
function isBase64Image(imgSrc) {
    return imgSrc && imgSrc.startsWith('data:image/');
}

// Get image source with fallback
function getImageSource(product) {
    // If it's already base64 (local), use it directly
    if (isBase64Image(product.image)) {
        return product.image;
    }
    
    // If it's a local path in our images folder
    if (product.image && product.image.includes('images/')) {
        // Use relative path for local images
        return product.image;
    }
    
    // If it's an external URL (Imgur, Postimages, etc.)
    if (product.image && product.image.startsWith('http')) {
        return product.image;
    }
    
    // Fallback image
    return getFallbackImage();
}

// Generate SVG fallback image
function getFallbackImage() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNWY1ZjUiLz48cmVjdCB4PSI1MCIgeT0iMzAiIHdpZHRoPSIyMDAiIGhlaWdodD0iMTQwIiByeD0iMTAiIGZpbGw9IiNlMGUwZTAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9IiNjY2MiLz48cmVjdCB4PSIyMDAiIHk9IjgwIiB3aWR0aD0iNTAiIGhlaWdodD0iNDAiIHJ4PSI1IiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iMTUwIiB5PSIxNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSI+UHJvZHVjdCBJbWFnZTwvdGV4dD48L3N2Zz4=';
}

// Function to save products to localStorage
function saveProducts() {
    try {
        localStorage.setItem('shopEasyProducts', JSON.stringify(products));
        console.log('Products saved successfully:', products.length);
        return true;
    } catch (e) {
        console.error('Error saving products:', e);
        if (e.name === 'QuotaExceededError') {
            alert('Storage limit reached! Please delete some products or use smaller images.');
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
        
        const imageSrc = getImageSource(product);
        const isLocalImage = isBase64Image(product.image) || 
                            (product.image && product.image.includes('images/'));
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${imageSrc}" alt="${product.name}" 
                     loading="lazy"
                     onerror="this.src='${getFallbackImage()}'; this.onerror=null;">
                ${(product.stock || 0) <= 0 ? '<div class="out-of-stock">Out of Stock</div>' : ''}
                ${isLocalImage ? '<div class="local-badge"><i class="fas fa-check-circle"></i> Local</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">R${product.price.toFixed(2)}</div>
                <div class="product-stock-badge">
                    <i class="fas fa-box"></i> ${product.stock || 0} in stock
                </div>
                <button class="add-to-cart" data-id="${product.id}" ${(product.stock || 0) <= 0 ? 'disabled' : ''}>
                    ${(product.stock || 0) <= 0 ? 
                        '<i class="fas fa-ban"></i> Out of Stock' : 
                        '<i class="fas fa-cart-plus"></i> Add to Cart'}
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
                if (typeof addToCart === 'function') {
                    addToCart(productId);
                } else {
                    alert('Cart system not loaded yet. Please refresh the page.');
                }
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
        console.log('=== ADD PRODUCT START ===');
        
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
        localStorage.setItem('shopEasyProducts', JSON.stringify(products));
        console.log('✅ Product added successfully');
        console.log('Total products now:', products.length);
        
        return newId;
        
    } catch (e) {
        console.error('Error adding product:', e);
        alert('Error adding product: ' + e.message);
        return null;
    }
}

// Function to update a product
function updateProduct(id, updatedProduct) {
    try {
        console.log('=== UPDATE PRODUCT START ===');
        
        // Load fresh products from localStorage
        let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
        
        const index = products.findIndex(p => p.id === id);
        
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
        
        // Update the product
        products[index] = { ...products[index], ...updatedProduct };
        
        // Save to localStorage
        localStorage.setItem('shopEasyProducts', JSON.stringify(products));
        console.log('✅ Products saved successfully');
        return true;
        
    } catch (error) {
        console.error('Update error:', error);
        alert('Update error: ' + error.message);
        return false;
    }
}

// Function to delete a product
function deleteProduct(id) {
    const products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products.splice(index, 1);
        localStorage.setItem('shopEasyProducts', JSON.stringify(products));
        return true;
    }
    return false;
}

// Backup and restore functions
function backupProducts() {
    const products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `shopeasy-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    alert('Backup created successfully!');
}

function restoreProducts(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (Array.isArray(data)) {
                localStorage.setItem('shopEasyProducts', JSON.stringify(data));
                alert('Products restored successfully!');
                location.reload();
            } else {
                alert('Invalid backup file format.');
            }
        } catch (error) {
            alert('Error reading backup file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Initialize products when page loads
if (typeof loadProducts === 'function' && document.readyState === 'complete') {
    loadProducts();
} else {
    document.addEventListener('DOMContentLoaded', loadProducts);
}
