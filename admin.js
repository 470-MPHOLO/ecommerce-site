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
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup Google Drive upload only
    setupGoogleDriveUpload();
    
    console.log("✅ Admin panel initialized");
}

function setupEventListeners() {
    console.log("🟢 Setting up event listeners");
    
    // Logout button
    const logoutBtn = document.getElementById('logout-admin');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminAuthenticated');
            window.location.href = 'index.html';
        });
    }
    
    // Add product buttons
    const addProductBtn = document.getElementById('add-product-btn');
    const addFirstProductBtn = document.getElementById('add-first-product');
    
    if (addProductBtn) {
        addProductBtn.addEventListener('click', openProductModal);
    }
    
    if (addFirstProductBtn) {
        addFirstProductBtn.addEventListener('click', openProductModal);
    }
    
    // Modal close buttons
    const closeModal = document.querySelector('.close-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const productModal = document.getElementById('product-modal');
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            productModal.style.display = 'none';
            resetProductForm();
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            productModal.style.display = 'none';
            resetProductForm();
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === productModal) {
            productModal.style.display = 'none';
            resetProductForm();
        }
        if (e.target === document.getElementById('delete-modal')) {
            document.getElementById('delete-modal').style.display = 'none';
        }
    });
    
    // Product form submission - FIXED VERSION
    const productForm = document.getElementById('product-form');
    if (productForm) {
        console.log("✅ Found product form");
        // Remove any existing listeners first
        productForm.removeEventListener('submit', handleProductSubmit);
        // Add new listener
        productForm.addEventListener('submit', handleProductSubmit);
    } else {
        console.error("❌ Product form not found!");
    }
    
    // Direct save button listener as backup
    const saveBtn = document.getElementById('save-product-btn');
    if (saveBtn) {
        console.log("✅ Found save button");
        saveBtn.addEventListener('click', function(e) {
            console.log("🎯 Save button clicked directly");
            e.preventDefault();
            handleProductSubmit(e);
        });
    }
    
    // Delete modal buttons
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function() {
            document.getElementById('delete-modal').style.display = 'none';
        });
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            if (productId) {
                deleteProduct(productId);
                document.getElementById('delete-modal').style.display = 'none';
            }
        });
    }
}

function setupGoogleDriveUpload() {
    console.log("🟢 Setting up Google Drive upload");
    
    // Google Drive conversion
    const convertDriveBtn = document.getElementById('convert-drive-btn');
    const driveLinkInput = document.getElementById('drive-link');
    
    if (convertDriveBtn && driveLinkInput) {
        convertDriveBtn.addEventListener('click', convertGoogleDriveUrl);
        driveLinkInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                convertGoogleDriveUrl();
            }
        });
    }
    
    // Change image button
    const changeImageBtn = document.getElementById('change-image');
    if (changeImageBtn) {
        changeImageBtn.addEventListener('click', function() {
            resetImageForm();
        });
    }
    
    // Remove image button
    const removeImageBtn = document.getElementById('remove-image');
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', function() {
            resetImageForm();
        });
    }
}

function resetImageForm() {
    const drivePreviewContainer = document.getElementById('drive-preview-container');
    const imageDataInput = document.getElementById('product-image-data');
    const driveStatus = document.getElementById('drive-status');
    const driveLinkInput = document.getElementById('drive-link');
    
    if (drivePreviewContainer) drivePreviewContainer.style.display = 'none';
    if (imageDataInput) imageDataInput.value = '';
    if (driveStatus) driveStatus.style.display = 'none';
    if (driveLinkInput) driveLinkInput.value = '';
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
    
    if (!driveLink.includes('drive.google.com')) {
        showDriveStatus('Not a valid Google Drive link', 'error');
        return;
    }
    
    showDriveStatus('Converting Google Drive link...', 'loading');
    
    // Extract file ID
    let fileId = extractGoogleDriveFileId(driveLink);
    
    console.log('Extracted File ID:', fileId);
    
    if (!fileId) {
        showDriveStatus('Could not extract file ID. Make sure link is in format:<br>https://drive.google.com/file/d/FILE_ID/view', 'error');
        return;
    }
    
    // Create direct image URL
    const directImageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    console.log('Direct Image URL:', directImageUrl);
    
    // Save the URL immediately (don't wait for preview)
    imageDataInput.value = directImageUrl;
    drivePreviewImage.src = directImageUrl;
    drivePreviewContainer.style.display = 'block';
    
    showDriveStatus(
        '<i class="fas fa-check-circle"></i> Google Drive image ready!<br>' +
        '<small>Image saved. You can now add the product.</small>', 
        'success'
    );
}

