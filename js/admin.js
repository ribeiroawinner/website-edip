document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize State
    // Default to file data, but override with LocalStorage if exists
    let localProducts = [...products];

    const stored = localStorage.getItem('edip_products');
    if (stored) {
        try {
            localProducts = JSON.parse(stored);
        } catch (e) { console.error(e); }
    }

    // --- UI Elements ---
    const tbody = document.getElementById('admin-product-list');
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    // Save is now Global in Topbar
    const saveBtn = document.getElementById('save-global-btn');

    // View switching
    const views = {
        dashboard: document.getElementById('view-dashboard'),
        products: document.getElementById('view-products')
    };
    const navItems = document.querySelectorAll('.nav-item[data-tab]');

    // Feature: Add Btn is in Products View
    const addBtn = document.getElementById('add-product-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const closeModal = document.querySelector('.close-modal');

    // --- NAVIGATION ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.dataset.tab;

            // Update Menu
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Update View
            Object.values(views).forEach(v => v.classList.add('hidden'));
            views[target].classList.remove('hidden');
            views[target].classList.add('active');

            // Update Title
            const titleMap = { dashboard: 'Visão Geral', products: 'Produtos' };
            document.getElementById('page-title').textContent = titleMap[target];
        });
    });

    // --- STATS LOGIC ---
    function updateStats() {
        document.getElementById('stat-total').textContent = localProducts.length;
        document.getElementById('stat-active').textContent = localProducts.filter(p => p.status === 'active').length;
        document.getElementById('stat-soldout').textContent = localProducts.filter(p => p.status === 'sold_out').length;
    }

    // --- RENDER ---
    function render() {
        tbody.innerHTML = '';
        localProducts.forEach(product => {
            const tr = document.createElement('tr');

            // Status Badge
            const statusClass = `status-${product.status}`;
            const statusLabel = product.status === 'active' ? 'Ativo' : (product.status === 'sold_out' ? 'Esgotado' : 'Oculto');

            tr.innerHTML = `
                <td><img src="${product.image}" class="product-thumb" alt="img"></td>
                <td>
                    <div style="font-weight: 500;">${product.title}</div>
                    <div style="font-size: 0.8rem; color: #888;">ID: ${product.id}</div>
                </td>
                <td><span class="badge-status ${statusClass}">${statusLabel}</span></td>
                <td>R$ ${product.price.toFixed(2)}</td>
                <td class="text-right">
                    <button class="btn-icon" onclick="openEdit('${product.id}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-icon" style="color:#fa5c7c;" onclick="deleteProduct('${product.id}')">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        updateStats();
    }

    // --- ACTIONS ---
    window.openEdit = (id) => {
        const product = localProducts.find(p => p.id === id);
        if (!product) return;

        document.getElementById('modal-title').textContent = 'Edit Product';
        document.getElementById('edit-id').value = product.id;
        document.getElementById('edit-title').value = product.title;
        document.getElementById('edit-price').value = product.price;
        document.getElementById('edit-original-price').value = product.originalPrice || '';
        document.getElementById('edit-image').value = product.image;
        document.getElementById('edit-badge').value = product.badge || '';
        document.getElementById('edit-status').value = product.status;

        modal.classList.remove('hidden');
    };

    window.deleteProduct = (id) => {
        if (confirm('Are you sure?')) {
            localProducts = localProducts.filter(p => p.id !== id);
            render();
        }
    };

    addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('modal-title').textContent = 'New Product';
        document.getElementById('edit-id').value = ''; // Empty ID = New
        // Generate a random ID for now
        modal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => modal.classList.add('hidden'));
    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

    // --- SAVE FORM ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('edit-id').value;
        const title = document.getElementById('edit-title').value;
        const price = parseFloat(document.getElementById('edit-price').value);
        const originalPriceVal = document.getElementById('edit-original-price').value;
        const originalPrice = originalPriceVal ? parseFloat(originalPriceVal) : null;
        const image = document.getElementById('edit-image').value;
        const badge = document.getElementById('edit-badge').value || null;
        const status = document.getElementById('edit-status').value;

        if (id) {
            // Edit existing
            const index = localProducts.findIndex(p => p.id === id);
            if (index !== -1) {
                localProducts[index] = { id, title, price, originalPrice, image, badge, status };
            }
        } else {
            // New
            const newId = Date.now().toString(); // simple ID gen
            localProducts.push({ id: newId, title, price, originalPrice, image, badge, status });
        }

        modal.classList.add('hidden');
        render();
    });

    // --- SAVE logic (LocalStorage) ---
    saveBtn.addEventListener('click', () => {
        // 1. Save to Browser Memory (Instant)
        localStorage.setItem('edip_products', JSON.stringify(localProducts));

        // 2. Alert User
        alert('SUCCESS! \n\nProducts updated in THIS browser.\nCheck the SHOP page to see changes.\n\n(Note: To make these changes permanent for everyone, use the "Export Code" feature later)');
    });

    // --- BTN: EXPORT CODE (Hidden or Secondary now) ---
    // If you want to add a specific button for code export, we can add it later.
    // For now, "Save" does what the user asked: works instantly locally.

    render();
});
