import { db } from "@/lib/firebaseAdmin";
import { verifyUser } from "@/lib/auth";
import { getStockPrice } from "@/lib/market";

export default async function handler(req, res) {
  try {
    const user = await verifyUser(req);

    const portfolioSnap = await db.collection("portfolios").doc(user.uid).get();
    const userSnap = await db.collection("users").doc(user.uid).get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: "User profile not found. Please log in again." });
    }

    const userData = userSnap.data();
    const portfolioData = portfolioSnap.exists ? portfolioSnap.data() : { holdings: [] };
    const rawHoldings = portfolioData.holdings || [];

    const enrichedHoldings = await Promise.all(rawHoldings.map(async (h) => {
      try {
        const currentPrice = await getStockPrice(h.symbol);
        return {
          ...h,
          currentPrice,
          totalValue: currentPrice * h.quantity,
          profit: (currentPrice - (h.avgPrice || 0)) * h.quantity
        };
      } catch (e) {
        return { ...h, currentPrice: null, totalValue: 0, profit: 0 };
      }
    }));

    res.status(200).json({
      holdings: enrichedHoldings,
      balance: userData.balance ?? 0,
      email: userData.email,
    });

  } catch (err) {
    console.error("Portfolio API Error:", err);
    res.status(err.message === "Unauthorized" ? 401 : 400).json({ 
      error: err.message || "Internal Server Error" 
    });
  }
}