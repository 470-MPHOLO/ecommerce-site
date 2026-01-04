// Admin JavaScript with Google Drive Integration
document.addEventListener('DOMContentLoaded', function() {
    // Authentication Check
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
    // Load products
    loadAdminProducts();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup image upload (both methods)
    setupImageUpload();
    setupGoogleDriveUpload();
}

function setupEventListeners() {
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
    const deleteModal = document.getElementById('delete-modal');
    
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
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
    
    // Product form submission
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Delete modal buttons
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function() {
            deleteModal.style.display = 'none';
        });
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            if (productId) {
                deleteProduct(productId);
                deleteModal.style.display = 'none';
            }
        });
    }
}

function setupImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('image-file');
    const browseBtn = document.getElementById('browse-btn');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImage = document.getElementById('uploaded-preview');
    const changeImageBtn = document.getElementById('change-image');
    const removeImageBtn = document.getElementById('remove-image');
    const imageDataInput = document.getElementById('product-image-data');
    
    if (!uploadArea || !fileInput) return;
    
    // Browse button
    if (browseBtn) {
        browseBtn.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function() {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });
    
    // Click to browse
    uploadArea.addEventListener('click', function(e) {
        if (e.target !== browseBtn && e.target.tagName !== 'BUTTON') {
            fileInput.click();
        }
    });
    
    // Change image button
    if (changeImageBtn) {
        changeImageBtn.addEventListener('click', function() {
            previewContainer.style.display = 'none';
            uploadArea.style.display = 'flex';
            imageDataInput.value = '';
            fileInput.value = '';
        });
    }
    
    // Remove image button
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', function() {
            previewContainer.style.display = 'none';
            uploadArea.style.display = 'flex';
            imageDataInput.value = '';
            fileInput.value = '';
        });
    }
    
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) handleImageFile(file);
    }
    
    function handleImageFile(file) {
        // Validate file
        if (!file.type.match('image.*')) {
            alert('Please select an image file (JPG, PNG, GIF)');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size must be less than 2MB');
            return;
        }
        
        // Show loading state
        uploadArea.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Processing image...</div>';
        
        // Convert to Base64
        const reader = new FileReader();
        
        reader.onload = function(event) {
            // Show preview
            previewImage.src = event.target.result;
            previewContainer.style.display = 'block';
            uploadArea.style.display = 'none';
            
            // Restore upload area HTML
            uploadArea.innerHTML = `
                <div class="upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <p class="upload-title">Upload Product Photo</p>
                <p class="upload-subtitle">Drag & drop or click to browse</p>
                <input type="file" id="image-file" accept="image/*" capture="environment">
                <button type="button" id="browse-btn" class="btn-secondary">
                    <i class="fas fa-folder-open"></i> Choose File
                </button>
                <p class="upload-info">Max: 2MB • JPG, PNG, GIF</p>
            `;
            
            // Re-attach event listeners
            const newFileInput = document.getElementById('image-file');
            const newBrowseBtn = document.getElementById('browse-btn');
            
            newFileInput.addEventListener('change', handleFileSelect);
            if (newBrowseBtn) {
                newBrowseBtn.addEventListener('click', function() {
                    newFileInput.click();
                });
            }
            
            // Store as Base64
            imageDataInput.value = event.target.result;
        };
        
        reader.readAsDataURL(file);
    }
}

function setupGoogleDriveUpload() {
    const methodTabs = document.querySelectorAll('.method-tab');
    const methodContents = document.querySelectorAll('.method-content');
    
    // Tab switching
    methodTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            
            // Update active tab
            methodTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            methodContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${method}-method`) {
                    content.classList.add('active');
                }
            });
            
            // Clear image data when switching methods
            document.getElementById('product-image-data').value = '';
        });
    });
    
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
    
    // Validate it's a Google Drive link
    if (!driveLink.includes('drive.google.com')) {
        showDriveStatus('Not a valid Google Drive link', 'error');
        return;
    }
    
    showDriveStatus('Converting Google Drive link...', 'loading');
    
    // Extract file ID
    let fileId = extractGoogleDriveFileId(driveLink);
    
    if (!fileId) {
        showDriveStatus('Could not extract file ID. Make sure it\'s a shareable link.', 'error');
        return;
    }
    
    // Create direct image URL
    const directImageUrl = `https://drive.google.com/uc?id=${fileId}`;
    
    // Test if image loads
    testImageLoad(directImageUrl);
}

