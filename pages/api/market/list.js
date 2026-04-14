import { getSupportedSymbols } from "@/lib/market";

export default async function handler(req, res) {
  try {
    const symbols = await getSupportedSymbols();
    res.status(200).json({ symbols });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch symbols" });
  }
}
