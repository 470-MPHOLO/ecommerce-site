// Admin JavaScript - Simplified Working Version
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
    
    // Google Drive conversion
    document.getElementById('convert-drive-btn').addEventListener('click', convertGoogleDriveUrl);
    
    // Change/Remove image
    document.getElementById('change-image').addEventListener('click', resetImageForm);
    document.getElementById('remove-image').addEventListener('click', resetImageForm);
    
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
}

function convertGoogleDriveUrl() {
    const driveLink = document.getElementById('drive-link').value.trim();
    const driveStatus = document.getElementById('drive-status');
    
    if (!driveLink) {
        showDriveStatus('Please enter a Google Drive link', 'error');
        return;
    }
    
    showDriveStatus('Converting...', 'loading');
    
    // Extract file ID
    let fileId = extractGoogleDriveFileId(driveLink);
    
    if (!fileId) {
        showDriveStatus('Invalid link format', 'error');
        return;
    }
    
    // Create direct image URL
    const directImageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    // Update form
    document.getElementById('product-image-data').value = directImageUrl;
    document.getElementById('drive-preview-image').src = directImageUrl;
    document.getElementById('drive-preview-container').style.display = 'block';
    
    showDriveStatus('✅ Image ready!', 'success');
}

function extractGoogleDriveFileId(url) {
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,
        /\/d\/([a-zA-Z0-9_-]+)/,
        /id=([a-zA-Z0-9_-]+)/
    ];
    
    for (let pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
    }
    return null;
}

function showDriveStatus(message, type) {
    const driveStatus = document.getElementById('drive-status');
    driveStatus.innerHTML = message;
    driveStatus.className = `drive-status status-${type}`;
    driveStatus.style.display = 'block';
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
    document.getElementById('drive-preview-container').style.display = 'none';
    document.getElementById('product-image-data').value = '';
    document.getElementById('drive-status').style.display = 'none';
}

function resetImageForm() {
    document.getElementById('drive-preview-container').style.display = 'none';
    document.getElementById('product-image-data').value = '';
    document.getElementById('drive-status').style.display = 'none';
    document.getElementById('drive-link').value = '';
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
    
    // Handle image
    const imageData = product.image || '';
    if (imageData) {
        document.getElementById('product-image-data').value = imageData;
        document.getElementById('drive-preview-image').src = imageData;
        document.getElementById('drive-preview-container').style.display = 'block';
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
        alert(success ? 'Product added!' : 'Add failed');
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
        
        productCard.innerHTML = `
            <div class="admin-product-image">
                <img src="${product.image}" alt="${product.name}">
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
