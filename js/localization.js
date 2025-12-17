const Localization = {
    currentCurrency: 'BRL',
    currentLang: 'PORTUGUÊS',

    rates: {
        'BRL': 1,
        'USD': 0.19, // Approx rate
        'EUR': 0.17  // Approx rate
    },

    currencySymbols: {
        'BRL': 'R$',
        'USD': '$',
        'EUR': '€'
    },

    translations: {
        'PORTUGUÊS': {
            'nav_shop': 'SHOP',
            'nav_lookbook': 'LOOKBOOK',
            'nav_contact': 'CONTATO',
            'nav_community': 'COMUNIDADE',
            'cart_title': 'SEU CARRINHO',
            'cart_subtotal': 'SUBTOTAL',
            'cart_checkout': 'FINALIZAR',
            'cart_empty': 'Seu carrinho está vazio.',
            'footer_currency': 'MOEDA',
            'footer_language': 'IDIOMA',
            'footer_terms': 'TERMOS E POLÍTICAS',
            'footer_privacy': 'POLÍTICA DE PRIVACIDADE',
            'footer_returns': 'TROCAS E DEVOLUÇÕES',
            'footer_contact': 'CONTATO',
            'footer_terms_use': 'TERMOS DE USO',
            'product_tax': 'Impostos incluídos.',
            'product_add': 'ADICIONAR AO CARRINHO',
            'product_sold_out': 'ESGOTADO',
            'product_desc': 'Descrição',
            'product_delivery': 'Entrega',
            'product_material': 'Material',
            'product_size': 'Guia de Tamanhos',
            'shop_latest': 'ÚLTIMOS DROPS',
            'btn_view_details': 'VER DETALHES',
            'admin_back': 'Sair (Ir para Loja)'
        },
        'ENGLISH': {
            'nav_shop': 'SHOP',
            'nav_lookbook': 'LOOKBOOK',
            'nav_contact': 'CONTACT',
            'nav_community': 'COMMUNITY',
            'cart_title': 'YOUR CART',
            'cart_subtotal': 'SUBTOTAL',
            'cart_checkout': 'CHECKOUT',
            'cart_empty': 'Your cart is empty.',
            'footer_currency': 'CURRENCY',
            'footer_language': 'LANGUAGE',
            'footer_terms': 'TERMS & POLICIES',
            'footer_privacy': 'PRIVACY POLICY',
            'footer_returns': 'RETURNS',
            'footer_contact': 'CONTACT',
            'footer_terms_use': 'TERMS OF USE',
            'product_tax': 'Tax included.',
            'product_add': 'ADD TO CART',
            'product_sold_out': 'SOLD OUT',
            'product_desc': 'Description',
            'product_delivery': 'Delivery',
            'product_material': 'Material',
            'product_size': 'Size Guide',
            'shop_latest': 'LATEST DROPS',
            'btn_view_details': 'VIEW DETAILS',
            'admin_back': 'Exit (Go to Shop)'
        },
        'FRANÇAIS': {
            'nav_shop': 'BOUTIQUE',
            'nav_lookbook': 'LOOKBOOK',
            'nav_contact': 'CONTACT',
            'nav_community': 'COMMUNAUTÉ',
            'cart_title': 'VOTRE PANIER',
            'cart_subtotal': 'SOUS-TOTAL',
            'cart_checkout': 'PAIEMENT',
            'cart_empty': 'Votre panier est vide.',
            'footer_currency': 'DEVISE',
            'footer_language': 'LANGUE',
            'footer_terms': 'TERMES ET POLITIQUES',
            'footer_privacy': 'POLITIQUE DE CONFIDENTIALITÉ',
            'footer_returns': 'RETOURS',
            'footer_contact': 'CONTACT',
            'footer_terms_use': 'CONDITIONS D\'UTILISATION',
            'product_tax': 'Taxes incluses.',
            'product_add': 'AJOUTER AU PANIER',
            'product_sold_out': 'ÉPUISÉ',
            'product_desc': 'Description',
            'product_delivery': 'Livraison',
            'product_material': 'Matériel',
            'product_size': 'Guide des Tailles',
            'shop_latest': 'DERNIERS DROPS',
            'btn_view_details': 'VOIR DÉTAILS',
            'admin_back': 'Sortir (Aller à la boutique)'
        }
    },

    init() {
        const storedCurr = localStorage.getItem('edip_currency');
        const storedLang = localStorage.getItem('edip_lang');

        if (storedCurr) this.currentCurrency = storedCurr;
        if (storedLang) this.currentLang = storedLang;

        this.updateSelectors();
        this.applyTranslations();
        this.setupListeners();

        // Dispatch event for other scripts to update prices/texts if needed
        window.dispatchEvent(new Event('localizationUpdated'));
    },

    setupListeners() {
        const currencySel = document.getElementById('currency-selector');
        const langSel = document.getElementById('lang-selector');

        if (currencySel) {
            currencySel.value = this.currentCurrency; // Set initial value (might be textual matching)
            // Need to match option text logic if easier, but value attribute is cleaner.
            // Assuming we will update HTML to have values.

            currencySel.addEventListener('change', (e) => {
                this.setCurrency(e.target.value);
            });
        }

        if (langSel) {
            langSel.value = this.currentLang;
            langSel.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    },

    setCurrency(currency) {
        // Handle "BRL" vs "BRAZIL (BRL R$)" if select options are complex
        const code = currency.substring(0, 3);

        if (this.rates[code]) {
            this.currentCurrency = code;
            localStorage.setItem('edip_currency', code);

            // dispatch event
            window.dispatchEvent(new Event('localizationUpdated'));
        }
    },

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('edip_lang', lang);
        this.applyTranslations();

        // dispatch event
        window.dispatchEvent(new Event('localizationUpdated'));
    },

    updateSelectors() {
        const currencySel = document.getElementById('currency-selector');
        const langSel = document.getElementById('lang-selector');

        if (currencySel) {
            currencySel.value = this.currentCurrency;
        }

        if (langSel) {
            langSel.value = this.currentLang;
        }
    },

    applyTranslations() {
        const t = this.translations[this.currentLang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                if (el.tagName === 'INPUT' && el.type === 'placeholder') {
                    el.placeholder = t[key];
                } else {
                    el.textContent = t[key];
                }
            }
        });
    },

    formatPrice(valueInBRL) {
        if (typeof valueInBRL !== 'number') {
            valueInBRL = parseFloat(valueInBRL);
        }

        const rate = this.rates[this.currentCurrency];
        const converted = valueInBRL * rate;
        const symbol = this.currencySymbols[this.currentCurrency];

        return converted.toLocaleString(
            this.currentLang === 'PORTUGUÊS' ? 'pt-BR' : 'en-US',
            { style: 'currency', currency: this.currentCurrency }
        );
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Localization.init();
});
