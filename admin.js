// Admin JavaScript with Google Drive Integration
console.log("=== ADMIN.JS LOADED ===");

document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ DOM fully loaded");
    checkAdminAuth();
});

function checkAdminAuth() {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    const authCheck = document.getElementById('admin-auth-check');
    
    if (!isAuthenticated) {
        authCheck.style.display = 'flex';
        
        const authSubmit = document.getElementById('auth-submit');
        const authPassword = document.getElementById('auth-password');
        const authError = document.getElementById('auth-error');
        const ADMIN_PASSWORD = 'admin123';
        
        authSubmit.addEventListener('click', function() {
            if (authPassword.value === ADMIN_PASSWORD) {
                localStorage.setItem('adminAuthenticated', 'true');
                authCheck.style.display = 'none';
                initAdminPanel();
            } else {
                authError.textContent = 'Incorrect password!';
            }
        });
        
        authPassword.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') authSubmit.click();
        });
    } else {
        authCheck.style.display = 'none';
        initAdminPanel();
    }
}

function initAdminPanel() {
    console.log("🟢 Initializing admin panel");
    loadAdminProducts();
    setupEventListeners();
    setupGoogleDriveUpload();
}

function setupEventListeners() {
    // Logout button
    document.getElementById('logout-admin')?.addEventListener('click', function() {
        localStorage.removeItem('adminAuthenticated');
        window.location.href = 'index.html';
    });
    
    // Add product buttons - FIXED
    document.getElementById('add-product-btn')?.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("🟢 Add Product button clicked");
        openProductModal(null); // Explicitly pass null
    });
    
    document.getElementById('add-first-product')?.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("🟢 Add First Product button clicked");
        openProductModal(null); // Explicitly pass null
    });
    
    // Modal close buttons
    document.querySelector('.close-modal')?.addEventListener('click', function() {
        document.getElementById('product-modal').style.display = 'none';
        resetProductForm();
    });
    
    document.querySelector('.close-modal-btn')?.addEventListener('click', function() {
        document.getElementById('product-modal').style.display = 'none';
        resetProductForm();
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('product-modal')) {
            document.getElementById('product-modal').style.display = 'none';
            resetProductForm();
        }
        if (e.target === document.getElementById('delete-modal')) {
            document.getElementById('delete-modal').style.display = 'none';
        }
    });
    
    // Form submission
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Delete modal buttons
    document.getElementById('cancel-delete')?.addEventListener('click', function() {
        document.getElementById('delete-modal').style.display = 'none';
    });
    
    document.getElementById('confirm-delete')?.addEventListener('click', function() {
        const productId = this.getAttribute('data-product-id');
        if (productId) {
            deleteProduct(parseInt(productId));
            document.getElementById('delete-modal').style.display = 'none';
        }
    });
}

function setupGoogleDriveUpload() {
    // Google Drive conversion
    document.getElementById('convert-drive-btn')?.addEventListener('click', convertGoogleDriveUrl);
    
    document.getElementById('drive-link')?.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') convertGoogleDriveUrl();
    });
    
    // Change/Remove image buttons
    document.getElementById('change-image')?.addEventListener('click', resetImageForm);
    document.getElementById('remove-image')?.addEventListener('click', resetImageForm);
}

function resetImageForm() {
    const elements = {
        preview: document.getElementById('drive-preview-container'),
        data: document.getElementById('product-image-data'),
        status: document.getElementById('drive-status'),
        link: document.getElementById('drive-link')
    };
    
    if (elements.preview) elements.preview.style.display = 'none';
    if (elements.data) elements.data.value = '';
    if (elements.status) elements.status.style.display = 'none';
    if (elements.link) elements.link.value = '';
}

function convertGoogleDriveUrl() {
    const driveLink = document.getElementById('drive-link')?.value.trim();
    const driveStatus = document.getElementById('drive-status');
    const drivePreviewContainer = document.getElementById('drive-preview-container');
    const drivePreviewImage = document.getElementById('drive-preview-image');
    const imageDataInput = document.getElementById('product-image-data');
    
    if (!driveLink) {
        showDriveStatus('Please enter a Google Drive link', 'error');
        return;
    }
    
    showDriveStatus('Converting...', 'loading');
    
    // Extract file ID
    const fileId = extractGoogleDriveFileId(driveLink);
    
    if (!fileId) {
        showDriveStatus('Invalid link format. Use: https://drive.google.com/file/d/FILE_ID/view', 'error');
        return;
    }
    
    // Create direct image URL
    const directImageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    // Save and display
    if (imageDataInput) imageDataInput.value = directImageUrl;
    if (drivePreviewImage) drivePreviewImage.src = directImageUrl;
    if (drivePreviewContainer) drivePreviewContainer.style.display = 'block';
    
    showDriveStatus('<i class="fas fa-check-circle"></i> Image ready!', 'success');
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
    if (!driveStatus) return;
    
    driveStatus.innerHTML = message;
    driveStatus.className = 'drive-status';
    driveStatus.classList.add(`status-${type}`);
    driveStatus.style.display = 'block';
}