function extractGoogleDriveFileId(url) {
    console.log('Extracting from:', url);
    
    // Clean the URL
    const cleanUrl = url.split('?')[0].split('#')[0].trim();
    
    // Try different patterns
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/,
        /\/d\/([a-zA-Z0-9_-]+)/,
        /id=([a-zA-Z0-9_-]+)/
    ];
    
    for (let pattern of patterns) {
        const match = cleanUrl.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    // Fallback: split by slashes
    const parts = cleanUrl.split('/');
    for (let i = 0; i < parts.length; i++) {
        if (parts[i] === 'd' && i + 1 < parts.length) {
            const potentialId = parts[i + 1];
            if (potentialId && potentialId.length > 10) {
                return potentialId;
            }
        }
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
    console.log("Resetting product form");
    
    const form = document.getElementById('product-form');
    if (form) {
        form.reset();
    }
    
    // Reset image previews
    const drivePreviewContainer = document.getElementById('drive-preview-container');
    const imageDataInput = document.getElementById('product-image-data');
    const driveStatus = document.getElementById('drive-status');
    const driveLinkInput = document.getElementById('drive-link');
    
    if (drivePreviewContainer) drivePreviewContainer.style.display = 'none';
    if (imageDataInput) imageDataInput.value = '';
    if (driveStatus) driveStatus.style.display = 'none';
    if (driveLinkInput) driveLinkInput.value = '';
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
        
        // Show in Google Drive preview
        const drivePreviewImage = document.getElementById('drive-preview-image');
        const drivePreviewContainer = document.getElementById('drive-preview-container');
        const driveLinkInput = document.getElementById('drive-link');
        
        drivePreviewImage.src = imageData;
        drivePreviewContainer.style.display = 'block';
        
        // Try to extract and show original link
        const fileIdMatch = imageData.match(/id=([a-zA-Z0-9_-]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
            driveLinkInput.value = `https://drive.google.com/file/d/${fileIdMatch[1]}/view`;
        } else {
            driveLinkInput.value = imageData;
        }
    }
}

function handleProductSubmit(e) {
    if (e) e.preventDefault();
    
    console.log("=== PRODUCT FORM SUBMISSION STARTED ===");
    
    try {
        const productId = document.getElementById('product-id').value;
        const imageData = document.getElementById('product-image-data').value;
        
        // Get form values
        const name = document.getElementById('product-name').value.trim();
        const description = document.getElementById('product-description').value.trim();
        const priceValue = document.getElementById('product-price').value;
        const category = document.getElementById('product-category').value;
        const stockValue = document.getElementById('product-stock').value;
        
        console.log("Form Data Collected:", {
            productId: productId,
            name: name,
            description: description.substring(0, 30) + '...',
            price: priceValue,
            category: category,
            stock: stockValue,
            image: imageData ? 'Yes' : 'No'
        });
        
        // Validation
        let error = '';
        if (!name) error = 'Please enter a product name';
        else if (!description) error = 'Please enter a product description';
        else if (!priceValue || parseFloat(priceValue) <= 0 || isNaN(parseFloat(priceValue))) 
            error = 'Please enter a valid price greater than 0';
        else if (!category) error = 'Please select a category';
        else if (!imageData || !imageData.includes('drive.google.com')) 
            error = 'Please add a valid Google Drive image link';
        
        if (error) {
            console.error("Validation error:", error);
            alert(error);
            return false;
        }
        
        // Prepare product data
        const productData = {
            name: name,
            description: description,
            price: parseFloat(priceValue),
            category: category,
            stock: parseInt(stockValue) || 1,
            image: imageData,
            dateAdded: new Date().toISOString()
        };
        
        console.log("Product Data to Save:", productData);
        
        let success = false;
        let message = '';
        
        // Load current products
        let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
        
        if (productId) {
            // Update existing product
            console.log("Updating existing product ID:", productId);
            const index = products.findIndex(p => p.id === parseInt(productId));
            
            if (index !== -1) {
                productData.id = parseInt(productId);
                // Keep original dateAdded
                productData.dateAdded = products[index].dateAdded || new Date().toISOString();
                products[index] = productData;
                success = true;
                message = 'Product updated successfully!';
                console.log("✅ Product updated");
            } else {
                console.error("Product not found for update:", productId);
                message = 'Product not found!';
            }
        } else {
            // Add new product
            console.log("Adding new product");
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            productData.id = newId;
            products.push(productData);
            success = true;
            message = 'Product added successfully!';
            console.log("✅ New product added with ID:", newId);
        }
        
        // Save to localStorage
        if (success) {
            try {
                localStorage.setItem('shopEasyProducts', JSON.stringify(products));
                console.log("✅ Products saved to localStorage, total:", products.length);
                
                // Show success message
                showNotification(message, 'success');
                
                // Refresh admin products list
                loadAdminProducts();
                
                // Close modal after delay
                setTimeout(() => {
                    closeProductModal();
                }, 1000);
                
                // Refresh main store if open
                if (typeof loadProducts === 'function') {
                    console.log("Refreshing main store products");
                    loadProducts();
                }
                
            } catch (saveError) {
                console.error("Save error:", saveError);
                if (saveError.name === 'QuotaExceededError') {
                    showNotification('Storage full! Please delete some products.', 'error');
                } else {
                    showNotification('Error saving product: ' + saveError.message, 'error');
                }
            }
        } else {
            showNotification(message, 'error');
        }
        
    } catch (error) {
        console.error("Form submission error:", error);
        showNotification('Error: ' + error.message, 'error');
    }
    
    return false;
}

function closeProductModal() {
    console.log("Closing product modal");
    
    const modal = document.getElementById('product-modal');
    modal.style.display = 'none';
    resetProductForm();
}

function loadAdminProducts() {
    console.log("Loading admin products");
    
    const products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    const productsGrid = document.getElementById('admin-products-grid');
    const emptyState = document.getElementById('empty-state');
    const productCount = document.getElementById('product-count');
    
    if (!productsGrid || !emptyState || !productCount) return;
    
    // Update count
    productCount.textContent = products.length;
    console.log("Total products:", products.length);
    
    if (products.length === 0) {
        productsGrid.innerHTML = '';
        emptyState.style.display = 'flex';
        return;
    }
    
    emptyState.style.display = 'none';
    productsGrid.innerHTML = '';
    
    // Count categories
    const categories = [...new Set(products.map(p => p.category))];
    const categoryCount = document.getElementById('category-count');
    if (categoryCount) {
        categoryCount.textContent = categories.length;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'admin-product-card';
        productCard.setAttribute('data-id', product.id);
        
        const isGoogleDrive = product.image.includes('drive.google.com');
        
        productCard.innerHTML = `
            <div class="admin-product-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWUiLz48cGF0aCBkPSJNNzUgODVBNTAuMDAwMSA1MC4wMDAwMSAwIDEgMCA3NSAxODVBNTAuMDAwMSA1MC4wMDAwMSAwIDEgMCA3NSA4NVpNMTc1IDVIMjVWMjBIMTc1VjVaIiBmaWxsPSIjY2NjIi8+PC9zdmc+'">
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
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-product-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            openProductModal(productId);
        });
    });
    
    document.querySelectorAll('.delete-product-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            confirmDeleteProduct(productId);
        });
    });
    
    console.log("✅ Admin products loaded");
}

function confirmDeleteProduct(productId) {
    console.log("Confirming delete for product:", productId);
    
    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    
    if (deleteModal && confirmDeleteBtn) {
        confirmDeleteBtn.setAttribute('data-product-id', productId);
        deleteModal.style.display = 'block';
    }
}

function deleteProduct(productId) {
    console.log("Deleting product ID:", productId);
    
    let products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    const initialLength = products.length;
    
    products = products.filter(p => p.id !== productId);
    
    if (products.length < initialLength) {
        localStorage.setItem('shopEasyProducts', JSON.stringify(products));
        showNotification('Product deleted successfully!', 'success');
        loadAdminProducts();
        
        // Refresh main store if open
        if (typeof loadProducts === 'function') {
            loadProducts();
        }
    } else {
        showNotification('Product not found!', 'error');
    }
}

function showNotification(message, type = 'info') {
    console.log("Showing notification:", type, message);
    
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles if not already added
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
            
            .notification-success {
                border-left-color: #27ae60;
            }
            
            .notification-error {
                border-left-color: #e74c3c;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .notification-content i {
                font-size: 1.2rem;
            }
            
            .notification-success .notification-content i {
                color: #27ae60;
            }
            
            .notification-error .notification-content i {
                color: #e74c3c;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #7f8c8d;
                margin-left: 15px;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Add debug logging at startup
console.log("🟡 Admin JS ready. Check console for logs.");
