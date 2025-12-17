document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    renderShop();

    // Instant update listener
    window.addEventListener('localizationUpdated', () => {
        renderShop();
    });
});

function renderShop() {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    grid.innerHTML = ''; // Clear existing content

    // --- Check LocalStorage first ---
    let displayProducts = products; // Default from js/products.js
    const storedProducts = localStorage.getItem('edip_products');
    if (storedProducts) {
        try {
            displayProducts = JSON.parse(storedProducts);
            // console.log('Loaded products from LocalStorage');
        } catch (e) {
            console.error('Error loading from LocalStorage, reverting to default', e);
        }
    }

    displayProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Badge Logic
        let badgeHTML = '';
        if (product.badge) {
            const badgeClass = product.badge.toLowerCase().replace(' ', '-');
            const t_soldout = (typeof Localization !== 'undefined') ? Localization.translations[Localization.currentLang]['product_sold_out'] : 'SOLD OUT';
            const displayBadge = product.badge === 'SOLD OUT' ? t_soldout : product.badge;
            badgeHTML = `<span class="product-badge ${badgeClass}">${displayBadge}</span>`;
        }

        // Price Logic
        const format = (val) => (typeof Localization !== 'undefined') ? Localization.formatPrice(val) : `R$ ${val.toFixed(2)}`;

        let priceHTML = `<span class="current-price">${format(product.price)}</span>`;

        if (product.originalPrice) {
            priceHTML = `
                <span class="old-price">${format(product.originalPrice)}</span>
                ${priceHTML}
            `;
        }

        // Button Logic
        let buttonHTML = '';
        const t_view = (typeof Localization !== 'undefined') ? Localization.translations[Localization.currentLang]['btn_view_details'] : 'VIEW DETAILS';

        if (product.status === 'sold_out') {
            const t_sold = (typeof Localization !== 'undefined') ? Localization.translations[Localization.currentLang]['product_sold_out'] : 'SOLD OUT';
            buttonHTML = `<button class="add-to-cart-btn" disabled>${t_sold}</button>`;
        } else {
            buttonHTML = `
                <button class="add-to-cart-btn" 
                    onclick="window.location.href='product.html?id=${product.id}'">
                    ${t_view}
                </button>
            `;
        }

        card.innerHTML = `
            <div class="product-image-container" onclick="window.location.href='product.html?id=${product.id}'" style="cursor:pointer;">
                ${badgeHTML}
                <img src="${product.image}" alt="${product.title}" class="product-image">
            </div>
            <div class="product-info">
                <h3 class="product-title" onclick="window.location.href='product.html?id=${product.id}'" style="cursor:pointer;">${product.title}</h3>
                <div class="product-price">
                    ${priceHTML}
                </div>
                ${buttonHTML}
            </div>
        `;

        grid.appendChild(card);
    });
}