function extractGoogleDriveFileId(url) {
    // Multiple Google Drive URL patterns
    const patterns = [
        /\/d\/([a-zA-Z0-9_-]+)/,           // /d/FILE_ID/
        /id=([a-zA-Z0-9_-]+)/,              // ?id=FILE_ID
        /\/file\/d\/([a-zA-Z0-9_-]+)/,      // /file/d/FILE_ID/
        /open\?id=([a-zA-Z0-9_-]+)/         // /open?id=FILE_ID
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}

function testImageLoad(imageUrl) {
    const driveStatus = document.getElementById('drive-status');
    const drivePreviewContainer = document.getElementById('drive-preview-container');
    const drivePreviewImage = document.getElementById('drive-preview-image');
    const imageDataInput = document.getElementById('product-image-data');
    
    const img = new Image();
    
    img.onload = function() {
        // Image loaded successfully
        drivePreviewImage.src = imageUrl;
        drivePreviewContainer.style.display = 'block';
        
        // Save the Google Drive URL
        imageDataInput.value = imageUrl;
        
        showDriveStatus('<i class="fas fa-check-circle"></i> Google Drive image loaded successfully!', 'success');
        
        // Also hide the upload area if it's visible
        const uploadArea = document.getElementById('upload-area');
        const uploadPreview = document.getElementById('image-preview-container');
        if (uploadArea) uploadArea.style.display = 'none';
        if (uploadPreview) uploadPreview.style.display = 'none';
    };
    
    img.onerror = function() {
        // Image failed to load
        showDriveStatus('<i class="fas fa-exclamation-triangle"></i> Failed to load image. Please check:<br>' +
                       '1. File is set to "Anyone with the link"<br>' +
                       '2. Link is to an image file (jpg, png, etc.)<br>' +
                       '3. File exists in Google Drive', 'error');
        
        drivePreviewContainer.style.display = 'none';
        imageDataInput.value = '';
    };
    
    // Set timeout for slow connections
    setTimeout(() => {
        if (!img.complete) {
            showDriveStatus('<i class="fas fa-exclamation-triangle"></i> Taking too long to load. Image might be very large or link incorrect.', 'warning');
        }
    }, 5000);
    
    // Start loading
    img.src = imageUrl;
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
    const form = document.getElementById('product-form');
    if (form) form.reset();
    
    // Reset image previews
    const previewContainer = document.getElementById('image-preview-container');
    const drivePreviewContainer = document.getElementById('drive-preview-container');
    const uploadArea = document.getElementById('upload-area');
    const imageDataInput = document.getElementById('product-image-data');
    const driveStatus = document.getElementById('drive-status');
    const driveLinkInput = document.getElementById('drive-link');
    
    if (previewContainer) previewContainer.style.display = 'none';
    if (drivePreviewContainer) drivePreviewContainer.style.display = 'none';
    if (uploadArea) uploadArea.style.display = 'flex';
    if (imageDataInput) imageDataInput.value = '';
    if (driveStatus) driveStatus.style.display = 'none';
    if (driveLinkInput) driveLinkInput.value = '';
    
    // Reset to upload tab
    const uploadTab = document.querySelector('.method-tab[data-method="upload"]');
    const driveTab = document.querySelector('.method-tab[data-method="drive"]');
    const uploadContent = document.getElementById('upload-method');
    const driveContent = document.getElementById('drive-method');
    
    if (uploadTab && driveTab && uploadContent && driveContent) {
        uploadTab.classList.add('active');
        driveTab.classList.remove('active');
        uploadContent.classList.add('active');
        driveContent.classList.remove('active');
    }
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
    const imageDataInput = document.getElementById('product-image-data');
    const isGoogleDrive = imageData.includes('drive.google.com');
    
    if (imageData) {
        imageDataInput.value = imageData;
        
        if (isGoogleDrive) {
            // Show Google Drive tab
            const driveTab = document.querySelector('.method-tab[data-method="drive"]');
            const uploadTab = document.querySelector('.method-tab[data-method="upload"]');
            const driveContent = document.getElementById('drive-method');
            const uploadContent = document.getElementById('upload-method');
            
            driveTab.classList.add('active');
            uploadTab.classList.remove('active');
            driveContent.classList.add('active');
            uploadContent.classList.remove('active');
            
            // Show in Google Drive preview
            const drivePreviewImage = document.getElementById('drive-preview-image');
            const drivePreviewContainer = document.getElementById('drive-preview-container');
            const driveLinkInput = document.getElementById('drive-link');
            
            drivePreviewImage.src = imageData;
            drivePreviewContainer.style.display = 'block';
            driveLinkInput.value = imageData;
            
            // Hide upload area
            const uploadArea = document.getElementById('upload-area');
            if (uploadArea) uploadArea.style.display = 'none';
            
        } else {
            // Show Base64 image in upload preview
            const previewImage = document.getElementById('uploaded-preview');
            const previewContainer = document.getElementById('image-preview-container');
            const uploadArea = document.getElementById('upload-area');
            
            previewImage.src = imageData;
            previewContainer.style.display = 'block';
            if (uploadArea) uploadArea.style.display = 'none';
        }
    }
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    try {
        const productId = document.getElementById('product-id').value;
        const imageData = document.getElementById('product-image-data').value;
        
        // Validate required fields
        const name = document.getElementById('product-name').value.trim();
        const description = document.getElementById('product-description').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        const category = document.getElementById('product-category').value;
        const stock = parseInt(document.getElementById('product-stock').value) || 1;
        
        // Show specific error messages
        if (!name) {
            alert('Please enter a product name');
            document.getElementById('product-name').focus();
            return;
        }
        
        if (!description) {
            alert('Please enter a product description');
            document.getElementById('product-description').focus();
            return;
        }
        
        if (!price || price <= 0) {
            alert('Please enter a valid price greater than 0');
            document.getElementById('product-price').focus();
            return;
        }
        
        if (!category) {
            alert('Please select a category');
            document.getElementById('product-category').focus();
            return;
        }
        
        if (!imageData) {
            alert('Please add a product image (upload or Google Drive)');
            return;
        }
        
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
        let message = '';
        
        if (productId) {
            // Update existing product
            success = updateProduct(parseInt(productId), productData);
            message = success ? 'Product updated successfully!' : 'Error updating product';
        } else {
            // Add new product
            const newId = addProduct(productData);
            success = !!newId;
            message = success ? 'Product added successfully!' : 'Error adding product';
        }
        
        if (success) {
            showNotification(message, 'success');
            loadAdminProducts();
            closeProductModal();
            
            // Update main store if open
            if (typeof loadProducts === 'function') {
                loadProducts();
            }
        } else {
            showNotification(message, 'error');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        alert('Error: ' + error.message);
    }
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'none';
    resetProductForm();
}

function loadAdminProducts() {
    const products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    const productsGrid = document.getElementById('admin-products-grid');
    const emptyState = document.getElementById('empty-state');
    const productCount = document.getElementById('product-count');
    
    if (!productsGrid || !emptyState || !productCount) return;
    
    // Update count
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
}

function confirmDeleteProduct(productId) {
    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    
    if (deleteModal && confirmDeleteBtn) {
        confirmDeleteBtn.setAttribute('data-product-id', productId);
        deleteModal.style.display = 'block';
    }
}

function showNotification(message, type = 'info') {
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
