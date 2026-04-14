import { searchSymbols } from "@/lib/market";

export default async function handler(req, res) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const results = await searchSymbols(q);
    res.status(200).json({ results });
  } catch (err) {
    res.status(err.message === "Market API key not configured" ? 401 : 500).json({ 
      error: err.message || "Failed to perform market search" 
    });
  }
}
