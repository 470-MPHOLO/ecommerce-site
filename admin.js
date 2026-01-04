// Admin JavaScript with Google Drive Integration ONLY
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
        const ADMIN_PASSWORD = 'admin123'; // Change this for production
        
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
            if (e.key === 'Enter') {
                authSubmit.click();
            }
        });
    } else {
        authCheck.style.display = 'none';
        initAdminPanel();
    }
}

function initAdminPanel() {
    console.log("🟢 Initializing admin panel");
    
    // Load products
    loadAdminProducts();
    
    // Setup event listeners - SIMPLIFIED VERSION
    setupEventListeners();
    
    // Setup Google Drive upload
    setupGoogleDriveUpload();
    
    console.log("✅ Admin panel initialized");
}

function setupEventListeners() {
    console.log("🟢 Setting up event listeners");
    
    // Logout button
    document.getElementById('logout-admin')?.addEventListener('click', function() {
        localStorage.removeItem('adminAuthenticated');
        window.location.href = 'index.html';
    });
    
    // Add product buttons - FIXED: Prevent passing event object
    document.getElementById('add-product-btn')?.addEventListener('click', function(e) {
        e.preventDefault();
        console.log("🟢 Add Product button clicked");
        openProductModal();
    });
    
    document.getElementById('add-first-product')?.addEventListener('click', function(e) {
        e.preventDefault();
        console.log("🟢 Add First Product button clicked");
        openProductModal();
    });
    
    // Modal close buttons
    document.querySelector('.close-modal')?.addEventListener('click', closeProductModal);
    document.querySelector('.close-modal-btn')?.addEventListener('click', closeProductModal);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('product-modal')) {
            closeProductModal();
        }
        if (e.target === document.getElementById('delete-modal')) {
            document.getElementById('delete-modal').style.display = 'none';
        }
    });
    
    // Product form submission
    const productForm = document.getElementById('product-form');
    if (productForm) {
        console.log("✅ Product form found");
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Direct save button as backup
    document.getElementById('save-product-btn')?.addEventListener('click', function(e) {
        e.preventDefault();
        console.log("🎯 Save button clicked (direct)");
        handleProductSubmit(e);
    });
    
    // Delete modal buttons
    document.getElementById('cancel-delete')?.addEventListener('click', function() {
        document.getElementById('delete-modal').style.display = 'none';
    });
    
    document.getElementById('confirm-delete')?.addEventListener('click', function() {
        const productId = parseInt(this.getAttribute('data-product-id'));
        if (productId) {
            deleteProduct(productId);
            document.getElementById('delete-modal').style.display = 'none';
        }
    });
}

function setupGoogleDriveUpload() {
    console.log("🟢 Setting up Google Drive upload");
    
    // Google Drive conversion
    const convertDriveBtn = document.getElementById('convert-drive-btn');
    const driveLinkInput = document.getElementById('drive-link');
    
    if (convertDriveBtn) {
        convertDriveBtn.addEventListener('click', convertGoogleDriveUrl);
    }
    
    if (driveLinkInput) {
        driveLinkInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') convertGoogleDriveUrl();
        });
    }
    
    // Change/Remove image buttons
    document.getElementById('change-image')?.addEventListener('click', resetImageForm);
    document.getElementById('remove-image')?.addEventListener('click', resetImageForm);
}

function resetImageForm() {
    document.getElementById('drive-preview-container').style.display = 'none';
    document.getElementById('product-image-data').value = '';
    document.getElementById('drive-status').style.display = 'none';
    document.getElementById('drive-link').value = '';
}

