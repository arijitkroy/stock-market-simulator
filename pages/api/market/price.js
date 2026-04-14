import { getStockPrice, getStockHistory } from "@/lib/market";

export default async function handler(req, res) {
  try {
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: "Symbol required" });
    }

    const price = await getStockPrice(symbol);
    const history = await getStockHistory(symbol);

    res.status(200).json({ price, history });
  } catch (err) {
    console.error("Market API Handler Error:", err);
    res.status(500).json({ error: "Failed to fetch real-time market data" });
  }
}