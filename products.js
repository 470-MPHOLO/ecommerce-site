// Products data with Base64 image support
let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [
    {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        description: "Noise cancelling over-ear headphones with 30hr battery life. Perfect for music lovers and professionals.",
        price: 1499.99,
        category: "electronics",
        stock: 10,
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM0Mjg1ZjQiLz48cmVjdCB4PSI2MCIgeT0iMTIwIiB3aWR0aD0iODAiIGhlaWdodD0iMjAiIHJ4PSIxMCIgZmlsbD0iIzQyODVmNCIvPjwvc3ZnPg==",
        dateAdded: "2023-01-01"
    },
    {
        id: 2,
        name: "Smart Watch Series 5",
        description: "Fitness tracker with heart rate monitor, GPS, and sleep tracking. Water resistant up to 50m.",
        price: 2999.99,
        category: "electronics",
        stock: 5,
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjUwIiBmaWxsPSIjMzQ5ODdiIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI0MCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==",
        dateAdded: "2023-01-02"
    }
];

// Function to save products to localStorage
function saveProducts() {
    try {
        localStorage.setItem('shopEasyProducts', JSON.stringify(products));
        return true;
    } catch (e) {
        console.error('Error saving products:', e);
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
        
        // Handle image (Base64 or URL)
        let imageSrc = product.image;
        if (!imageSrc.startsWith('data:image') && !imageSrc.startsWith('http')) {
            // Fallback placeholder
            imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWUiLz48cGF0aCBkPSJNNzUgODVBNTAuMDAwMSA1MC4wMDAwMSAwIDEgMCA3NSAxODVBNTAuMDAwMSA1MC4wMDAwMSAwIDEgMCA3NSA4NVpNMTc1IDVIMjVWMjBIMTc1VjVaIiBmaWxsPSIjY2NjIi8+PC9zdmc+';
        }
        
        // Check stock status
        const stock = product.stock || 0;
        const outOfStock = stock <= 0;
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${imageSrc}" alt="${product.name}" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWUiLz48cGF0aCBkPSJNNzUgODVBNTAuMDAwMSA1MC4wMDAwMSAwIDEgMCA3NSAxODVBNTAuMDAwMSA1MC4wMDAwMSAwIDEgMCA3NSA4NVpNMTc1IDVIMjVWMjBIMTc1VjVaIiBmaWxsPSIjY2NjIi8+PC9zdmc+'">
                ${outOfStock ? '<div class="out-of-stock">Out of Stock</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">R${product.price.toFixed(2)}</div>
                <div class="product-stock-badge">
                    <i class="fas fa-box"></i> ${stock} in stock
                </div>
                <button class="add-to-cart" data-id="${product.id}" ${outOfStock ? 'disabled' : ''}>
                    ${outOfStock ? '<i class="fas fa-ban"></i> Out of Stock' : '<i class="fas fa-cart-plus"></i> Add to Cart'}
                </button>
            </div>
        `;
        
        productGrid.appendChild(productCard);
    });
    
    // Add event listeners to add-to-cart buttons
    document.querySelectorAll('.add-to-cart:not([disabled])').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
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
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        // Preserve original dateAdded if not provided
        if (!updatedProduct.dateAdded) {
            updatedProduct.dateAdded = products[index].dateAdded;
        }
        
        products[index] = { ...products[index], ...updatedProduct };
        saveProducts();
        return true;
    }
    return false;
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