function convertGoogleDriveUrl() {
    const driveLink = document.getElementById('drive-link').value.trim();
    const driveStatus = document.getElementById('drive-status');
    const drivePreviewContainer = document.getElementById('drive-preview-container');
    const drivePreviewImage = document.getElementById('drive-preview-image');
    const imageDataInput = document.getElementById('product-image-data');
    
    if (!driveLink) {
        showDriveStatus('Please enter a Google Drive link', 'error');
        return;
    }
    
    showDriveStatus('Converting Google Drive link...', 'loading');
    
    // Extract file ID
    let fileId = extractGoogleDriveFileId(driveLink);
    
    if (!fileId) {
        showDriveStatus('Could not extract file ID. Use format: https://drive.google.com/file/d/FILE_ID/view', 'error');
        return;
    }
    
    // Create direct image URL
    const directImageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    console.log('Direct Image URL:', directImageUrl);
    
    // Save the URL immediately
    imageDataInput.value = directImageUrl;
    drivePreviewImage.src = directImageUrl;
    drivePreviewContainer.style.display = 'block';
    
    showDriveStatus('<i class="fas fa-check-circle"></i> Google Drive image ready!', 'success');
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

function openProductModal(productId = null) {
    console.log("Opening product modal, ID:", productId);
    
    const modal = document.getElementById('product-modal');
    const modalTitle = document.getElementById('modal-title');
    const productIdInput = document.getElementById('product-id');
    
    if (productId && typeof productId === 'number') {
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
    console.log("Resetting product form");
    
    const form = document.getElementById('product-form');
    if (form) form.reset();
    
    resetImageForm();
}

function loadProductData(productId) {
    console.log("Loading product data for ID:", productId);
    
    const products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        console.error("Product not found:", productId);
        return;
    }
    
    // Fill form fields
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-price').value = product.price || '';
    document.getElementById('product-category').value = product.category || '';
    document.getElementById('product-stock').value = product.stock || 1;
    
    // Handle image
    const imageData = product.image || '';
    const imageDataInput = document.getElementById('product-image-data');
    
    if (imageData && imageData.includes('drive.google.com')) {
        imageDataInput.value = imageData;
        
        // Show in preview
        document.getElementById('drive-preview-image').src = imageData;
        document.getElementById('drive-preview-container').style.display = 'block';
        
        // Extract and show original link
        const fileIdMatch = imageData.match(/id=([a-zA-Z0-9_-]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
            document.getElementById('drive-link').value = `https://drive.google.com/file/d/${fileIdMatch[1]}/view`;
        }
    }
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    console.log("=== PRODUCT FORM SUBMISSION STARTED ===");
    
    // Get form values
    const productId = document.getElementById('product-id').value;
    const imageData = document.getElementById('product-image-data').value;
    const name = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const stock = parseInt(document.getElementById('product-stock').value) || 1;
    
    console.log("Form Data:", {
        id: productId,
        name: name,
        price: price,
        category: category,
        image: imageData ? 'Yes' : 'No'
    });
    
    // Validation
    if (!name) { alert('Please enter product name'); return; }
    if (!description) { alert('Please enter description'); return; }
    if (!price || price <= 0) { alert('Please enter valid price'); return; }
    if (!category) { alert('Please select category'); return; }
    if (!imageData) { alert('Please add Google Drive image'); return; }
    
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
    
    // Save product
    let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    
    if (productId) {
        // Update existing product
        const index = products.findIndex(p => p.id === parseInt(productId));
        if (index !== -1) {
            productData.id = parseInt(productId);
            productData.dateAdded = products[index].dateAdded;
            products[index] = productData;
            showNotification('Product updated!', 'success');
        }
    } else {
        // Add new product
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        productData.id = newId;
        products.push(productData);
        showNotification('Product added!', 'success');
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('shopEasyProducts', JSON.stringify(products));
        console.log("✅ Products saved, total:", products.length);
    } catch (error) {
        console.error("Save error:", error);
        alert('Error saving: ' + error.message);
        return;
    }
    
    // Refresh and close
    loadAdminProducts();
    setTimeout(closeProductModal, 500);
    
    // Refresh main store
    if (typeof loadProducts === 'function') {
        loadProducts();
    }
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
    resetProductForm();
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
        
        const isGoogleDrive = product.image.includes('drive.google.com');
        
        productCard.innerHTML = `
            <div class="admin-product-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWUiLz48cGF0aCBkPSJNNzUgODVBNTAuMDAwMSA1MC4wMDAwMSAwIDEgMCA3NSAxODVBNTAuMDAwMSA1MC4wMDAwMSAwIDEgMCA3NSA4NVpNMTc1IDVIMjVWMjBIMTc1VjVaIiBmaWxsPSIjY2NjIi8+PC9zdmc+'">
                ${isGoogleDrive ? '<span class="drive-indicator"><i class="fab fa-google-drive"></i></span>' : ''}
            </div>
            <div class="admin-product-info">
                <h3 class="admin-product-title">${product.name}</h3>
                <p class="admin-product-description">${product.description.substring(0, 60)}${product.description.length > 60 ? '...' : ''}</p>
                <div class="admin-product-meta">
                    <span class="product-category">
                        <i class="fas fa-folder"></i> ${product.category}
                    </span>
                    <span class="product-stock">
                        <i class="fas fa-box"></i> ${product.stock || 0} in stock
                    </span>
                </div>
                <div class="admin-product-price">R${product.price.toFixed(2)}</div>
                <div class="admin-product-actions">
                    <button class="btn-edit edit-product-btn" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete delete-product-btn" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Add event listeners to buttons
    setTimeout(() => {
        document.querySelectorAll('.edit-product-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = parseInt(this.getAttribute('data-id'));
                console.log("Edit clicked, ID:", productId);
                openProductModal(productId);
            });
        });
        
        document.querySelectorAll('.delete-product-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = parseInt(this.getAttribute('data-id'));
                console.log("Delete clicked, ID:", productId);
                confirmDeleteProduct(productId);
            });
        });
    }, 100);
}

function confirmDeleteProduct(productId) {
    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    
    if (deleteModal && confirmDeleteBtn) {
        confirmDeleteBtn.setAttribute('data-product-id', productId);
        deleteModal.style.display = 'block';
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
        
        if (typeof loadProducts === 'function') {
            loadProducts();
        }
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid #3498db;
            }
            .notification-success { border-left-color: #27ae60; }
            .notification-error { border-left-color: #e74c3c; }
            .notification-content { display: flex; align-items: center; gap: 10px; }
            .notification-content i { font-size: 1.2rem; }
            .notification-success .notification-content i { color: #27ae60; }
            .notification-error .notification-content i { color: #e74c3c; }
            .notification-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #7f8c8d; margin-left: 15px; }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 3000);
}

console.log("🟡 Admin JS ready. Check console for logs.");
