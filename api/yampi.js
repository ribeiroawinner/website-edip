// API Proxy for Yampi - Designed for Vercel/Netlify Serverless Functions
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const ALIAS = process.env.YAMPI_ALIAS;
  const TOKEN = process.env.YAMPI_TOKEN;
  const SECRET = process.env.YAMPI_SECRET;

  if (!ALIAS || !TOKEN || !SECRET) {
    return res.status(500).json({ error: 'Yampi credentials not configured in Environment Variables.' });
  }

  const endpoint = `https://api.yampi.com.br/v2/${ALIAS}/catalog/products`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'User-Token': TOKEN,
        'User-Secret-Key': SECRET,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Yampi API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return only necessary data to the frontend for security and performance
    const streamlinedProducts = data.data.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price_sale,
      image: p.images && p.images.data.length > 0 ? p.images.data[0].url : null,
      url: p.url,
      sku: p.sku
    }));

    res.status(200).json(streamlinedProducts);
  } catch (error) {
    console.error('Yampi API Error:', error);
    res.status(500).json({ error: 'Failed to fetch products from Yampi.' });
  }
};
