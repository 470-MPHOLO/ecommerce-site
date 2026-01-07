// Admin JavaScript - Imgur Integration Version
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
});

function checkAdminAuth() {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    const authCheck = document.getElementById('admin-auth-check');
    
    if (!isAuthenticated) {
        authCheck.style.display = 'flex';
        
        document.getElementById('auth-submit').addEventListener('click', function() {
            const password = document.getElementById('auth-password').value;
            if (password === 'admin123') {
                localStorage.setItem('adminAuthenticated', 'true');
                authCheck.style.display = 'none';
                initAdminPanel();
            } else {
                document.getElementById('auth-error').textContent = 'Incorrect password!';
            }
        });
    } else {
        authCheck.style.display = 'none';
        initAdminPanel();
    }
}

function initAdminPanel() {
    loadAdminProducts();
    setupEventListeners();
}

function setupEventListeners() {
    // Logout
    document.getElementById('logout-admin').addEventListener('click', function() {
        localStorage.removeItem('adminAuthenticated');
        window.location.href = 'index.html';
    });
    
    // Add Product buttons
    document.getElementById('add-product-btn').addEventListener('click', function(e) {
        e.preventDefault();
        openProductModal();
    });
    
    document.getElementById('add-first-product').addEventListener('click', function(e) {
        e.preventDefault();
        openProductModal();
    });
    
    // Modal close
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('product-modal').style.display = 'none';
        resetProductForm();
    });
    
    document.querySelector('.close-modal-btn').addEventListener('click', function() {
        document.getElementById('product-modal').style.display = 'none';
        resetProductForm();
    });
    
    // Form submission
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    
    // Imgur image testing
    document.getElementById('test-image-btn').addEventListener('click', testImageUrl);
    
    // Change/Clear image
    document.getElementById('change-image-btn').addEventListener('click', function() {
        resetImageForm();
        document.getElementById('image-url').focus();
    });
    
    document.getElementById('clear-image-btn').addEventListener('click', resetImageForm);
    
    // Auto-test when URL is pasted
    document.getElementById('image-url').addEventListener('blur', function() {
        if (this.value.trim().startsWith('https://i.imgur.com/')) {
            testImageUrl();
        }
    });
    
    // Delete modal
    document.getElementById('cancel-delete').addEventListener('click', function() {
        document.getElementById('delete-modal').style.display = 'none';
    });
    
    document.getElementById('confirm-delete').addEventListener('click', function() {
        const productId = parseInt(this.getAttribute('data-product-id'));
        deleteProduct(productId);
        document.getElementById('delete-modal').style.display = 'none';
        loadAdminProducts();
    });
    
    // Help modal tabs
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab
            document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show correct content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });
}

function testImageUrl() {
    const imageUrl = document.getElementById('image-url').value.trim();
    const previewContainer = document.getElementById('image-preview-container');
    const previewStatus = document.getElementById('preview-status');
    const imagePreview = document.getElementById('image-preview');
    const urlStatus = document.getElementById('url-status');
    
    if (!imageUrl) {
        urlStatus.innerHTML = '<span style="color: #dc3545;"><i class="fas fa-times-circle"></i> Please enter URL</span>';
        return;
    }
    
    // Validate Imgur URL format
    if (!imageUrl.startsWith('https://i.imgur.com/')) {
        urlStatus.innerHTML = '<span style="color: #dc3545;"><i class="fas fa-times-circle"></i> Must be i.imgur.com URL</span>';
        previewStatus.className = 'preview-error';
        previewStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Invalid URL format';
        previewContainer.style.display = 'block';
        imagePreview.style.display = 'none';
        return;
    }
    
    urlStatus.innerHTML = '<span style="color: #ffc107;"><i class="fas fa-spinner fa-spin"></i> Testing...</span>';
    previewContainer.style.display = 'block';
    previewStatus.className = 'preview-loading';
    previewStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading image...';
    imagePreview.style.display = 'none';
    
    // Test if image loads
    const img = new Image();
    
    img.onload = function() {
        // Success - image loaded
        urlStatus.innerHTML = '<span class="imgur-success"><i class="fas fa-check-circle"></i> Valid Imgur URL</span>';
        previewStatus.className = 'preview-success';
        previewStatus.innerHTML = '<i class="fas fa-check-circle"></i> Image loaded successfully!';
        imagePreview.src = imageUrl;
        imagePreview.style.display = 'block';
        imagePreview.style.maxWidth = '100%';
        imagePreview.style.maxHeight = '300px';
        imagePreview.style.borderRadius = '5px';
        
        // Store the validated URL
        document.getElementById('product-image-data').value = imageUrl;
    };
    
    img.onerror = function() {
        // Failed to load
        urlStatus.innerHTML = '<span style="color: #dc3545;"><i class="fas fa-times-circle"></i> Failed to load</span>';
        previewStatus.className = 'preview-error';
        previewStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Image failed to load. Check the URL.';
        imagePreview.style.display = 'none';
        document.getElementById('product-image-data').value = '';
    };
    
    img.src = imageUrl;
}

function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const productIdInput = document.getElementById('product-id');
    
    if (productId) {
        // Edit mode
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Product';
        productIdInput.value = productId;
        loadProductData(productId);
    } else {
        // Add mode
        modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Product';
        productIdInput.value = '';
        resetProductForm();
    }
    
    modal.style.display = 'block';
}

