// Admin JavaScript with Google Drive Integration ONLY
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
    
    // Setup Google Drive upload only
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

function setupGoogleDriveUpload() {
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
    
    showDriveStatus('Converting Google Drive link...', 'loading');
    
    // SIMPLIFIED EXTRACTION - Use only what works
    let fileId = extractGoogleDriveFileId(driveLink);
    
    if (!fileId) {
        // Try direct ID if extraction fails
        if (driveLink.includes('/view') && driveLink.includes('/d/')) {
            const parts = driveLink.split('/d/')[1];
            if (parts) {
                fileId = parts.split('/')[0];
            }
        }
    }
    
    if (!fileId) {
        showDriveStatus('Could not extract file ID. Use this format:<br>https://drive.google.com/file/d/YOUR_FILE_ID/view', 'error');
        return;
    }
    
    // **USE THE PROPER DIRECT URL FORMAT:**
    const directImageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    console.log('File ID:', fileId);
    console.log('Direct URL:', directImageUrl);
    
    // **IMPORTANT: Don't test the image, just use it**
    // Google Drive images often don't preview in admin but work on main site
    drivePreviewImage.src = directImageUrl;
    drivePreviewContainer.style.display = 'block';
    imageDataInput.value = directImageUrl; // Save this URL
    
    showDriveStatus(
        '<i class="fas fa-check-circle"></i> Google Drive URL converted!<br>' +
        '<small>Note: Preview may not work in admin but will display on main site.</small>', 
        'success'
    );
}

// **SIMPLIFIED EXTRACTION FUNCTION:**
function extractGoogleDriveFileId(url) {
    console.log('Processing URL:', url);
    
    // Method 1: Standard /file/d/ID/view pattern
    const pattern1 = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match1 = url.match(pattern1);
    if (match1 && match1[1]) {
        console.log('Found with pattern1:', match1[1]);
        return match1[1];
    }
    
    // Method 2: /d/ID/ pattern
    const pattern2 = /\/d\/([a-zA-Z0-9_-]+)/;
    const match2 = url.match(pattern2);
    if (match2 && match2[1]) {
        console.log('Found with pattern2:', match2[1]);
        return match2[2];
    }
    
    console.log('No ID found');
    return null;
}




function testImageLoad(imageUrl) {
    const driveStatus = document.getElementById('drive-status');
    const drivePreviewContainer = document.getElementById('drive-preview-container');
    const drivePreviewImage = document.getElementById('drive-preview-image');
    const imageDataInput = document.getElementById('product-image-data');
    
    console.log('Testing image load:', imageUrl);
    
    // Create a CORS proxy URL
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
    console.log('Using proxy URL:', proxyUrl);
    
    const img = new Image();
    
    img.onload = function() {
        console.log('✅ Image loaded successfully via proxy!');
        
        // IMPORTANT: Save the ORIGINAL Google Drive URL, not proxy URL
        drivePreviewImage.src = imageUrl; // Use original URL for preview
        drivePreviewContainer.style.display = 'block';
        
        // Save the ORIGINAL Google Drive URL
        imageDataInput.value = imageUrl;
        
        showDriveStatus('<i class="fas fa-check-circle"></i> Google Drive image loaded successfully!', 'success');
    };
    
    img.onerror = function() {
        console.log('❌ Image failed to load even with proxy');
        console.log('Testing without proxy as fallback...');
        
        // Try without proxy as fallback
        const img2 = new Image();
        img2.onload = function() {
            console.log('✅ Image loads without proxy!');
            drivePreviewImage.src = imageUrl;
            drivePreviewContainer.style.display = 'block';
            imageDataInput.value = imageUrl;
            showDriveStatus('<i class="fas fa-check-circle"></i> Google Drive image loaded successfully!', 'success');
        };
        img2.onerror = function() {
            console.log('❌ Both methods failed');
            
            // Even if preview fails, still save the URL
            // Google Drive links often work on the main site even if preview fails
            imageDataInput.value = imageUrl;
            
            showDriveStatus(
                '<i class="fas fa-exclamation-triangle"></i> Preview failed but URL saved.<br>' +
                '<strong>Note:</strong> Google Drive images may not preview but will work on the main site.<br><br>' +
                '<a href="' + imageUrl + '" target="_blank" style="color: #4285f4; text-decoration: underline;">' +
                'Click to test link directly</a><br><br>' +
                '<button onclick="forceSaveImage(\'' + imageUrl + '\')" style="background: #4caf50; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">' +
                'Save Anyway</button>', 
                'warning'
            );
            
            drivePreviewContainer.style.display = 'none';
        };
        img2.src = imageUrl;
    };
    
    // Start loading with proxy first
    img.src = proxyUrl;
}

// helper function
function forceSaveImage(imageUrl) {
    const imageDataInput = document.getElementById('product-image-data');
    const drivePreviewContainer = document.getElementById('drive-preview-container');
    const drivePreviewImage = document.getElementById('drive-preview-image');
    const driveStatus = document.getElementById('drive-status');
    
    imageDataInput.value = imageUrl;
    drivePreviewImage.src = imageUrl;
    drivePreviewContainer.style.display = 'block';
    
    showDriveStatus('<i class="fas fa-check-circle"></i> URL saved successfully!', 'success');
    
    // Clear the warning message
    setTimeout(() => {
        driveStatus.style.display = 'none';
    }, 3000);
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
        
        if (!price || price <= 0 || isNaN(price)) {
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
            alert('Please add a product image from Google Drive');
            return;
        }
        
        // Debug log
        console.log('Submitting product data:', {
            id: productId,
            name: name,
            price: price,
            category: category,
            image: imageData.substring(0, 50) + '...'
        });
        
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
            console.log('Updating product ID:', productId);
            success = updateProduct(parseInt(productId), productData);
            message = success ? 'Product updated successfully!' : 'Error updating product';
        } else {
            // Add new product
            console.log('Adding new product');
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
            console.error('Save failed. Check console for details.');
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