function openProductModal(productId) {
    console.log("Opening modal with ID:", productId);
    
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const productIdInput = document.getElementById('product-id');
    
    // Clear the ID input first
    if (productIdInput) productIdInput.value = '';
    
    if (productId && !isNaN(productId)) {
        // Edit mode - ensure it's a number
        if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Product';
        if (productIdInput) productIdInput.value = productId;
        loadProductData(productId);
    } else {
        // Add mode - ensure ID is empty
        if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Product';
        if (productIdInput) productIdInput.value = '';
        resetProductForm();
    }
    
    if (modal) modal.style.display = 'block';
}

function resetProductForm() {
    const form = document.getElementById('product-form');
    if (form) form.reset();
    resetImageForm();
}

function loadProductData(productId) {
    const products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Fill form
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-price').value = product.price || '';
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-stock').value = product.stock || 1;
    
    // Handle image
    const imageData = product.image || '';
    const imageDataInput = document.getElementById('product-image-data');
    if (imageDataInput && imageData) imageDataInput.value = imageData;
    
    if (imageData && imageData.includes('drive.google.com')) {
        const previewImage = document.getElementById('drive-preview-image');
        const previewContainer = document.getElementById('drive-preview-container');
        
        if (previewImage) previewImage.src = imageData;
        if (previewContainer) previewContainer.style.display = 'block';
        
        // Extract file ID for display
        const fileIdMatch = imageData.match(/id=([a-zA-Z0-9_-]+)/);
        const driveLinkInput = document.getElementById('drive-link');
        if (fileIdMatch && fileIdMatch[1] && driveLinkInput) {
            driveLinkInput.value = `https://drive.google.com/file/d/${fileIdMatch[1]}/view`;
        }
    }
}

function handleProductSubmit(e) {
    e.preventDefault();
    console.log("=== FORM SUBMISSION ===");
    
    // Get values
    const productId = document.getElementById('product-id')?.value || '';
    const imageData = document.getElementById('product-image-data')?.value || '';
    const name = document.getElementById('product-name')?.value.trim() || '';
    const description = document.getElementById('product-description')?.value.trim() || '';
    const priceValue = document.getElementById('product-price')?.value || '0';
    const category = document.getElementById('product-category')?.value || '';
    const stockValue = document.getElementById('product-stock')?.value || '1';
    
    // Validation
    if (!name) { alert('Product name required'); return; }
    if (!description) { alert('Description required'); return; }
    if (!priceValue || parseFloat(priceValue) <= 0) { alert('Valid price required'); return; }
    if (!category) { alert('Category required'); return; }
    if (!imageData) { alert('Google Drive image required'); return; }
    
    const price = parseFloat(priceValue);
    const stock = parseInt(stockValue) || 1;
    
    // Create product
    const productData = {
        name: name,
        description: description,
        price: price,
        category: category,
        stock: stock,
        image: imageData,
        dateAdded: new Date().toISOString()
    };
    
    // Save to localStorage
    let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    
    if (productId && !isNaN(parseInt(productId))) {
        // Update existing
        const index = products.findIndex(p => p.id === parseInt(productId));
        if (index !== -1) {
            productData.id = parseInt(productId);
            productData.dateAdded = products[index].dateAdded || new Date().toISOString();
            products[index] = productData;
            showNotification('Product updated!', 'success');
        }
    } else {
        // Add new
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        productData.id = newId;
        products.push(productData);
        showNotification('Product added!', 'success');
        console.log("✅ New product ID:", newId);
    }
    
    // Save
    localStorage.setItem('shopEasyProducts', JSON.stringify(products));
    
    // Refresh
    loadAdminProducts();
    document.getElementById('product-modal').style.display = 'none';
    resetProductForm();
    
    // Refresh main store
    if (typeof loadProducts === 'function') {
        setTimeout(loadProducts, 100);
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
        productCard.setAttribute('data-id', product.id);
        
        productCard.innerHTML = `
            <div class="admin-product-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWUiLz48cGF0aCBkPSJNNzUgODVBNTAuMDAwMSA1MC4wMDAwMSAwIDEgMCA3NSAxODVBNTAuMDAwMSA1MC4wMDAwMSAwIDEgMCA3NSA4NVpNMTc1IDVIMjVWMjBIMTc1VjVaIiBmaWxsPSIjY2NjIi8+PC9zdmc+'">
                ${product.image.includes('drive.google.com') ? '<span class="drive-indicator"><i class="fab fa-google-drive"></i></span>' : ''}
            </div>
            <div class="admin-product-info">
                <h3>${product.name}</h3>
                <p>${product.description.substring(0, 60)}${product.description.length > 60 ? '...' : ''}</p>
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
    setTimeout(() => {
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
    }, 100);
}

function confirmDeleteProduct(productId) {
    const modal = document.getElementById('delete-modal');
    const confirmBtn = document.getElementById('confirm-delete');
    
    if (modal && confirmBtn) {
        confirmBtn.setAttribute('data-product-id', productId);
        modal.style.display = 'block';
    }
}

function deleteProduct(productId) {
    let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    const initialLength = products.length;
    
    products = products.filter(p => p.id !== productId);
    
    if (products.length < initialLength) {
        localStorage.setItem('shopEasyProducts', JSON.stringify(products));
        showNotification('Product deleted!', 'success');
        loadAdminProducts();
        if (typeof loadProducts === 'function') loadProducts();
    }
}

function showNotification(message, type) {
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    setTimeout(() => notification.remove(), 3000);
}