function resetProductForm() {
    document.getElementById('product-form').reset();
    document.getElementById('image-preview-container').style.display = 'none';
    document.getElementById('product-image-data').value = '';
    document.getElementById('url-status').innerHTML = '';
    document.getElementById('image-preview').src = '';
    document.getElementById('image-preview').style.display = 'none';
}

function resetImageForm() {
    document.getElementById('image-url').value = '';
    document.getElementById('product-image-data').value = '';
    document.getElementById('image-preview-container').style.display = 'none';
    document.getElementById('url-status').innerHTML = '';
}

function loadProductData(productId) {
    const products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Fill form fields
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-price').value = product.price || '';
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-stock').value = product.stock || 1;
    
    // Handle image - auto-test if it's an Imgur URL
    const imageData = product.image || '';
    if (imageData) {
        document.getElementById('image-url').value = imageData;
        
        // Auto-test if it's an Imgur URL
        if (imageData.startsWith('https://i.imgur.com/')) {
            setTimeout(() => {
                testImageUrl();
            }, 300);
        } else {
            document.getElementById('product-image-data').value = imageData;
            document.getElementById('image-preview').src = imageData;
            document.getElementById('image-preview-container').style.display = 'block';
            document.getElementById('preview-status').className = 'preview-success';
            document.getElementById('preview-status').innerHTML = '<i class="fas fa-check-circle"></i> Using existing image';
            document.getElementById('image-preview').style.display = 'block';
        }
    }
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const imageData = document.getElementById('product-image-data').value;
    const name = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const stock = parseInt(document.getElementById('product-stock').value) || 1;
    
    // Validation
    if (!name || !description || !price || price <= 0 || !category || !imageData) {
        alert('Please fill all required fields correctly');
        return;
    }
    
    // Additional image validation
    if (!imageData.startsWith('http')) {
        alert('Please provide a valid image URL');
        return;
    }
    
    // Create product object
    const productData = {
        name: name,
        description: description,
        price: price,
        category: category,
        stock: stock,
        image: imageData,
        dateAdded: new Date().toISOString()
    };
    
    let success = false;
    
    if (productId) {
        // Update existing
        success = updateProduct(parseInt(productId), productData);
        alert(success ? 'Product updated!' : 'Update failed');
    } else {
        // Add new
        const newId = addProduct(productData);
        success = !!newId;
        alert(success ? 'Product added successfully!' : 'Failed to add product');
    }
    
    if (success) {
        loadAdminProducts();
        document.getElementById('product-modal').style.display = 'none';
        resetProductForm();
        
        // Refresh main store
        if (typeof loadProducts === 'function') {
            loadProducts();
        }
    }
}

function loadAdminProducts() {
    const products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    const productsGrid = document.getElementById('admin-products-grid');
    const emptyState = document.getElementById('empty-state');
    const productCount = document.getElementById('product-count');
    
    if (!productsGrid || !emptyState || !productCount) return;
    
    productCount.textContent = products.length;
    
    if (products.length === 0) {
        productsGrid.innerHTML = '';
        emptyState.style.display = 'flex';
        return;
    }
    
    emptyState.style.display = 'none';
    productsGrid.innerHTML = '';
    
    // Count categories
    const categories = [...new Set(products.map(p => p.category))];
    document.getElementById('category-count').textContent = categories.length;
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'admin-product-card';
        
        // Check if image is from Imgur
        const isImgur = product.image.includes('i.imgur.com');
        const imgurBadge = isImgur ? '<span class="imgur-badge" style="font-size:10px; padding:2px 8px;"><i class="fab fa-imdb"></i> Imgur</span>' : '';
        
        productCard.innerHTML = `
            <div class="admin-product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Loading'">
                ${imgurBadge}
            </div>
            <div class="admin-product-info">
                <h3>${product.name}</h3>
                <p>${product.description.substring(0, 60)}...</p>
                <div class="admin-product-meta">
                    <span><i class="fas fa-folder"></i> ${product.category}</span>
                    <span><i class="fas fa-box"></i> ${product.stock || 0} in stock</span>
                </div>
                <div class="admin-product-price">R${product.price.toFixed(2)}</div>
                <div class="admin-product-actions">
                    <button class="btn-edit" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Add event listeners
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            openProductModal(id);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            confirmDeleteProduct(id);
        });
    });
}

function confirmDeleteProduct(productId) {
    document.getElementById('confirm-delete').setAttribute('data-product-id', productId);
    document.getElementById('delete-modal').style.display = 'block';
}

// Product management functions (from products.js)
function addProduct(productData) {
    const products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    const newId = Date.now();
    productData.id = newId;
    productData.rating = productData.rating || Math.floor(Math.random() * 3) + 3; // Random rating 3-5
    products.push(productData);
    localStorage.setItem('shopEasyProducts', JSON.stringify(products));
    return newId;
}

function updateProduct(productId, updatedData) {
    const products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    const index = products.findIndex(p => p.id === productId);
    
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedData, id: productId };
        localStorage.setItem('shopEasyProducts', JSON.stringify(products));
        return true;
    }
    return false;
}

function deleteProduct(productId) {
    const products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    const filteredProducts = products.filter(p => p.id !== productId);
    localStorage.setItem('shopEasyProducts', JSON.stringify(filteredProducts));
    return true;
}
