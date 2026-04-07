// --- CONFIGURATION ---
const API_URL = '/api/yampi'; // Proxy endpoint para Vercel/Netlify

// Dados Simulados (Mock) para quando a API não estiver configurada
const MOCK_PRODUCTS = [
  { id: 1, name: "EDIP Ghost Hoodie", price: 489.00, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800", sku: "GH01" },
  { id: 2, name: "Slate Cargo EDIP", price: 359.00, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800", sku: "SC01" },
  { id: 3, name: "Obsidian Denim V1", price: 429.00, image: "https://images.unsplash.com/photo-1520975916090-3105956dac50?q=80&w=800", sku: "OD01" },
  { id: 4, name: "EDIP Techno Jacket", price: 799.00, image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800", sku: "TJ01" }
];

// --- INTERNATIONALISATION ENGINE (i18n) ---
const TRANSLATIONS = {
  pt: {
    shopNow: 'Shop Now',
    loading: 'Carregando Coleção...',
    privacy: 'Política de privacidade',
    contact: 'Informações de contato',
    soldOut: 'Esgotado',
  },
  en: {
    shopNow: 'Shop Now',
    loading: 'Loading Collection...',
    privacy: 'Privacy policy',
    contact: 'Contact information',
    soldOut: 'Sold out',
  },
  es: {
    shopNow: 'Shop Now',
    loading: 'Cargando Colección...',
    privacy: 'Política de privacidad',
    contact: 'Información de contacto',
    soldOut: 'Agotado',
  }
};

const LANG_LABELS = {
  pt: '🇧🇷 Português',
  en: '🇺🇸 English',
  es: '🇪🇸 Español'
};

// Static exchange rates (base: BRL). Update periodically or connect to a live FX API post-launch.
const FX_RATES = {
  BRL: 1,
  USD: 0.18,
  EUR: 0.17,
  GBP: 0.14,
  ARS: 180,
  JPY: 27.5
};

const FX_LABELS = {
  BRL: '🇧🇷 R$ BRL',
  USD: '🇺🇸 $ USD',
  EUR: '🇪🇺 € EUR',
  GBP: '🇬🇧 £ GBP',
  ARS: '🇦🇷 ARS',
  JPY: '🇯🇵 ¥ JPY'
};

let currentLang     = 'pt';
let currentCurrency = 'BRL';
let currentSymbol   = 'R$';
let currentLocale   = 'pt-BR';
let currentProducts = [];

function setLanguage(lang) {
  currentLang = lang;
  document.getElementById('lang-label').textContent = LANG_LABELS[lang];
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es' : 'en';

  // Translate static data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (TRANSLATIONS[lang][key]) el.textContent = TRANSLATIONS[lang][key];
  });

  // Re-render to update "Soldout" labels etc.
  if (currentProducts.length) renderProducts(currentProducts);

  closeAllDropdowns();
}

function setCurrency(code, symbol, locale) {
  currentCurrency = code;
  currentSymbol   = symbol;
  currentLocale   = locale;
  document.getElementById('currency-label').textContent = FX_LABELS[code];
  if (currentProducts.length) renderProducts(currentProducts);
  closeAllDropdowns();
}

function convertPrice(brlPrice) {
  const rate = FX_RATES[currentCurrency] || 1;
  return brlPrice * rate;
}

function formatPrice(brlPrice) {
  const converted = convertPrice(brlPrice);
  try {
    return new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency: currentCurrency,
      maximumFractionDigits: currentCurrency === 'JPY' ? 0 : 2
    }).format(converted);
  } catch {
    return `${currentSymbol} ${converted.toFixed(2)}`;
  }
}

function toggleDropdown(id) {
  const menu = document.getElementById(id);
  const isOpen = menu.classList.contains('open');
  closeAllDropdowns();
  if (!isOpen) menu.classList.add('open');
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
}

// Close dropdowns when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.selector-dropdown')) closeAllDropdowns();
});


// --- SPLASH SCREEN TRANSITION ---
const enterBtn = document.getElementById('enter-experience');
const splash = document.getElementById('splash-screen');

enterBtn.addEventListener('click', () => {
  splash.classList.add('hidden');
  document.body.classList.remove('locked');
  
  // Show header and footer
  document.querySelector('header').classList.remove('hidden');
  document.getElementById('main-footer').classList.remove('hidden');

  // Load Products
  initStore();
});

// --- CATALOG ENGINE ---
async function initStore() {
  const container = document.getElementById('new');
  container.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Carregando Coleção...</p>';
  
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('API not available');
    
    const products = await response.json();
    renderProducts(products);
  } catch (err) {
    console.warn('API não encontrada. Usando dados simulados para demonstração.');
    renderProducts(MOCK_PRODUCTS);
  }
}

function renderProducts(products) {
  currentProducts = products; // Save state for currency/lang re-renders
  const container = document.getElementById('new');
  container.innerHTML = '';

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card reveal-on-scroll';

    card.innerHTML = `
      <div class="product-image-container">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <button class="add-to-cart-btn" onclick="addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})">
          + Adicionar
        </button>
      </div>
      <h3>${p.name}</h3>
      <p>${formatPrice(p.price)}</p>
    `;

    container.appendChild(card);
    observer.observe(card);
  });
}

// --- SCROLL REVEAL ANIMATIONS ---
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, observerOptions);

document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

// --- CART ENGINE ---
let cartItems = JSON.parse(localStorage.getItem('edip_cart') || '[]');

function saveCart() {
  localStorage.setItem('edip_cart', JSON.stringify(cartItems));
}

function addToCart(product) {
  const existing = cartItems.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cartItems.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartUI();
  openCart();
}

function removeFromCart(productId) {
  cartItems = cartItems.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
}

function changeQty(productId, delta) {
  const item = cartItems.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(productId);
  else { saveCart(); updateCartUI(); }
}

function updateCartUI() {
  const totalQty   = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  // Badge
  const badge = document.getElementById('cart-badge');
  badge.textContent = totalQty;
  badge.classList.toggle('visible', totalQty > 0);

  // Total
  document.getElementById('cart-total-price').textContent = formatPrice(totalPrice);

  // Items list
  const container = document.getElementById('cart-items');
  if (cartItems.length === 0) {
    container.innerHTML = `<div class="cart-empty"><span>🛍️</span><span>Seu carrinho está vazio</span></div>`;
    document.getElementById('checkout-btn').disabled = true;
    return;
  }

  document.getElementById('checkout-btn').disabled = false;

  container.innerHTML = cartItems.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${formatPrice(item.price)}</p>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="remove-item-btn" onclick="removeFromCart(${item.id})" aria-label="Remover">×</button>
    </div>
  `).join('');
}

function openCart()  {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  updateCartUI();
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

async function proceedToCheckout() {
  if (cartItems.length === 0) return;

  const btn = document.getElementById('checkout-btn');
  btn.textContent = 'Aguarde...';
  btn.disabled = true;

  try {
    // Call our secure API proxy to create a Yampi checkout session
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cartItems.map(i => ({ sku: i.sku, quantity: i.qty }))
      })
    });

    const data = await res.json();

    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch (err) {
    console.warn('Checkout proxy not available. Redirecting to Yampi directly.');
    // Fallback: Redirect to Yampi storefront if proxy isn't running
    const alias = 'SEU_ALIAS_AQUI'; // replaced automatically when .env is set
    window.location.href = `https://${alias}.checkout.yampi.com.br`;
  } finally {
    btn.textContent = 'Finalizar Compra';
    btn.disabled = false;
  }
}

// Init cart badge on load
updateCartUI();
