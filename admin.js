// Admin JavaScript with Image Upload
document.addEventListener('DOMContentLoaded', function() {
    // Authentication Check
    checkAdminAuth();
    
    // Initialize Admin Panel
    initAdminPanel();
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
    }
}

function initAdminPanel() {
    // Load products
    loadAdminProducts();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup image upload
    setupImageUpload();
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
    const base64Input = document.getElementById('product-image-base64');
    
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
            base64Input.value = '';
            fileInput.value = '';
        });
    }
    
    // Remove image button
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', function() {
            previewContainer.style.display = 'none';
            uploadArea.style.display = 'flex';
            base64Input.value = '';
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
        
        // Compress and convert image
        compressImage(file, function(compressedBase64) {
            // Show preview
            previewImage.src = compressedBase64;
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
                <p class="upload-tip">
                    <i class="fas fa-lightbulb"></i> 
                    Tip: Use good lighting and plain background
                </p>
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
            
            // Store Base64 in hidden input
            base64Input.value = compressedBase64;
        });
    }
}

function compressImage(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Max dimensions
            const maxWidth = 800;
            const maxHeight = 800;
            
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get compressed Base64 (quality: 0.8 = 80%)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            callback(compressedBase64);
        };
        
        img.onerror = function() {
            alert('Error loading image. Please try another image.');
            callback(event.target.result); // Use original if compression fails
        };
    };
    
    reader.onerror = function() {
        alert('Error reading file. Please try again.');
    };
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
    
    const previewContainer = document.getElementById('image-preview-container');
    const uploadArea = document.getElementById('upload-area');
    const base64Input = document.getElementById('product-image-base64');
    
    if (previewContainer) previewContainer.style.display = 'none';
    if (uploadArea) uploadArea.style.display = 'flex';
    if (base64Input) base64Input.value = '';
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
    const base64Input = document.getElementById('product-image-base64');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImage = document.getElementById('uploaded-preview');
    const uploadArea = document.getElementById('upload-area');
    
    if (product.image) {
        // Check if it's a Base64 image or URL
        if (product.image.startsWith('data:image')) {
            // It's a Base64 image
            base64Input.value = product.image;
            previewImage.src = product.image;
            previewContainer.style.display = 'block';
            uploadArea.style.display = 'none';
        } else {
            // It's a URL, we need to convert it to Base64
            // For simplicity, we'll just show the URL
            base64Input.value = product.image;
            previewImage.src = product.image;
            previewContainer.style.display = 'block';
            uploadArea.style.display = 'none';
        }
    }
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const imageBase64 = document.getElementById('product-image-base64').value;
    
    // Validate required fields
    const name = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const stock = parseInt(document.getElementById('product-stock').value) || 1;
    
    if (!name || !description || !price || !category) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (!imageBase64) {
        alert('Please upload a product image');
        return;
    }
    
    const productData = {
        name: name,
        description: description,
        price: price,
        category: category,
        stock: stock,
        image: imageBase64,
        dateAdded: new Date().toISOString()
    };
    
    if (productId) {
        // Update existing product
        if (updateProduct(parseInt(productId), productData)) {
            showNotification('Product updated successfully!', 'success');
            loadAdminProducts();
            closeProductModal();
        } else {
            showNotification('Error updating product', 'error');
        }
    } else {
        // Add new product
        const newId = addProduct(productData);
        if (newId) {
            showNotification('Product added successfully!', 'success');
            loadAdminProducts();
            closeProductModal();
            
            // Update main store if open
            if (typeof loadProducts === 'function') {
                loadProducts();
            }
        } else {
            showNotification('Error adding product', 'error');
        }
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
        
        productCard.innerHTML = `
            <div class="admin-product-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWUiLz48cGF0aCBkPSJNNzUgODVBNTAuMDAwMSA1MC4wMDAwMSAwIDEgMCA3NSAxODVBNTAuMDAwMSA1MC4wMDAwMSAwIDEgMCA3NSA4NVpNMTc1IDVIMjVWMjBIMTc1VjVaIiBmaWxsPSIjY2NjIi8+PC9zdmc+'">
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
    
    // Add styles
    const style = document.createElement('style');
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
    
    // Check if style already exists
    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
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
