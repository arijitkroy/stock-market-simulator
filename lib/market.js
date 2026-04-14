async function getYahooData(symbol, interval = '5m', range = '1d') {
  try {
    const res = await fetch(`${process.env.API_URL}/chart/${symbol}?interval=${interval}&range=${range}`);
    const data = await res.json();
    
    if (data.chart && data.chart.result && data.chart.result[0]) {
      return data.chart.result[0];
    }
    throw new Error(`Symbol ${symbol} not found or API error`);
  } catch (err) {
    console.error(`Market API Error for ${symbol}:`, err.message);
    throw err;
  }
}

export async function getStockPrice(symbol) {
  const data = await getYahooData(symbol, '1m', '1d');
  return data.meta.regularMarketPrice;
}

export async function getStockHistory(symbol, points = 30) {
  const data = await getYahooData(symbol, '5m', '1d');
  const quotes = data.indicators.quote[0];
  const timestamps = data.timestamp;

  return timestamps
    .map((t, i) => ({
      time: new Date(t * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: quotes.close[i]
    }))
    .filter(p => p.price !== null)
    .slice(-points);
}

export async function getSupportedSymbols() {
  return [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "TSLA", name: "Tesla, Inc." },
    { symbol: "NVDA", name: "NVIDIA Corp." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "BTC-USD", name: "Bitcoin" },
    { symbol: "RELIANCE.NS", name: "Reliance Industries" },
    { symbol: "ETH-USD", name: "Ethereum" },
    { symbol: "GOOGL", name: "Alphabet Inc." },
  ];
}

export async function searchSymbols(query) {
  try {
    const res = await fetch(`${process.env.API_URL}/search?q=${query}`);
    const data = await res.json();
    
    if (data.quotes) {
      return data.quotes.map(item => ({
        symbol: item.symbol,
        name: item.shortname || item.longname || item.symbol,
        type: item.quoteType
      }));
    }
    return [];
  } catch (err) {
    console.error(`Search API Error for ${query}:`, err.message);
    return [];
  }
}