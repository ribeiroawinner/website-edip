// Product Details Page Logic

let currentProduct = null;
let currentQty = 1;
let selectedSize = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'shop.html';
        return;
    }

    // 2. Load Product Data (Check LocalStorage then default)
    let allProducts = products;
    const stored = localStorage.getItem('edip_products');
    if (stored) {
        try { allProducts = JSON.parse(stored); } catch (e) { }
    }

    currentProduct = allProducts.find(p => p.id === productId);

    if (!currentProduct) {
        document.body.innerHTML = "<h1>Product not found</h1><a href='shop.html'>Back to Shop</a>";
        return;
    }

    // 3. Render Content
    renderProduct();
    setupEvents();

    // Initialize Cart (from cart.js)
    if (window.Cart) Cart.init();

    // Reactive Update
    window.addEventListener('localizationUpdated', () => {
        renderProduct();
    });
});

function renderProduct() {
    // Title & Price
    document.getElementById('p-title').textContent = currentProduct.title;
    document.title = `${currentProduct.title} - EDIP®`;

    const formattedPrice = (typeof Localization !== 'undefined')
        ? Localization.formatPrice(currentProduct.price)
        : currentProduct.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    document.getElementById('p-price').textContent = formattedPrice;

    // Status
    const statusBadge = document.getElementById('p-status');
    const addBtn = document.getElementById('add-btn-lg');

    // Translation logic
    const t_sold = (typeof Localization !== 'undefined') ? Localization.translations[Localization.currentLang]['product_sold_out'] : 'SOLD OUT';
    const t_add = (typeof Localization !== 'undefined') ? Localization.translations[Localization.currentLang]['product_add'] : 'ADD TO CART';

    addBtn.textContent = t_add;

    if (currentProduct.status === 'sold_out') {
        statusBadge.classList.remove('hidden');
        statusBadge.textContent = t_sold;
        addBtn.disabled = true;
        addBtn.textContent = t_sold;
    } else if (currentProduct.status === 'hidden') {
        window.location.href = 'shop.html';
    }

    // Gallery
    const galleryContainer = document.getElementById('p-gallery');

    // Clear previous if any
    galleryContainer.innerHTML = '';

    // Main Image
    const mainImg = document.createElement('img');
    mainImg.src = currentProduct.image;
    mainImg.className = 'main-image';
    mainImg.id = 'main-img-display';

    // Thumbs container
    const thumbsDiv = document.createElement('div');
    thumbsDiv.className = 'gallery-thumbs';

    // Add Main immage as first thumb
    const thumb1 = createThumb(currentProduct.image, true);
    thumbsDiv.appendChild(thumb1);

    // Add PLACEHOLDER thumbs (since our data structure only has 1 image per product for now)
    // In a real scenario, product.images would be an array.
    // Let's add 2 fake alternate angles for visual demo if needed, or just the one.
    // For now, just duplicate the main one to show the gallery layout logic
    thumbsDiv.appendChild(createThumb(currentProduct.image, false));
    thumbsDiv.appendChild(createThumb(currentProduct.image, false));

    galleryContainer.appendChild(mainImg);
    galleryContainer.appendChild(thumbsDiv);

    // Update texts if Localization exists
    if (typeof Localization !== 'undefined') Localization.applyTranslations();
}

function createThumb(src, isActive) {
    const img = document.createElement('img');
    img.src = src;
    img.className = `thumb ${isActive ? 'active' : ''}`;
    img.onclick = () => {
        document.getElementById('main-img-display').src = src;
        document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
        img.classList.add('active');
    };
    return img;
}

// Global functions for events
window.updateQty = (change) => {
    const newQty = currentQty + change;
    if (newQty >= 1) {
        currentQty = newQty;
        document.getElementById('qty-display').textContent = currentQty;
    }
};

window.toggleAccordion = (btn) => {
    const content = btn.nextElementSibling;
    const span = btn.querySelector('span');

    // Toggle
    if (content.style.maxHeight) {
        content.style.maxHeight = null; // Close
        content.classList.remove('open');
        span.textContent = '+';
    } else {
        content.style.maxHeight = content.scrollHeight + "px"; // Open
        content.classList.add('open');
        span.textContent = '-';
    }
};

function setupEvents() {
    // Size Selection
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSize = btn.dataset.size;
        });
    });

    // Validated Add to Cart
    document.getElementById('add-btn-lg').addEventListener('click', () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }

        // Add to Cart Logic
        for (let i = 0; i < currentQty; i++) {
            Cart.addItem({
                id: currentProduct.id,
                title: currentProduct.title,
                price: currentProduct.price, // Numeric Price BRL
                image: currentProduct.image,
                size: selectedSize
            });
        }

    });
}
