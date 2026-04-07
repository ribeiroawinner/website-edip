// Serverless function: Creates a Yampi checkout session and returns the redirect URL
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ALIAS  = process.env.YAMPI_ALIAS;
  const TOKEN  = process.env.YAMPI_TOKEN;
  const SECRET = process.env.YAMPI_SECRET;

  if (!ALIAS || !TOKEN || !SECRET) {
    return res.status(500).json({ error: 'Yampi credentials not configured.' });
  }

  const { items } = req.body; // [{ sku, quantity }]

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  try {
    // Step 1: Fetch SKU IDs from Yampi using SKU codes
    const skuRes = await fetch(`https://api.yampi.com.br/v2/${ALIAS}/catalog/skus`, {
      headers: {
        'User-Token': TOKEN,
        'User-Secret-Key': SECRET,
        'Accept': 'application/json'
      }
    });

    const skuData = await skuRes.json();
    const skuMap  = {};
    (skuData.data || []).forEach(s => { skuMap[s.sku] = s.id; });

    // Step 2: Map cart items to Yampi SKU IDs
    const yampiItems = items
      .filter(i => skuMap[i.sku])
      .map(i => ({ sku_id: skuMap[i.sku], quantity: i.quantity }));

    if (yampiItems.length === 0) {
      throw new Error('No matching SKUs found in Yampi.');
    }

    // Step 3: Create a Yampi order/cart session
    const orderRes = await fetch(`https://api.yampi.com.br/v2/${ALIAS}/orders`, {
      method: 'POST',
      headers: {
        'User-Token': TOKEN,
        'User-Secret-Key': SECRET,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ items: yampiItems })
    });

    const orderData = await orderRes.json();

    // Step 4: Get the payment link / checkout URL
    const orderId = orderData.data?.id;
    if (!orderId) throw new Error('Could not create order in Yampi.');

    const linkRes = await fetch(
      `https://api.yampi.com.br/v2/${ALIAS}/checkout/payment-link/${orderId}`,
      {
        headers: {
          'User-Token': TOKEN,
          'User-Secret-Key': SECRET,
          'Accept': 'application/json'
        }
      }
    );

    const linkData = await linkRes.json();
    const checkout_url = linkData.data?.link_url || `https://${ALIAS}.checkout.yampi.com.br`;

    return res.status(200).json({ checkout_url });

  } catch (error) {
    console.error('Checkout Error:', error.message);
    // Graceful fallback: send user to Yampi storefront
    return res.status(200).json({
      checkout_url: `https://${ALIAS}.checkout.yampi.com.br`
    });
  }
};
