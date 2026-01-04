// Admin JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    const authCheck = document.getElementById('admin-auth-check');
    
    if (!isAuthenticated) {
        authCheck.style.display = 'flex';
        
        const authSubmit = document.getElementById('auth-submit');
        const authPassword = document.getElementById('auth-password');
        const authError = document.getElementById('auth-error');
        const ADMIN_PASSWORD = 'admin123'; // Should be changed in production
        
        authSubmit.addEventListener('click', function() {
            if (authPassword.value === ADMIN_PASSWORD) {
                localStorage.setItem('adminAuthenticated', 'true');
                authCheck.style.display = 'none';
                loadAdminContent();
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
        loadAdminContent();
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-admin');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminAuthenticated');
            window.location.href = 'index.html';
        });
    }
});

function loadAdminContent() {
    // Load products table
    loadProductsTable();
    
    // Navigation between sections
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
            
            // Load orders if needed
            if (targetId === 'orders') {
                loadOrders();
            }
        });
    });
    
    // Add product button
    const addProductBtn = document.getElementById('add-product-btn');
    const productModal = document.getElementById('product-modal');
    const closeModal = document.querySelector('.close-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const productForm = document.getElementById('product-form');
    
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            document.getElementById('modal-title').textContent = 'Add New Product';
            document.getElementById('product-form').reset();
            document.getElementById('product-id').value = '';
            productModal.style.display = 'block';
        });
    }
    
    // Close modal
    const closeModalFunc = function() {
        productModal.style.display = 'none';
        productForm.reset();
    };
    
    if (closeModal) closeModal.addEventListener('click', closeModalFunc);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModalFunc);
    
    window.addEventListener('click', function(e) {
        if (e.target === productModal) {
            closeModalFunc();
        }
    });
    
    // Product form submission
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const productId = document.getElementById('product-id').value;
            const productData = {
                name: document.getElementById('product-name').value.trim(),
                description: document.getElementById('product-description').value.trim(),
                price: parseFloat(document.getElementById('product-price').value),
                category: document.getElementById('product-category').value,
                image: document.getElementById('product-image').value.trim()
            };
            
            // Validate required fields
            if (!productData.name || !productData.description || 
                !productData.price || !productData.category || !productData.image) {
                alert('Please fill in all required fields');
                return;
            }
            
            if (productId) {
                // Update existing product
                if (updateProduct(parseInt(productId), productData)) {
                    alert('Product updated successfully!');
                    loadProductsTable();
                    closeModalFunc();
                } else {
                    alert('Error updating product');
                }
            } else {
                // Add new product
                const newId = addProduct(productData);
                if (newId) {
                    alert('Product added successfully!');
                    loadProductsTable();
                    closeModalFunc();
                    
                    // Update main page if it's open
                    if (typeof loadProducts === 'function') {
                        loadProducts();
                    }
                } else {
                    alert('Error adding product');
                }
            }
        });
    }
}

// Load products into admin table
function loadProductsTable() {
    const tableBody = document.getElementById('products-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Get products from products.js
    const products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${product.image}" alt="${product.name}" class="product-table-image"
                     onerror="this.src='https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'">
            </td>
            <td>${product.name}</td>
            <td>${product.description}</td>
            <td>${product.category}</td>
            <td>R${product.price.toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-btn" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            if (confirm('Are you sure you want to delete this product?')) {
                if (deleteProduct(productId)) {
                    alert('Product deleted successfully!');
                    loadProductsTable();
                    
                    // Update main page if it's open
                    if (typeof loadProducts === 'function') {
                        loadProducts();
                    }
                } else {
                    alert('Error deleting product');
                }
            }
        });
    });
}

// Edit product function
function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('shopEasyProducts')) || [];
    const product = products.find(p => p.id === id);
    
    if (!product) {
        alert('Product not found');
        return;
    }
    
    // Populate the form with product data
    document.getElementById('modal-title').textContent = 'Edit Product';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-image').value = product.image;
    
    // Show the modal
    document.getElementById('product-modal').style.display = 'block';
}

// Load orders function
function loadOrders() {
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;
    
    // In a real application, you would fetch orders from a backend
    // For now, we'll show a message
    ordersContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-shopping-bag"></i>
            <h3>No orders yet</h3>
            <p>Orders will appear here when customers place them via email or WhatsApp</p>
            <p>Customers can contact you at:</p>
            <div style="margin-top: 20px;">
                <p><strong>Email:</strong> orders@shopeasy.com</p>
                <p><strong>WhatsApp:</strong> +27 12 345 6789</p>
            </div>
        </div>
    `;
}
